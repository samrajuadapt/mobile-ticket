import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertDialogService } from "../shared/alert-dialog/alert-dialog.service";
import { TranslateService } from "@ngx-translate/core";

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
  selector: "app-ticket-loader",
  templateUrl: "./ticket-loader.component.html",
  styleUrls: ["./ticket-loader.component.css"],
})
export class TicketLoaderComponent implements OnInit {
  public showLoader: boolean = true;
  constructor(
    private router: Router,
    private translate: TranslateService,
    private alertDialogService: AlertDialogService
  ) {
    MobileTicketAPI.createVisit(
      (vstInfo) => {
        ga("send", {
          hitType: "event",
          eventCategory: "visit",
          eventAction: "create",
          eventLabel: "vist-create",
        });
        this.showLoader = false;
        this.router.navigate(["ticket"]);
      },
      (xhr, status, errorMessage) => {
        this.showLoader = false;
        if (errorMessage === "Gateway Timeout") {
          this.translate
            .get("connection.issue_with_connection")
            .subscribe((res: string) => {
              this.alertDialogService.activate(res);
            });
        }
        MobileTicketAPI.resetAllVars();
        this.router.navigate(["no_visit"]);
      }
    );
  }

  ngOnInit() {}
}
