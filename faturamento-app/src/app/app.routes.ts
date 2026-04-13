import { Routes } from '@angular/router';
import { ProdutoListComponent } from './components/produto-list/produto-list';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  { path: 'produtos', component: ProdutoListComponent }
];