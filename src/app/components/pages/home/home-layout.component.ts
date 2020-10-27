import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { environment } from '../../../../environments/environment';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogDinamica } from '../../../shared/dialogs/dialog-dinamica';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MeliService } from 'src/app/shared/services/meli.service';
import { FinanceiroService } from 'src/app/shared/services/financeiro.service';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']

})
export class HomeLayoutComponent {

  public isChecked = false;
  public showSideMenu = false;
  public saldo;
  public ramoId = this.authService.ramoId;
  public isAdmin = this.authService.isUserAdmin;
  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private authService: AuthService,
    private route: Router,
    private meliService: MeliService,
    private financeiroService: FinanceiroService
  ) { }

  ngOnInit() {
    this.initDinamic();
    this.getSaldo();
  }

  getSaldo() {
    this.financeiroService.getSaldo().subscribe((response: any) => {
      this.saldo = response.data;
    });
  }

  credito() {
    this.route.navigate(['/credito'])
  }

  old() {
    window.open('https://admin2.borabora.delivery');
  }

  autenticaMercadoLivre() {

    // let meliUrl = 'http://auth.mercadolivre.com.br/authorization';
    // meliUrl += '?response_type=code';
    // meliUrl += `&client_id=${environment.meliApp}`;
    // meliUrl += `&redirect_uri=${environment.meliUrlRedirect}`;

    // if (!this.authService.meliRefreshToken) {
    //   this.setMomentToken();
    //   window.location.assign(meliUrl);

    // } else {

    //   const mlTokenExpires = this.authService.currentUserSubject.value['data'].usuario.mlTokenExpires;
    //   const expiresDate = new Date(mlTokenExpires);

    //   if (expiresDate < new Date()) {
    //     this.setMomentToken();
    //     window.location.assign(meliUrl);

    //   } else {
    //   }
    // }
    this.route.navigate(['pedidos/mercadolivre']);

  }

  initDinamic() {
    this.isChecked = JSON.parse(localStorage.getItem('dinamica'))
  }

  setDinamica() {
    this.userService.setDinamica().subscribe((response: any) => {
      if (response.sucesso) {
        localStorage.setItem('dinamica', JSON.stringify(response.data.dinamica))
        this.openDialog(response.data);
      }
    });
  }

  setMomentToken() {
    localStorage.setItem('momentToken', localStorage.getItem('currentUser'));
  }

  openDialog(data: any): void {
    this.dialog.open(DialogDinamica, {
      width: '400px',
      disableClose: true,
      data: data
    });
  }

  setMenuView() {
    this.showSideMenu = !this.showSideMenu;
  }

  checkMeliToken() {

  }


  logOut() {
    this.authService.logout();
  }
}
