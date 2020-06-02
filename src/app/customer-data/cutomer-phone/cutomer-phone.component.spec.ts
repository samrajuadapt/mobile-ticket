import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CutomerPhoneComponent } from './cutomer-phone.component';

describe('CutomerPhoneComponent', () => {
  let component: CutomerPhoneComponent;
  let fixture: ComponentFixture<CutomerPhoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutomerPhoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutomerPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
