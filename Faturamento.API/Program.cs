using Faturamento.API.Data;
using Polly;
using Faturamento.API.Middleware; // Atenção a esta linha
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Banco de dados (PostgreSQL via Docker)
builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpClient simples para chamar o Estoque.API (Sem Polly)
builder.Services.AddHttpClient("EstoqueAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["EstoqueAPI:BaseUrl"]!);
})
.AddTransientHttpErrorPolicy(policy =>
    // Tenta 3 vezes antes de desistir, dobrando o tempo de espera (2s, 4s, 8s)
    policy.WaitAndRetryAsync(3, retryAttempt => 
        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
.AddTransientHttpErrorPolicy(policy =>
    // Se falhar 5 vezes seguidas, "abre o circuito" e bloqueia novas tentativas por 30 segundos
    policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));

// CORS (Para o frontend Angular não ser bloqueado depois)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware global de exceções
// IMPORTANTE: Se o código não compilar por falta dessa classe, comente a linha abaixo por enquanto com //
app.UseMiddleware<ExceptionMiddleware>();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();

// Migrations automáticas ao subir a API
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FaturamentoDbContext>();
    db.Database.Migrate(); 
}

app.Run();