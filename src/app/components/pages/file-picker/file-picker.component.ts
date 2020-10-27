import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { FileService } from './../../../shared/services/file.service';
import { MatDialog } from '@angular/material';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { FinanceiroService } from 'src/app/shared/services/financeiro.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: "file-picker",
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss'],
})
export class FilePickerComponent implements OnInit {
  public cnh;
  public showLoader = true;
  public endereco;
  public cartaoCnpj;
  public documents: FormGroup;
  public docsInfo;
  public cnhAlreadLoad = false;
  public cnpjAlreadLoad = false;
  public enderecoAlreadLoad = false;
  public onAdd = new EventEmitter();
  public zoopStatus;
  public isAdmin = this.authService.isUserAdmin;
  public usuarios;
  public values;
  public scollIndex = 1;
  public usuarioLogado = this.authService.userLogged;

  @Input() cadastro = false;
  @Input() dadosBancario = false;
  constructor(
    private fileService: FileService,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private financeiroService: FinanceiroService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.getUsuarios();
    }

    if (!this.cadastro) {
      this.getDocsIsnfo(null);
    } else {
      this.showLoader = false;
    }

    this.documents = this.formBuilder.group({
      userSelected: [''],
      cnh: [''],
      endereco: [''],
      cartaoCnpj: [''],
    });
  }

  getUsuarios() {
    this.userService.getUsers().subscribe((usuarios) => {
      this.usuarios = usuarios;
      this.values = usuarios;
      console.log(this.values);
    });
  }

  public _filter(value) {
    if (value == '') {
      this.values = this.usuarios;
      this.documents.controls.userSelected.setValue(null);
    } else {
      const filterValue = value.toLowerCase();
      this.values = this.usuarios.filter((option) => {
        if (option.Nome) {
          return (
            option.Nome.toLowerCase().includes(filterValue) == true ||
            option.Id.toString().toLowerCase().includes(filterValue) == true
          );
        }
      });
    }
  }

  manageScroll() {
    this.scollIndex++;
  }

  recarregarDocumentos() {
    this.showLoader = true;
    this.getDocsIsnfo(this.documents.controls.userSelected.value);
  }

  getDocsIsnfo(usuarioId) {
    this.financeiroService.getDocsStatus(usuarioId).subscribe(
      (response: any) => {
        if (response.data) {
          this.zoopStatus = response.data;
          this.setDocValues(response.data);
        }
      },
      (error) => {
        this.showLoader = false;
      }
    );
  }

  setDocValues(data) {
    this.cnh = data.identificacaoDoc || null;
    this.endereco = data.comprovanteDoc || null;
    this.cartaoCnpj = data.cnpjDoc || null;

    this.cnhAlreadLoad = data.identificacaoDoc ? true : false;
    this.cnpjAlreadLoad = data.cnpjDoc ? true : false;
    this.enderecoAlreadLoad = data.comprovanteDoc ? true : false;
    this.showLoader = false;
  }

  sendFiles() {
    this.showLoader = true;
    const usuarioSelecionado = this.documents.controls.userSelected.value;
    const formData = new FormData();

    let cnh, endereco, cnpjFile;

    cnh = document.getElementById('cnh')['files'][0];

    if (cnh && !this.cnhAlreadLoad) {
      formData.append('file', cnh);
      formData.append('type', 'cnhDoc');
    }

    if (this.usuarioLogado.tipoPessoa == 'J') {
      endereco = document.getElementById('endereco')['files'][0];
      cnpjFile = document.getElementById('cartaoCnpj')['files'][0];

      if (endereco && !this.enderecoAlreadLoad) {
        formData.append('file', endereco);
        formData.append('type', 'residenciaDoc');
      }

      if (cnpjFile && !this.cnpjAlreadLoad) {
        formData.append('file', cnpjFile);
        formData.append('type', 'cnpjDoc');
      }
    }

    if (cnpjFile || endereco || cnh) {
      this.uploadFile(formData, usuarioSelecionado);
    } else {
      this.showLoader = false;
    }
  }

  onFileSelect(event, file) {
    if (event.length > 0) {
      this[file] = event[0].name;
      if (file == 'endereco') {
        this.enderecoAlreadLoad = false;
      }

      if (file == 'cnh') {
        this.cnhAlreadLoad = false;
      }
      if (file == 'cartaoCnpj') {
        this.cnpjAlreadLoad = false;
      }
    }
  }

  removeFile(file) {
    this.documents.controls[file].reset();
    this[file] = null;
  }

  onButtonClick() {
    this.onAdd.emit();
  }
  uploadFile(file, usuarioId) {
    this.fileService.uploadFile(file, usuarioId).subscribe(
      (resp: any) => {
        this.showLoader = false;

        this.dialog.open(MottuDialog, {
          width: '400px',
          disableClose: true,
          data: {
            data: null,
            message: {
              title: 'Documentos enviados com sucesso',
              body: 'Aguarde algumas horas para aprovação dos seus documentos.',
            },
          },
        });
        this.onAdd.emit();

        if (!this.isAdmin) {
          this.router.navigate(['/pedidos-andamento']);
        }
      },
      (error) => {
        this.showLoader = false;
        console.log(error);
      }
    );
  }
}
