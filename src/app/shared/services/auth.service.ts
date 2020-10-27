import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {

  public currentUserSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentUser;
  private baseUrl = environment.baseUrl;
  private cordenadas;
  private isAdmin;
  private isMatriz;

  get isLoggedIn() {
    return this.currentUserSubject.asObservable();
  }

  get ramoId() {
    return this.currentUserSubject.value['data'].usuario.marketplaceRamoId;
  }

  get isUserAdmin() {
    return this.isAdmin || JSON.parse(localStorage.getItem('admin'));
  }

  get isUserMatriz() {
    return this.isMatriz || JSON.parse(localStorage.getItem('isMatriz'));
  }

  get meliRefreshToken() {
    const mlRefreshToken = localStorage.getItem('mlRefreshToken');

    if (mlRefreshToken && mlRefreshToken.toLowerCase() !== 'null') {
      return mlRefreshToken;
    } else {
      return null;
    }
  }

  get userLogged() {
    return JSON.parse(localStorage.getItem('currentUser'))['data'].usuario;
  }

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public get currentUserValue(): any {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value
    } else {
      return this.getMomentToken();
    }
  }

  ativaCupom(cupom) {
    return this.http.post(this.baseUrl + 'marketplace/cupom/ativar', cupom)
  }

  atualizaValorCorrida(idPedido, valorCorrida) {
    return this.http.post(this.baseUrl + 'marketplace/alteraValorCorrida?idPedido=' + idPedido + '&valorCorrida=' + valorCorrida, {})
  }

  getMomentToken() {
    if (localStorage.getItem('momentToken')) {

      return JSON.parse(localStorage.getItem('momentToken'))
    } else {
      return null
    }
  }

  login(user: User) {

    return this.http.post(this.baseUrl + 'marketplace/auth/0/0', user).pipe(map((response: any) => {
      if (response.sucesso) {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.setEndereco(response.data.usuario);

        if (response.data.usuario.perfilId == 8) {
          this.setAdmin();
        }

        if (response.data.usuario.matriz) {
          this.setMatriz();
        }

        if (response.data.usuario.mlRefreshToken) {
          this.setMeliToken(response.data.usuario.mlRefreshToken);
        }


        this.currentUserSubject.next(response);
        localStorage.setItem('dinamica', JSON.stringify(response.data.usuario.pedidoPrecificacao.dinamicaChuva))
        this.router.navigate(['/pedidos-andamento']);
      }

      return response;
    }));
  }

  resetSenha(credenciais) {
    return this.http.post(this.baseUrl + 'mottuweb/resetSenha', credenciais);
  }

  checkLogin() {
    if (localStorage.getItem('currentUser')) {
      this.currentUserSubject.next(JSON.parse(localStorage.getItem('currentUser')));
      // this.router.navigate(['/pedidos-andamento']);
    }
    if (localStorage.getItem('currentUserS')) {
      this.currentUserSubject.next(JSON.parse(localStorage.getItem('currentUserS')));
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cordenadas');
    localStorage.removeItem('mlRefreshToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('isMatriz');

    localStorage.removeItem('currentUserS');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('mlToken');

    localStorage.removeItem('momentToken');
    localStorage.removeItem('meliCode');
    localStorage.removeItem('dinamica');
    this.currentUserSubject.next(false);
    this.router.navigate(['/login']);
  }

  setEndereco(usuario) {
    localStorage.setItem('cordenadas', JSON.stringify({ lat: usuario.residenciaLatitude, lng: usuario.residenciaLongitude }));
    localStorage.setItem('endereco', usuario.residenciaRua + ', ' + usuario.residenciaNumero + ', ' +
      usuario.residenciaBairro + ', ' + usuario.residenciaCidade);

  }

  setAdmin() {
    localStorage.setItem('admin', JSON.stringify(true));
  }


  setMatriz() {
    localStorage.setItem('isMatriz', JSON.stringify(true));
  }

  setMeliToken(token) {
    localStorage.setItem('mlRefreshToken', token);
  }
}
