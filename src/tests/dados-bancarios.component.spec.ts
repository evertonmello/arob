import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosBancariosComponent } from '../app/components/pages/financeiro/dados-bancarios/dados-bancarios.component';

describe('DadosBancariosComponent', () => {
  let component: DadosBancariosComponent;
  let fixture: ComponentFixture<DadosBancariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosBancariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DadosBancariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
