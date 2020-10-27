import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasMeliComponent } from '../app/components/pages/parceiros/mercado-livre/contas-meli/contas-meli.component';

describe('ContasMeliComponent', () => {
  let component: ContasMeliComponent;
  let fixture: ComponentFixture<ContasMeliComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContasMeliComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContasMeliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
