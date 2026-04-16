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
            
            modelBuilder.Entity<Produto>()
                .Property<uint>("Version") 
                .IsRowVersion();           
        }
    }
}