import { Component } from '@angular/core';
import { ProdutoListComponent } from './components/produto-list/produto-list';
import { NotaFiscalComponent } from './components/nota-fiscal/nota-fiscal';
import { ProdutoFormComponent } from './components/produto-form/produto-form';
import { NotaListaComponent } from './components/nota-lista/nota-lista';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProdutoListComponent, NotaFiscalComponent, ProdutoFormComponent, NotaListaComponent ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}