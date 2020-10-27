import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoAndamentoComponent } from '../app/components/pages/pedidos/pedido-andamento/pedido-andamento.component';

describe('PedidoAndamentoComponent', () => {
  let component: PedidoAndamentoComponent;
  let fixture: ComponentFixture<PedidoAndamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoAndamentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoAndamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
