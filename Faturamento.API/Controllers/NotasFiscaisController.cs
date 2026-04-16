using Faturamento.API.Data;
using Faturamento.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;

namespace Faturamento.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly FaturamentoDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        // Injeta o DB e o criador de requisições HTTP
        public NotasFiscaisController(FaturamentoDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

       [HttpPost("emitir")]
        public async Task<IActionResult> EmitirNota([FromBody] NotaFiscal notaFiscal)
        {
            // 1. Proteção de Idempotência (Perfeito, mantemos isso!)
            if (!string.IsNullOrEmpty(notaFiscal.ChaveIdempotencia))
            {
                var notaExistente = await _context.NotasFiscais
                    .Include(n => n.Itens) 
                    .FirstOrDefaultAsync(n => n.ChaveIdempotencia == notaFiscal.ChaveIdempotencia);
                
                if (notaExistente != null)
                    return Ok(notaExistente); 
            }

            // 2. Calcula o Número Sequencial
            var ultimoNumero = await _context.NotasFiscais
                .OrderByDescending(n => n.Id)
                .Select(n => n.NumeroSequencial)
                .FirstOrDefaultAsync();

            // 3. Prepara a nota para salvar (Aplicamos direto no objeto que chegou)
            notaFiscal.NumeroSequencial = ultimoNumero + 1;
            notaFiscal.Status = "Aberta";
            // notaFiscal.DataCriacao = DateTime.UtcNow; // Descomente se você tiver esse campo na sua model

            // 4. Salva a nota no banco de dados
            _context.NotasFiscais.Add(notaFiscal);
            await _context.SaveChangesAsync(); 

            // FIM! Não tem comunicação com estoque aqui. Ele retorna a nota Aberta.
            return Ok(notaFiscal);
        }
        [HttpGet]
        public async Task<IActionResult> ListarNotas()
        {
            var notas = await _context.NotasFiscais.Include(n => n.Itens).ToListAsync();
            return Ok(notas);
        }

        [HttpPost("{id}/imprimir")]
        public async Task<IActionResult> ImprimirNota(int id)
        {
            // Busca a nota no banco com os itens dela
            var nota = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);
            
            if (nota == null) return NotFound("Nota não encontrada.");
            if (nota.Status != "Aberta") return BadRequest("A nota já está fechada.");

            // Prepara a chamada para o microsserviço de Estoque
            var client = _httpClientFactory.CreateClient(); 
            
            foreach (var item in nota.Itens)
            {
                var content = new StringContent(item.Quantidade.ToString(), Encoding.UTF8, "application/json");
                
                
                var response = await client.PutAsync($"http://localhost:5034/api/produtos/{item.ProdutoId}/baixar-estoque", content);

                if (!response.IsSuccessStatusCode)
                {
                    var erro = await response.Content.ReadAsStringAsync();
                    return BadRequest($"Erro no Estoque: {erro}");
                }
            }

            // Se deu tudo certo no estoque, FECHA A NOTA e salva!
            nota.Status = "Fechada";
            await _context.SaveChangesAsync();

            return Ok(nota);
        }
    }

}