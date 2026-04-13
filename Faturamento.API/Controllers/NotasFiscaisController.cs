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

        // Injetamos o Banco de Dados e o Criador de requisições HTTP
        public NotasFiscaisController(FaturamentoDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("emitir")]
        public async Task<IActionResult> EmitirNota([FromBody] NotaFiscal notaFiscal)
        {
            // 1. Opcional C: Proteção de Idempotência
            if (!string.IsNullOrEmpty(notaFiscal.ChaveIdempotencia))
            {
                var notaExistente = await _context.NotasFiscais
                    .Include(n => n.Itens) // <--- CORREÇÃO AQUI: Agora ele traz os itens do banco!
                    .FirstOrDefaultAsync(n => n.ChaveIdempotencia == notaFiscal.ChaveIdempotencia);
                
                if (notaExistente != null)
                    return Ok(notaExistente); // Se o usuário clicou duas vezes, devolve a mesma nota completa
            }

            // 2. Salva a nota inicialmente como "Aberta"
            notaFiscal.Status = "Aberta";
            _context.NotasFiscais.Add(notaFiscal);
            await _context.SaveChangesAsync(); // Importante: Salva aqui para gerar o ID da Nota

            // 3. Comunicação com o Microsserviço de Estoque
            var client = _httpClientFactory.CreateClient("EstoqueAPI");
            
            foreach (var item in notaFiscal.Itens)
            {
                // Prepara o corpo da requisição (a quantidade que queremos comprar)
                var content = new StringContent(item.Quantidade.ToString(), Encoding.UTF8, "application/json");

                // Faz a chamada PUT para o Estoque.API
                var response = await client.PutAsync($"/api/produtos/{item.ProdutoId}/baixar-estoque", content);

                if (!response.IsSuccessStatusCode)
                {
                    // Se faltar saldo ou o estoque estiver fora do ar, interrompemos
                    var erro = await response.Content.ReadAsStringAsync();
                    return BadRequest($"Erro ao baixar estoque do produto {item.ProdutoId}: {erro}. A Nota {notaFiscal.Id} continuará Aberta.");
                }
            }

            // 4. Se chegou até aqui, todos os itens tinham saldo! Fechamos a nota.
            notaFiscal.Status = "Fechada";
            await _context.SaveChangesAsync();

            return Ok(notaFiscal);
        }
        [HttpGet]
        public async Task<IActionResult> ListarNotas()
        {
            var notas = await _context.NotasFiscais.Include(n => n.Itens).ToListAsync();
            return Ok(notas);
        }
    }
}