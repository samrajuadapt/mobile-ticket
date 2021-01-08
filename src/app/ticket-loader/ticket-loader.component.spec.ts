import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketLoaderComponent } from './ticket-loader.component';

describe('TicketLoaderComponent', () => {
  let component: TicketLoaderComponent;
  let fixture: ComponentFixture<TicketLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
