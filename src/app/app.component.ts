import { Component } from '@angular/core';

import { AuthService } from './shared/services/auth.service';
import { MeliService } from './shared/services/meli.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mottu-marketplace';

  constructor(private auth: AuthService, private meliService: MeliService) { }

  ngOnInit() {
    this.checkMeliCallBack();
    this.auth.checkLogin();
  }


  checkMeliCallBack() {
    let searchParams = new URLSearchParams(window.location.search);
    let code = searchParams.get('code');
    localStorage.setItem('mlToken', code );
    if (code) {
      this.meliService.getMeliToken(code);
    }
  }
}
