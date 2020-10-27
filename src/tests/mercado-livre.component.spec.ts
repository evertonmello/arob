import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MercadoLivreComponent } from '../app/components/pages/parceiros/mercado-livre/mercado-livre.component';

describe('MercadoLivreComponent', () => {
  let component: MercadoLivreComponent;
  let fixture: ComponentFixture<MercadoLivreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MercadoLivreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MercadoLivreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
