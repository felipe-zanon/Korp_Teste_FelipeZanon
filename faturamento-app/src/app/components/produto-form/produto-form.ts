import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css'
})
export class ProdutoFormComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  codigo = '';
  descricao = '';
  saldo = 0;
  salvando = false;
  mensagem = '';
  sucesso = false;

  salvar() {
    // AJUSTE 1: Removemos a obrigatoriedade do this.codigo
    if (!this.descricao || this.saldo < 0) return;

    this.salvando = true;
    this.mensagem = '';

    this.http.post('http://localhost:5034/api/produtos', {
      codigo: "GERAR_AUTO", // AJUSTE 2: Enviamos uma string genérica para o C# sobrescrever
      descricao: this.descricao,
      saldo: this.saldo
    }).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = `Produto "${this.descricao}" cadastrado com sucesso!`;
        this.codigo = '';
        this.descricao = '';
        this.saldo = 0;
        this.salvando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.sucesso = false;
        this.mensagem = err.error?.error || 'Erro ao cadastrar produto.';
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }
}