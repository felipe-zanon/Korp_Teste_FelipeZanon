using Microsoft.EntityFrameworkCore;
using Faturamento.API.Models; // Ajuste se o namespace dos seus models for diferente

namespace Faturamento.API.Data
{
    public class FaturamentoDbContext : DbContext
    {
        public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options) { }

        public DbSet<NotaFiscal> NotasFiscais { get; set; }
        public DbSet<NotaFiscalItem> NotaFiscalItens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // O "Pulo do Gato": Garante que o banco de dados trave chaves duplicadas!
            modelBuilder.Entity<NotaFiscal>()
                .HasIndex(n => n.ChaveIdempotencia)
                .IsUnique();
        }
    }
}