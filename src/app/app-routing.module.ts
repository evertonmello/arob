import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeLayoutComponent } from './components/pages/home/home-layout.component';
import { AuthGuard } from './components/auth/auth.guard';
import { LoginComponent } from './components/pages/login/login.component';
import { NovoPedidoComponent } from './components/pages/pedidos/novo-pedido/novo-pedido.component';
import { PedidoAndamentoComponent } from './components/pages/pedidos/pedido-andamento/pedido-andamento.component';
import { HistoricoComponent } from './components/pages/pedidos/historico/historico.component';
import { LoginLayoutComponent } from './components/layouts/login-layout.component';
import { CadastroComponent } from './components/pages/cadastro/cadastro.component';
import { DadosBancariosComponent } from './components/pages/financeiro/dados-bancarios/dados-bancarios.component';
import { PerfilComponent } from './components/pages/perfil/perfil.component';
import { ExtratoComponent } from './components/pages/financeiro/extrato/extrato.component';
import { CreditoComponent } from './components/pages/financeiro/credito/credito.component';
import { DetalhesComponent } from './components/pages/pedidos/detalhes/detalhes.component';
import { RecibosComponent } from './components/pages/financeiro/recibos/recibos.component';
import { MultilojasComponent } from './../app/components/pages/multilojas/multilojas.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { MercadoLivreComponent } from './components/pages/parceiros/mercado-livre/mercado-livre.component';
import { RoteirizadoDetalheComponent } from './components/pages/pedidos/roteirizado-detalhe/roteirizado-detalhe.component';
import { ContasMeliComponent } from './components/pages/parceiros/mercado-livre/contas-meli/contas-meli.component';
import { isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { UsuarioListagemComponent } from './components/pages/usuarios/listagem/usuario-listagem.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'novo-pedido', component: NovoPedidoComponent },
      { path: 'pedidos-andamento', component: PedidoAndamentoComponent },
      { path: 'pedidos-andamento/:id', component: DetalhesComponent },
      { path: 'historico', component: HistoricoComponent },
      { path: 'dados-bancarios', component: DadosBancariosComponent },
      { path: 'perfil', component: PerfilComponent },
      // { path: 'extrato', component: ExtratoComponent },
      { path: 'credito', component: CreditoComponent },
      { path: 'recibos', component: RecibosComponent },
      { path: 'multilojas', component: MultilojasComponent },
      { path: 'pedidos/mercadolivre', component: MercadoLivreComponent },
      { path: 'pedido-detalhe/:id', component: RoteirizadoDetalheComponent },
      { path: 'mercadolivre', component: ContasMeliComponent },
      { path: 'usuarios', component: UsuarioListagemComponent },
      { path: '', component: PedidoAndamentoComponent }
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },
  { path: 'cadastro', component: CadastroComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

