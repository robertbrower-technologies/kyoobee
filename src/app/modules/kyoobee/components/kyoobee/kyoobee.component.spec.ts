import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KyoobeeComponent } from './kyoobee.component';

describe('KyoobeeComponent', () => {
  let component: KyoobeeComponent;
  let fixture: ComponentFixture<KyoobeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KyoobeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KyoobeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
