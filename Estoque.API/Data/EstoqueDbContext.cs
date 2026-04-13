using Microsoft.EntityFrameworkCore;
using Estoque.API.Models;

namespace Estoque.API.Data
{
    public class EstoqueDbContext : DbContext
    {
        public EstoqueDbContext(DbContextOptions<EstoqueDbContext> options) : base(options) { }

        public DbSet<Produto> Produtos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // O Diferencial (Opcional A): Concorrência Otimista
            // Nova sintaxe do EF Core 8+ para utilizar a coluna oculta 'xmin' do PostgreSQL
            modelBuilder.Entity<Produto>()
                .Property<uint>("Version") // Cria uma "Shadow Property" (propriedade fantasma)
                .IsRowVersion();           // Marca como o rastreador de versão/concorrência
        }
    }
}