import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/models/user';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form: FormGroup = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });
  public restSenha: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    celular: new FormControl('', Validators.required),
  });
  public error;
  public keepLogged = false;
  public showLoader = false;
  public resetPass = false;
  public passWordType = 'password';
  constructor(private authService: AuthService, public dialog: MatDialog) {}

  ngOnInit() {}

  login() {
    this.showLoader = true;
    this.authService
      .login({
        email: this.form.controls.email.value,
        senha: this.form.controls.password.value,
      })
      .subscribe(
        (data) => {
          this.showLoader = false;
          if (data.data && this.keepLogged) {
            localStorage.setItem('currentUserS', JSON.stringify(data));
          }

          if (!data.data) {
            this.errorMsg();
          }
        },
        (error) => {
          this.showLoader = false;
          this.error = error;
          this.authService.login(this.form.value);
        }
      );
  }

  setIsConnected() {
    this.keepLogged = !this.keepLogged;
  }

  setPasswordView() {
    this.passWordType = this.passWordType == 'text' ? 'password' : 'text';
  }

  resetSenha() {
    const credenciais = {
      Email: this.restSenha.controls.email.value,
      Celular: this.restSenha.controls.celular.value,
    };

    this.authService.resetSenha(credenciais).subscribe((response: any) => {
      const message = {
        title: 'Sucesso',
        body: 'Senha provisória enviada por sms',
      };
      if (!response.sucesso) {
        message.title = 'Ops.';
        message.body = 'Usuário não encontrado';
      }

      this.dialog.open(MottuDialog, {
        width: '500px',
        disableClose: true,
        data: {
          data: null,
          message,
        },
      });
    });
  }

  errorMsg() {
    this.dialog.open(MottuDialog, {
      width: '500px',
      disableClose: true,
      data: {
        data: null,
        message: {
          title: 'Ops..',
          body: 'E-mail ou Senha Inválida',
        },
      },
    });
  }
}
