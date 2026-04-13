import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Produto, ItemNota, CriarNotaRequest, NotaFiscal } from '../../services/api';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-nota-fiscal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, 
    MatProgressSpinnerModule, MatChipsModule, MatListModule
  ],
  templateUrl: './nota-fiscal.html', 
  styleUrl: './nota-fiscal.css'      
})
export class NotaFiscalComponent implements OnInit {
  private apiService = inject(ApiService);

  produtosDisponiveis: Produto[] = [];
  itens: ItemNota[] = [];

  produtoSelecionadoId: number | null = null;
  quantidadeSelecionada: number = 1;
  notaCriada: NotaFiscal | null = null; 
  processando = false;
  mensagemDeRetorno = '';
  sucesso = false;

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.apiService.getProdutos().subscribe({
      next: (dados: Produto[]) => this.produtosDisponiveis = dados,
      error: (err: Error) => console.error('Erro ao carregar', err)
    });
  }

  adicionarItem() {
    if (this.produtoSelecionadoId && this.quantidadeSelecionada > 0) {
      const produto = this.produtosDisponiveis.find(p => p.id === this.produtoSelecionadoId);
      if (produto) {
        this.itens.push({
          produtoId: produto.id,
          nomeProduto: produto.descricao, 
          quantidade: this.quantidadeSelecionada
        });
        this.produtoSelecionadoId = null;
        this.quantidadeSelecionada = 1;
      }
    }
  }

  // O processo único batendo com o seu C#
  imprimirNota() {
    if (this.itens.length === 0) return;

    this.processando = true;
    this.mensagemDeRetorno = '';

    const payload: CriarNotaRequest = {
      chaveIdempotencia: `REQ-${Date.now()}`,
      itens: this.itens
    };

    this.apiService.emitirNota(payload).subscribe({
      next: (nota: NotaFiscal) => {
        this.processando = false;
        this.sucesso = true;
        this.notaCriada = nota;
        this.mensagemDeRetorno = `Sucesso! A nota foi Impressa (Status: ${nota.status}) e o saldo foi baixado.`;
      },
      error: (err: Error) => {
        this.processando = false;
        this.sucesso = false;
        this.mensagemDeRetorno = err.message;
      }
    });
  }

  novaVenda() {
    this.notaCriada = null;
    this.itens = [];
    this.mensagemDeRetorno = '';
    this.carregarProdutos(); // Atualiza o select com o novo saldo
  }
}