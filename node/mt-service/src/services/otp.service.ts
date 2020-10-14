import { connectDB } from "../data-module/database";
import { IOtp, IOtpDocument } from "../data-module/types/otp.type";
import { Request, Response } from "express";
import axios from "axios";
import * as fs from "fs";

export default class OtpService {
  private db = connectDB();
  private configFile = "./proxy-config.json";
  private userConfigFile = "./mt-service/src/config/config.json";
  private authToken = "nosecrets";
  private validAPIGWCert = "1";
  private host = "localhost:9090";
  private smsEndpoint = "/rest/notification/sendSMS";
  private supportSSL = false;
  private hostProtocol = "http://";
  private configuration: any;
  private userConfig: any;
  private tenantId: string;

  constructor() {
    this.configuration = JSON.parse(
      fs.readFileSync(this.configFile).toString()
    );
    this.userConfig = JSON.parse(
      fs.readFileSync(this.userConfigFile).toString()
    );
    this.tenantId = this.userConfig.tenant_id.value;
    this.authToken = this.configuration.auth_token.value;
    this.validAPIGWCert =
      this.configuration.gateway_certificate_is_valid.value.trim() === "true"
        ? "1"
        : "0";
    this.host = this.configuration.apigw_ip_port.value;
    this.supportSSL =
      this.configuration.support_ssl.value.trim() === "true" ? true : false;
    this.hostProtocol = this.supportSSL ? "https://" : "http://";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = this.validAPIGWCert;
  }

  public async sendSMS(req: Request, res: Response, otpInstance: IOtpDocument) {
    const url = this.hostProtocol + this.host + this.smsEndpoint;
    const phoneNumber = otpInstance.phoneNumber;
    // const message = otpInstance.otp;
    const message = "Please use the following OTP \n" + otpInstance.pin + "\n in order to complete your mobile ticket";
    let returnValue = "";
    await axios
      .post(url, null, {
        params: {
          phoneNumber,
          message,
        },
        headers: {
          "auth-token": this.authToken,
          "Content-Type": "application/json",
        },
      })
      .then(async function (response) {
        returnValue = response.data.code;
      })
      .catch(function (error) {
        console.log(error);
        returnValue = error;
      });

    return returnValue;
  }

  public async createOtp(otpInstance: IOtp) {
    // bind tenant ID
    otpInstance.tenantId = this.tenantId;

    try {
      return await this.db.OtpModel.createOtp(otpInstance);
    } catch (e) {
      return e;
    }
  }

  public async findByPhone(phone: string) {
    const tenantId = this.tenantId;
    try {
      return await this.db.OtpModel.findByPhoneNumber(tenantId, phone);
    } catch (e) {
      return e;
    }
  }
  public async deleteOtp(phone: string) {
    const tenantId = this.tenantId;
    try {
      return await this.db.OtpModel.deleteOne({tenantId: tenantId, phoneNumber: phone});
    } catch (e) {
      return e;
    }
  }

  

  public async lockUpdate(phone: string, lock: number) {
    const tenantId = this.tenantId;
    let returnVal = 0;
    let curDate = new Date();

    curDate.setMinutes(curDate.getMinutes() + 3);

    const newDate = new Date(curDate);

    try {
      await this.db.OtpModel.updateOne(
        { tenantId: tenantId, phoneNumber: phone },
        { locked: lock, lastUpdated: newDate }
      )
        .then((data) => {
          returnVal = data.n;
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
    return returnVal;
  }

  public async updateResendOtp(phone: string, _otp: string) {
    const tenantId = this.tenantId;
    let returnVal = '';
    let curDate = new Date();
    curDate.setMinutes(curDate.getMinutes() + 10);
    const newDate = new Date(curDate);

    try {
      const otp = await this.db.OtpModel.findByPhoneNumber(tenantId, phone);
      const attempts = otp[0].attempts;
      if (attempts > 1) {
        //set lock
        const a = await this.db.OtpModel.updateOne(
          { tenantId: tenantId, phoneNumber: phone },
          { locked: 2, lastUpdated: newDate, attempts: (attempts+1) }
        )
          .then((data) => {
            returnVal = 'locked';
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // increase attempt count
        const a = await this.db.OtpModel.updateOne(
          { tenantId: tenantId, phoneNumber: phone },
          { lastUpdated: newDate, attempts: (attempts+1), otp: _otp }
        )
          .then((data) => {
            returnVal = 'updated';
          })
          .catch((e) => {
            console.log(e);
          });
      }
    } catch (e) {
      console.log(e);
    }
    return returnVal;
  }
}
