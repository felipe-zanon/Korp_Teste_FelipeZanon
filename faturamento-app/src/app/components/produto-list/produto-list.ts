import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  saldo: number;
}

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css'
})
export class ProdutoListComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  produtos: Produto[] = [];
  colunas: string[] = ['id', 'codigo', 'descricao', 'saldo'];
  carregando = true;
  erro = '';

  ngOnInit() {
    this.http.get<Produto[]>('http://localhost:5034/api/produtos').subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erro = 'Erro ao carregar produtos.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }
}