using Estoque.API.Data;
using Estoque.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Estoque.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : ControllerBase
    {
        private readonly EstoqueDbContext _context;

        public ProdutosController(EstoqueDbContext context)
        {
            _context = context;
        }

        // GET: api/produtos
        [HttpGet]
        public async Task<IActionResult> ListarProdutos()
        {
            var produtos = await _context.Produtos.ToListAsync();
            return Ok(produtos);
        }

        // POST: api/produtos
       [HttpPost]
public async Task<IActionResult> CriarProduto([FromBody] Produto produto)
{
    // Busca o último produto cadastrado para saber qual foi o último ID
    var ultimoProduto = await _context.Produtos
                                      .OrderByDescending(p => p.Id)
                                      .FirstOrDefaultAsync();

    // Calcula qual será o próximo ID (se for o primeiro, será 1)
    int proximoId = (ultimoProduto?.Id ?? 0) + 1;

    // SOBRESCREVE o "GERAR_AUTO" 
    produto.Codigo = $"PRD-{proximoId:D3}"; 

    // 4. Salva no banco de dados
    _context.Produtos.Add(produto);
    await _context.SaveChangesAsync();

    // 5. Retorna sucesso para o Angular
    return Ok(produto);
}

        // PUT: api/produtos/{id}/baixar-estoque
        [HttpPut("{id}/baixar-estoque")]
        public async Task<IActionResult> BaixarEstoque(int id, [FromBody] int quantidadeComprada)
        {
            var produto = await _context.Produtos.FindAsync(id);

            if (produto == null) 
                return NotFound("Produto não encontrado no estoque.");

            if (produto.Saldo < quantidadeComprada)
                return BadRequest($"Saldo insuficiente. Saldo atual: {produto.Saldo}");

            produto.Saldo -= quantidadeComprada;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(produto);
            }
            catch (DbUpdateConcurrencyException)
            {
                // Concorrência
                return Conflict("O estoque deste produto foi alterado por outra transação. Tente novamente.");
            }
        }
    }
}