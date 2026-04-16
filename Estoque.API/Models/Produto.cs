namespace Estoque.API.Models
{
    public class Produto
    {
        // Chave Primária interna do banco de dados 
        public int Id { get; set; } 

        public string Codigo { get; set; } = string.Empty; 

        // Descrição do produto
        public string Descricao { get; set; } = string.Empty; 

        // Quantidade em estoque
        public int Saldo { get; set; } 
    }
}