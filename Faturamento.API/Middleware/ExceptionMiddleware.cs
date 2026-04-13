using System.Net;
using System.Text.Json;

namespace Faturamento.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                // Deixa a requisição seguir o fluxo normal
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                // Se qualquer erro estourar na API, cai aqui!
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            // Cria um JSON amigável para devolver ao Angular em vez de "crashar" a tela
            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Ocorreu um erro interno no servidor.",
                Detalhe = exception.Message // Opcional, ajuda a debugar
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}