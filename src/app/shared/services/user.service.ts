import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Cadastro } from '../models/cadastro.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { CadastroUnidade } from '../models/cadastroUnidade.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  register(cadastro: Cadastro, addLoja: boolean): Observable<any> {
    return this.http.post(this.baseUrl + 'usuario/email/0/0', cadastro).pipe(map((data: any) => {
      if (data.sucesso && !addLoja) {
        this.authService.currentUserSubject.next(true);
        localStorage.setItem('currentUser', JSON.stringify(data));
        this.authService.currentUserSubject.next(data);
      }
      return data;
    }));
  }

  addUnidade(unidade: CadastroUnidade) {
    return this.http.post(this.baseUrl + 'usuario/unidade', unidade);
  }

  removeUnidade(unidade: Number) {
    return this.http.delete(this.baseUrl + 'marketplace/unidade?id=' + unidade);
  }

  checkEmail(email: object) {
    return this.http.post(this.baseUrl + 'marketplace/validarEmail', email);
  }


  checkCnpj(cnpj: object) {
    return this.http.post(this.baseUrl + 'marketplace/validarCnpj', cnpj);
  }

  registerAddress(address): Observable<any> {
    return this.http.post(this.baseUrl + 'usuario/Residencia', address);
  }

  getUsers() {
    return this.http.get(this.baseUrl + 'marketplace/usuarios');
  }

  setDinamica() {
    return this.http.post(this.baseUrl + 'marketplace/dinamicaChuva', {});
  }

  getUserData() {
    return this.http.get(this.baseUrl + 'marketplace/GetUsuarioLogado');
  }

  getUsuariosComFiltros(filtros: any) {
    let params = new HttpParams();

    if (filtros.cpf) {
      params = params.set('cpf', filtros.cpf.toString());
    }

    if (filtros.nome) {
      params = params.set('nome', filtros.nome.toString());
    }

    if (filtros.ramo) {
      params = params.set('ramo', filtros.ramo.toString());
    }

    params = params.set('periodo', filtros.periodo.toString());
    params = params.set('take', filtros.take.toString());
    params = params.set('skip', filtros.skip.toString());

    return this.http.get(this.baseUrl + 'marketplace/usuario', { params });
  }

}
