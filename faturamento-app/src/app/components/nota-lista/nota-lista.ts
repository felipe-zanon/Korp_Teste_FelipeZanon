import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface NotaFiscal {
  id: number;
  numeroSequencial: number;
  status: string;
  dataCriacao: string;
  itens: any[];
}

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