import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-cookie-container',
  templateUrl: './cookie-container.component.html',
  styleUrls: ['./cookie-container.component.css']
})
export class CookieContainerComponent implements OnInit {

  constructor(
    public router: Router,
    private location: Location,
    private http: HttpClient
  ) {
    const CookieContainer = document.getElementById('cookies-container');
    if (CookieContainer) {
      CookieContainer.style.display = "none";
    }
  }
  onBackButtonPressed() {
    const CookieContainer = document.getElementById('cookies-container');
    if (CookieContainer) {
      CookieContainer.style.display = "block";
    }
    this.location.back();
  }
  ngOnInit() {
    const defaultPath = "app/locale/cookie-consent-files/cookie-en-US.html";
    const addedPath =  "app/locale/cookie-consent-files/cookie-" + navigator.language + '.html';  
    const cookieDescription = document.getElementById('cookie-content');
    this.http.get(addedPath, { responseType: "text" }).subscribe(
      data => {
        if (cookieDescription) {
          cookieDescription.innerHTML = data;
        }
      },
      error => {
        this.http.get(defaultPath, { responseType: "text" }).subscribe(
          data => {
            if (cookieDescription) {
              cookieDescription.innerHTML = data;
            }
          });
      }
      );
  }

}
