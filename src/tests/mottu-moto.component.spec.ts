import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MottuMotoComponent } from '../app/shared/components/mottu-moto/mottu-moto.component';

describe('MottuMotoComponent', () => {
  let component: MottuMotoComponent;
  let fixture: ComponentFixture<MottuMotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MottuMotoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MottuMotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
