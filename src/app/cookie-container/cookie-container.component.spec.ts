import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieContainerComponent } from './cookie-container.component';

describe('CookieContainerComponent', () => {
  let component: CookieContainerComponent;
  let fixture: ComponentFixture<CookieContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CookieContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
