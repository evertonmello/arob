import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';

import { MaterialModule } from './material.module';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { AgmDirectionModule } from 'agm-direction';   // agm-direction
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/pages/login/login.component';
import { HomeLayoutComponent } from './components/pages/home/home-layout.component';
import { LoginLayoutComponent } from './components/layouts/login-layout.component';
import { AuthGuard } from './components/auth/auth.guard';
import { AuthService } from './shared/services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NovoPedidoComponent } from './components/pages/pedidos/novo-pedido/novo-pedido.component';
import { PedidoAndamentoComponent } from './components/pages/pedidos/pedido-andamento/pedido-andamento.component';
import { CadastroComponent } from './components/pages/cadastro/cadastro.component';
import { JwtInterceptor } from './components/auth/jwt.interceptor';
import { FilePickerComponent } from './components/pages/file-picker/file-picker.component';
import { DadosBancariosComponent } from './components/pages/financeiro/dados-bancarios/dados-bancarios.component';
import { PerfilComponent } from './components/pages/perfil/perfil.component';
import { HistoricoComponent } from './components/pages/pedidos/historico/historico.component';
import { SituacaoPipe } from './shared/pipes/situacao.pipe';
import { MercadoLivreComponent } from './components/pages/parceiros/mercado-livre/mercado-livre.component';
import { DataParamPipe } from './shared/pipes/data-param.pipe';
import { ExtratoComponent } from './components/pages/financeiro/extrato/extrato.component';
import { CreditoComponent } from './components/pages/financeiro/credito/credito.component';
import { AbrevPipe } from './shared/pipes/abrev.pipe';
import { CurrencyPipe } from './shared/pipes/currency.pipe';
import { DetalhesComponent } from './components/pages/pedidos/detalhes/detalhes.component';
import { DialogDinamica } from './shared/dialogs/dialog-dinamica';
import { CadastroDialog } from './shared/dialogs/cadastro-dialog';
import { MottuDialog } from './shared/dialogs/mottu-dialog';
import { CupomDialog } from './shared/dialogs/cupom-dialog';
import { ConfirmDialogMottu } from './shared/dialogs/confirm-dialog-mottu';
import { ConfirmDialogAlterarFrete } from './shared/dialogs/dialog-aumenta-frete';
import { RecibosComponent } from './components/pages/financeiro/recibos/recibos.component';
import { MultilojasComponent } from './../app/components/pages/multilojas/multilojas.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { RoteirizadoDetalheComponent } from './components/pages/pedidos/roteirizado-detalhe/roteirizado-detalhe.component';
import { HttpErrorInterceptor } from './components/auth/error.interceptor';
import { PrecificacaoDialog } from './shared/dialogs/preficicacao';
import { ContasMeliComponent } from './components/pages/parceiros/mercado-livre/contas-meli/contas-meli.component';
import { NovaUnidadeComponent } from './components/pages/multilojas/nova-unidade/nova-unidade.component';
import { UsuarioListagemComponent } from './components/pages/usuarios/listagem/usuario-listagem.component';
import { MottuMotoComponent } from './shared/components/mottu-moto/mottu-moto.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginComponent,
    LoginLayoutComponent,
    HomeLayoutComponent,
    NovoPedidoComponent,
    PedidoAndamentoComponent,
    CadastroComponent,
    FilePickerComponent,
    DadosBancariosComponent,
    PerfilComponent,
    HistoricoComponent,
    MercadoLivreComponent,
    SituacaoPipe,
    DataParamPipe,
    CreditoComponent,
    ExtratoComponent,
    CurrencyPipe,
    AbrevPipe,
    DetalhesComponent,
    DialogDinamica,
    RecibosComponent,
    MottuDialog,
    CupomDialog,
    CadastroDialog,
    ConfirmDialogMottu,
    ConfirmDialogAlterarFrete,
    MultilojasComponent,
    NotFoundComponent,
    MottuMotoComponent,
    PrecificacaoDialog,
    RoteirizadoDetalheComponent,
    ContasMeliComponent,
    NovaUnidadeComponent,
    UsuarioListagemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    CurrencyMaskModule,
    MatSelectInfiniteScrollModule,
    AgmDirectionModule,
    NgxDaterangepickerMd.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyANwLSxjrksADZTcozpGJM0b0VmJpAhuYs'
    })
  ],
  entryComponents: [
    DialogDinamica,
    FilePickerComponent,
    MottuDialog,
    CupomDialog,
    ConfirmDialogMottu,
    ConfirmDialogAlterarFrete,
    PrecificacaoDialog,
    CadastroDialog
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
