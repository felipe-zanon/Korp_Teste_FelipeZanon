# Sistema de Emissão de Notas Fiscais

> Projeto Técnico Korp | Felipe Zanon

Sistema fullstack de emissão de notas fiscais com arquitetura de microsserviços, desenvolvido com Angular 18, ASP.NET Core 8 e PostgreSQL.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                   Angular 18 (porta 4200)                │
│         Standalone Components + Angular Material         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐        ┌─────────────────────┐
│  Estoque.API  │◄───────│   Faturamento.API   │
│  porta 5034   │        │     porta 5081       │
└───────┬───────┘        └──────────┬──────────┘
        │                           │
        ▼                           ▼
┌───────────────┐        ┌─────────────────────┐
│  PostgreSQL   │        │     PostgreSQL       │
│  estoque_db   │        │   faturamento_db     │
│  porta 5432   │        │     porta 5433       │
└───────────────┘        └─────────────────────┘
```

Cada microsserviço possui **banco de dados independente**, garantindo isolamento total de responsabilidades.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Angular 18 (Standalone) + Angular Material + RxJS |
| Backend | C# / ASP.NET Core 8 Web API |
| ORM | Entity Framework Core (Code-First + Migrations) |
| Banco de Dados | PostgreSQL 16 |
| Resiliência | Polly (Retry + Circuit Breaker) |
| Infraestrutura | Docker + Docker Compose |

---

## ✅ Requisitos Implementados

### Obrigatórios

| Requisito | Status | Detalhes |
|-----------|--------|---------|
| Cadastro de Produtos | ✅ | Código, Descrição, Saldo — persistidos no PostgreSQL |
| Emissão de Notas Fiscais | ✅ | Numeração sequencial, status inicial Aberta |
| Múltiplos produtos por nota | ✅ | Com validação de saldo em tempo real |
| Botão de impressão com spinner | ✅ | Loading visual durante processamento |
| Status muda para Fechada | ✅ | Após impressão via API |
| Bloqueio de nota já fechada | ✅ | Botão desabilitado para notas Fechadas |
| Débito automático de saldo | ✅ | Estoque atualizado ao imprimir |
| Arquitetura de Microsserviços | ✅ | Estoque.API + Faturamento.API independentes |
| Tratamento de Falhas | ✅ | Polly + Middleware + feedback visual |
| Banco de dados real | ✅ | PostgreSQL via Docker |

### Opcionais

| Opcional | Status | Implementação |
|----------|--------|---------------|
| A — Concorrência | ✅ | Optimistic Concurrency via `RowVersion` no EF Core |
| B — Inteligência Artificial | ❌ | Não implementado |
| C — Idempotência | ✅ | `ChaveIdempotencia` no body + índice único no banco |

---

## 📋 Detalhamento Técnico

### 1. Ciclos de Vida do Angular

**`ngOnInit`** — utilizado em todos os componentes para carregar dados ao renderizar:

```typescript
// produto-list.ts
ngOnInit() {
  this.http.get<Produto[]>('http://localhost:5034/api/produtos').subscribe({
    next: (dados) => { this.produtos = dados; this.cdr.detectChanges(); }
  });
}
```

**`ChangeDetectorRef.detectChanges()`** — forçar atualização da view após resposta assíncrona de Observables fora do contexto padrão de detecção do Angular.

### 2. Uso do RxJS

| Operador | Arquivo | Finalidade |
|----------|---------|------------|
| `Observable` | `api.ts` | Tipar retornos das requisições HTTP |
| `.subscribe({ next, error })` | Todos os componentes | Reagir assincronamente às respostas |
| `switchMap` | `nota-fiscal.ts` | Encadear emitir → imprimir em sequência reativa |
| `catchError` | `api.ts` | Interceptar erros HTTP e formatar mensagem amigável |
| `throwError` | `api.ts` | Propagar erros tratados no pipeline RxJS |
| `Subject` | `refresh.service.ts` | Comunicação entre componentes para refresh de estoque |

```typescript
// Uso do switchMap para encadeamento reativo
this.apiService.emitirNota(payload).pipe(
  switchMap((nota) => this.apiService.imprimirNota(nota.id)),
  catchError((err) => {
    this.mensagemDeRetorno = err.message;
    return throwError(() => err);
  })
).subscribe({ next: (notaFechada) => { ... } });
```

### 3. Bibliotecas de Componentes Visuais

**Angular Material** — biblioteca oficial do ecossistema Angular:

`MatCard`, `MatTable`, `MatInput`, `MatSelect`, `MatButton`, `MatIcon`, `MatProgressSpinner`, `MatChips`, `MatList`, `MatFormField`

### 4. Frameworks no C#

**ASP.NET Core 8 Web API** — estruturação das APIs RESTful com Controllers, Dependency Injection e Middleware pipeline.

**Entity Framework Core** — ORM Code-First com Migrations automáticas aplicadas no startup da aplicação:

```csharp
// Program.cs — migrations automáticas ao subir
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<EstoqueDbContext>();
    db.Database.Migrate();
}
```

**Polly** — resiliência nas chamadas HTTP entre microsserviços:

```csharp
// Program.cs — Faturamento.API
builder.Services.AddHttpClient("EstoqueAPI", client => {
    client.BaseAddress = new Uri(builder.Configuration["EstoqueAPI:BaseUrl"]!);
})
.AddTransientHttpErrorPolicy(policy =>
    policy.WaitAndRetryAsync(3, retryAttempt =>
        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))) // Retry com backoff exponencial
.AddTransientHttpErrorPolicy(policy =>
    policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30))); // Circuit Breaker
