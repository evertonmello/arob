import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilojasComponent } from '../app/components/pages/multilojas/multilojas.component';

describe('MultilojasComponent', () => {
  let component: MultilojasComponent;
  let fixture: ComponentFixture<MultilojasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultilojasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilojasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
