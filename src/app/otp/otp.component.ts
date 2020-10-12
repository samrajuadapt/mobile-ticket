import { Component, OnInit } from '@angular/core';
declare var MobileTicketAPI: any;
@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {

  public phoneNumber: string;
  constructor() { }

  ngOnInit() {
    // MobileTicketAPI.sendOTP();
    MobileTicketAPI.getOTP();
  }

  m(){
    console.log(77777777);
  }

}
