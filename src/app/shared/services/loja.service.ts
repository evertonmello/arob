import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LojaService {

  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient){}
  
  getLojas() {
      return this.http.get(this.baseUrl + 'marketplace/unidades');
  }
}
