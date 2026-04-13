namespace Faturamento.API.Models
{
   public class NotaFiscal
    {
        /// Identificador único interno no banco de dados (Primary Key).
        public int Id { get; set; }

        /// Numeração de controle da nota fiscal. 
        /// Requisito obrigatório do escopo do sistema.
        public int NumeroSequencial { get; set; }

        /// Estado atual da nota. O ciclo de vida inicia obrigatoriamente como "Aberta".
        /// Permite a transição para "Fechada" apenas após a impressão e baixa bem-sucedida do estoque.
        public string Status { get; set; } = "Aberta";

  
        /// Data e hora exata da emissão/criação do registro.
        /// Utiliza UTC (Tempo Universal Coordenado) como boa prática para evitar 
        /// problemas de fuso horário em servidores em nuvem.
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        /// Chave única gerada pelo cliente para garantir a idempotência da criação da nota.
        /// Previne que a mesma requisição gere notas duplicadas caso ocorra instabilidade na rede
        ///  ou duplo clique do usuário.
        public string? ChaveIdempotencia { get; set; }

        /// Relacionamento de 1 para N (Uma nota possui vários itens).
        /// Representa a coleção de produtos que compõem esta nota fiscal.
        /// Inicializada com new() para evitar exceções de referência nula
        ///  (NullReferenceException) ao adicionar novos itens.
        public List<NotaFiscalItem> Itens { get; set; } = new();
}

    public class NotaFiscalItem
    {
        public int Id { get; set; }
        public int ProdutoId { get; set; } // Referência ao ID do Produto no outro serviço
        public int Quantidade { get; set; }

        // ID da nota à qual este item pertence
        public int NotaFiscalId { get; set; }
    }
}