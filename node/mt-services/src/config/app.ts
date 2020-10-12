import * as express from "express";
import { connectDB } from "../data-module/database";
import { OtpRoutes } from "../routes/otp.routes";
import * as cors from 'cors';
import bodyParser = require("body-parser");
import * as dotenv from "dotenv";




// // const otp = { tenantId: "001", phoneNumber: "0000000", otp: "123" };
// // console.log(OtpModel.create(otp));
// // const morgan = require("morgan");
// // const bodyParser = require("body-parser");
// // const env = require('dotenv').config('.env');
// // const otpRoutes = require("./api/routes/otp");
// // const dbConnector = require("./db");

// // app.use(morgan("dev"));
// // app.use(bodyParser.urlencoded({ extended: false }));
// // app.use(bodyParser.json());

// // // Routes
// // app.use("/otp", otpRoutes);


class App {

  public app: express.Application;

  private otpRoutes: OtpRoutes = new OtpRoutes();

  constructor() {
    this.app = express();
    this.config();
    this.otpRoutes.route(this.app);
    connectDB();
  }

  private config(): void {

    const _this = this.app;
    _this.use(cors());
    _this.use(bodyParser.json());
    _this.use(bodyParser.urlencoded({ extended: true }));
    dotenv.config();
    
    
  }
}
export default new App().app;
