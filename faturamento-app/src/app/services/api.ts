import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ✅ Interfaces batendo exatamente com o backend C#
export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  saldo: number;
}

export interface ItemNota {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
}

export interface CriarNotaRequest {
  chaveIdempotencia: string;
  itens: ItemNota[];
}

export interface NotaFiscal {
  id: number;
  numeroSequencial: number;
  status: string;
  dataCriacao: string;
  chaveIdempotencia?: string;
  itens: ItemNota[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private estoqueUrl = 'http://localhost:5034/api/produtos';
  private faturamentoUrl = 'http://localhost:5081/api/notasfiscais';

  // Produtos
  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.estoqueUrl).pipe(
      catchError(this.handleError)
    );
  }

  criarProduto(produto: Omit<Produto, 'id'>): Observable<Produto> {
    return this.http.post<Produto>(this.estoqueUrl, produto).pipe(
      catchError(this.handleError)
    );
  }

  // Notas Fiscais
  getNotas(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.faturamentoUrl).pipe(
      catchError(this.handleError)
    );
  }

  emitirNota(payload: CriarNotaRequest): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(`${this.faturamentoUrl}/emitir`, payload).pipe(
      catchError(this.handleError)
    );
  }
  // Adicione junto com os outros métodos que já existem aí
  imprimirNota(id: number): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(`${this.faturamentoUrl}/${id}/imprimir`, {});
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro na comunicação com o servidor.';
    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.Message) {
      errorMessage = error.error.Message;
    }
    console.error('Erro RxJS:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}