```

### 5. Tratamento de Erros e Exceções no Backend

Middleware global (`ExceptionMiddleware`) registrado no pipeline do ASP.NET Core que intercepta todas as exceções e retorna JSON padronizado:

```csharp
// ExceptionMiddleware.cs
catch (DbUpdateConcurrencyException ex) {
    context.Response.StatusCode = 409; // Conflict
    await context.Response.WriteAsync(JsonSerializer.Serialize(new {
        error = "Conflito de concorrência detectado. Tente novamente."
    }));
}
catch (Exception ex) {
    context.Response.StatusCode = 500;
    await context.Response.WriteAsync(JsonSerializer.Serialize(new {
        error = "Ocorreu um erro interno. Tente novamente mais tarde."
    }));
}
```

| Cenário | HTTP Status | Tratamento |
|---------|-------------|------------|
| Saldo insuficiente | 400 Bad Request | Validação no Controller |
| Código de produto duplicado | 400 Bad Request | `AnyAsync` + BadRequest |
| Concorrência otimista | 409 Conflict | `DbUpdateConcurrencyException` no Middleware |
| Estoque indisponível | 503 via Polly | Circuit Breaker + Middleware |

### 6. Uso de LINQ

```csharp
// Idempotência — buscar nota por chave
.FirstOrDefaultAsync(n => n.ChaveIdempotencia == request.ChaveIdempotencia);

// Notas mais recentes primeiro
.OrderByDescending(n => n.DataCriacao).ToListAsync();

// Eager loading dos itens relacionados
.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);

// Verificar código duplicado
.AnyAsync(p => p.Codigo == produto.Codigo);

// Projeção de campos específicos
.Select(p => new { p.Id, p.Codigo, p.Descricao, p.Saldo }).ToListAsync();

// Numeração sequencial
.OrderByDescending(n => n.Id).Select(n => n.NumeroSequencial).FirstOrDefaultAsync();
```

### 7. Gerenciamento de Dependências

Gerenciado via **NuGet** com os seguintes pacotes principais:

```xml
Npgsql.EntityFrameworkCore.PostgreSQL
Microsoft.EntityFrameworkCore.Design
Microsoft.Extensions.Http.Polly
```

### 8. Opcional A — Concorrência Otimista

```csharp
// Produto.cs
public uint RowVersion { get; set; }

// EstoqueDbContext.cs
entity.Property(p => p.RowVersion).IsRowVersion();
```

Se dois usuários tentarem debitar o mesmo produto simultaneamente, o EF Core detecta o conflito via `RowVersion` e lança `DbUpdateConcurrencyException`, retornando HTTP 409.

### 9. Opcional C — Idempotência

```csharp
// NotasFiscaisController.cs
if (!string.IsNullOrEmpty(request.ChaveIdempotencia)) {
    var notaExistente = await _context.NotasFiscais
        .Include(n => n.Itens)
        .FirstOrDefaultAsync(n => n.ChaveIdempotencia == request.ChaveIdempotencia);
    if (notaExistente != null)
        return Ok(notaExistente); // Retorna a mesma nota sem duplicar
}
```

```typescript
// Angular — chave gerada no frontend
chaveIdempotencia: `REQ-${Date.now()}`
```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+ LTS](https://nodejs.org)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`

### Passo a passo

**1. Clone o repositório:**
```bash
git clone https://github.com/felipe-zanon/Korp_Teste_FelipeZanon.git
cd Korp_Teste_FelipeZanon
```

**2. Suba os bancos de dados:**
```bash
docker-compose up -d
```

**3. Inicie o Estoque.API** (Terminal 1):
```bash
cd Estoque.API
dotnet run
# Aguarde: "Now listening on: http://localhost:5034"
```

**4. Inicie o Faturamento.API** (Terminal 2):
```bash
cd Faturamento.API
dotnet run
# Aguarde: "Now listening on: http://localhost:5081"
```

**5. Inicie o Frontend** (Terminal 3):
```bash
cd faturamento-app
ng serve -o
```

**6. Acesse:** [http://localhost:4200](http://localhost:4200)

> As migrations do banco são aplicadas automaticamente ao iniciar as APIs.

### Swagger (documentação das APIs)

- Estoque.API: [http://localhost:5034/swagger](http://localhost:5034/swagger)
- Faturamento.API: [http://localhost:5081/swagger](http://localhost:5081/swagger)

---

## 📁 Estrutura do Projeto

```
Korp_Teste_FelipeZanon/
├── Estoque.API/
│   ├── Controllers/       # ProdutosController
│   ├── Data/              # EstoqueDbContext
│   ├── Middleware/        # ExceptionMiddleware
│   ├── Models/            # Produto (com RowVersion)
│   └── Program.cs
├── Faturamento.API/
│   ├── Controllers/       # NotasFiscaisController
│   ├── Data/              # FaturamentoDbContext
│   ├── Middleware/        # ExceptionMiddleware
│   ├── Models/            # NotaFiscal, NotaFiscalItem
│   └── Program.cs         # Polly configurado aqui
├── faturamento-app/       # Angular 18
│   └── src/app/
│       ├── components/
│       │   ├── produto-form/    # Cadastro de produto
│       │   ├── produto-list/    # Tabela de estoque
│       │   ├── nota-fiscal/     # Emissão de nota
│       │   └── nota-lista/      # Lista com botão imprimir
│       └── services/
│           ├── api.ts           # HttpClient + RxJS
│           └── refresh.service.ts # Subject para refresh
└── docker-compose.yml     # 2 bancos PostgreSQL
```

---

## 👤 Desenvolvedor

**Felipe Zanon**
[![LinkedIn Badge](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/felipe-zanon/)
