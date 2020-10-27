import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoteirizadoDetalheComponent } from '../app/components/pages/pedidos/roteirizado-detalhe/roteirizado-detalhe.component';

describe('RoteirizadoDetalheComponent', () => {
  let component: RoteirizadoDetalheComponent;
  let fixture: ComponentFixture<RoteirizadoDetalheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoteirizadoDetalheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoteirizadoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
