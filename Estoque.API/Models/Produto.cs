namespace Estoque.API.Models
{
    public class Produto
    {
        // Chave Primária interna do banco de dados (Boa prática)
        public int Id { get; set; } 

        // O "Código" exigido pelo teste (Ex: "PROD-001" ou "78910")
        public string Codigo { get; set; } = string.Empty; 

        // Descrição do produto
        public string Descricao { get; set; } = string.Empty; 

        // Quantidade em estoque
        public int Saldo { get; set; } 
    }
}