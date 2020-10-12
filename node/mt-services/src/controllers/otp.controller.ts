import OtpService from "../services/otp.service";
import { Request, Response } from "express";
import { OtpModel } from "../data-module/models/otp.model";
import { getOtpCode } from "../scripts/otp.helpers";

export class OtpController {
  private otpService: OtpService = new OtpService();

  public async createOtp(req: Request, res: Response) {
    if (req.body.phone) {
      const newOtp = new OtpModel();
      newOtp.phoneNumber = req.body.phone;
      newOtp.otp = getOtpCode(process.env.TOKEN_LENGTH);

      await this.otpService
        .createOtp(newOtp)
        .then(async (result) => {
          if (result instanceof Error) {
            // user already exists
            return res.sendStatus(208);
          } else {
            await this.otpService
              .sendSMS(req, res, newOtp)
              .then((result) => {
                return res.sendStatus(200);
              })
              .catch((error) => {
                return res.status(500);
              });
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }
  public async checkOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.otp) {
      const phone = req.body.phone;
      const otp = req.body.otp;
      await this.otpService
        .findByPhone(phone)
        .then(async (result) => {
          if (result.length == 1) {
            if (result[0].otp === otp) {
              res.sendStatus(200);
            } else {
              res.sendStatus(201);
            }
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async lockOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.lockType) {
      const phone = req.body.phone;
      const lockType = req.body.lockType;
      await this.otpService
        .lockUpdate(phone, lockType)
        .then(async (result) => {
          console.log(result);
          if (result == 1) {
            res.sendStatus(200);
          } else {
            res.sendStatus(500);
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async resendOtp(req: Request, res: Response) {
    if (req.body.phone) {
      const phoneNumber = req.body.phone;
      const otp = getOtpCode(process.env.TOKEN_LENGTH);
      
      await this.otpService
        .updateResendOtp(phoneNumber, otp)
        .then(async (result) => {
          if (result == "updated") {
            const newOtp = new OtpModel();
            newOtp.phoneNumber = phoneNumber;
            newOtp.otp = otp;
            await this.otpService
              .sendSMS(req, res, newOtp)
              .then((result) => {
                return res.sendStatus(200);
              })
              .catch((error) => {
                return res.status(500);
              });
          } else {
            // user locked
            return res.sendStatus(201);
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }
}
