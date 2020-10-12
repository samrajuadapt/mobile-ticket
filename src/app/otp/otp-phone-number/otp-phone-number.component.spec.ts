import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpPhoneNumberComponent } from './otp-phone-number.component';

describe('OtpPhoneNumberComponent', () => {
  let component: OtpPhoneNumberComponent;
  let fixture: ComponentFixture<OtpPhoneNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpPhoneNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpPhoneNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
