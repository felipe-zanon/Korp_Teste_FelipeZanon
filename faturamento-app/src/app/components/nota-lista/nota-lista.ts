import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, NotaFiscal } from '../../services/api'; 
import { RefreshService } from '../../services/refresh.services';


@Component({
  selector: 'app-nota-lista',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule,
    MatChipsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './nota-lista.html',
  styleUrl: './nota-lista.css'
})
export class NotaListaComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiService = inject(ApiService);
  private refreshService = inject(RefreshService);

  notas: NotaFiscal[] = [];
  colunas = ['numeroSequencial', 'status', 'dataCriacao', 'itens', 'acoes'];
  carregando = true;
  imprimindo: number | null = null;

  ngOnInit() {
    this.carregarNotas();
  }

  carregarNotas() {
    this.carregando = true;
    this.http.get<NotaFiscal[]>('http://localhost:5081/api/notasfiscais').subscribe({
      next: (dados) => {
        this.notas = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }
  // Adicione este método na classe NotaListaComponent
  imprimirNota(id: number) {
    this.apiService.imprimirNota(id).subscribe({
      next: (notaAtualizada : NotaFiscal) => {
        // 1. Recarrega a lista para mostrar o novo status "Fechada"
        this.carregarNotas(); 
        
        // 2. Avisa o componente de Estoque para atualizar os saldos
        this.refreshService.triggerRefreshEstoque(); 
        
        alert(`Sucesso! A Nota #${id} foi impressa e o estoque foi baixado.`);
      },
      error: (err: Error) => {
        alert(`Erro ao imprimir a nota #${id}: ` + err.message);
      }
    });
  }
  imprimir(nota: NotaFiscal) {
    if (nota.status !== 'Aberta') return;
    this.imprimindo = nota.id;

    this.http.post<NotaFiscal>(`http://localhost:5081/api/notasfiscais/${nota.id}/imprimir`, {}).subscribe({
      next: (notaAtualizada) => {
        const index = this.notas.findIndex(n => n.id === nota.id);
        if (index !== -1) this.notas[index] = notaAtualizada;
        this.imprimindo = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.imprimindo = null;
        this.cdr.detectChanges();
      }
    });
  }
}