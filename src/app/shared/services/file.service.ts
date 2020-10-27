import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  uploadFile(file: FormData, usuarioId: number) {
    return this.http.post(`${this.baseUrl}marketplace/Upload/?usuarioId=${usuarioId}`, file);
  }
}
