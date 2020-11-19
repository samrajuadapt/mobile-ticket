import OtpService from "../services/otp.service";
import { Request, Response } from "express";
import { OtpModel } from "../data-module/models/otp.model";
import { getOtpCode } from "../scripts/otp.helpers";

export class OtpController {
  private otpService: OtpService = new OtpService();

  public async createOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.sms) {
      const newOtp = new OtpModel();
      const sms = req.body.sms;
      newOtp.phoneNumber = req.body.phone;
      newOtp.pin = getOtpCode(4);
      await this.otpService
        .findByPhone(newOtp.phoneNumber)
        .then(async (result) => {
          if (result.length == 0) {
            await this.otpService
              .createOtp(newOtp)
              .then(async (result) => {
                if (result) {
                  // send SMS
                  await this.otpService
                    .sendSMS(req, res, newOtp, sms)
                    .then(async (result) => {
                      if (result == "1") {
                        return res.sendStatus(200);
                      } else {
                        await this.otpService
                          .deleteOtp(newOtp.phoneNumber)
                          .then(async (result) => {
                            return res.sendStatus(500);
                          })
                          .catch((error) => {
                            return res.sendStatus(500);
                          });
                        return res.sendStatus(500);
                      }
                    })
                    .catch((error) => {
                      return res.status(500);
                    });
                } else {
                  return res.sendStatus(500);
                }
              })
              .catch((error) => {
                return res.status(500);
              });
          } else {
            // return otp
            const otp = result[0];
            return res.json({
              phoneNumber: otp.phoneNumber,
              lastUpdated: otp.lastUpdated,
              attempts: otp.attempts,
              tries: otp.tries,
            });
          }
        })
        .catch((error) => {
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }
  public async checkOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.pin) {
      const phone = req.body.phone;
      const pin = req.body.pin;
      await this.otpService
        .findByPhone(phone)
        .then(async (result) => {
          if (result.length == 1) {
            const otp = result[0];
            if (otp.pin === pin && otp.attempts < 3 && otp.tries < 3) {
              return res.sendStatus(200);
            } else {
              // update tries
              await this.otpService
                .updateTryOTP(otp.phoneNumber, otp.tries + 1)
                .then(async (result) => {
                  if (result == 1) {
                    await this.otpService
                      .findByPhone(otp.phoneNumber)
                      .then(async (result) => {
                        const otp_ = result[0];
                        return res.json({
                          phoneNumber: otp_.phoneNumber,
                          lastUpdated: otp_.lastUpdated,
                          attempts: otp_.attempts,
                          tries: otp_.tries,
                        });
                      })
                      .catch((error) => {
                        return res.status(500);
                      });
                  } else {
                    res.sendStatus(500);
                  }
                })
                .catch((error) => {
                  return res.status(500);
                });
            }
          } else {
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

  public async lockOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.lockType) {
      const phone = req.body.phone;
      const lockType = req.body.lockType;
      await this.otpService
        .lockUpdate(phone, lockType)
        .then(async (result) => {
          if (result == 1) {
            res.sendStatus(200);
          } else {
            res.sendStatus(500);
          }
        })
        .catch((error) => {
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async getTime(req: Request, res: Response) {
    if (req.body.phone) {
      const phone = req.body.phone;
      await this.otpService
        .findByPhone(phone)
        .then(async (result) => {
          if (result.length == 1) {
            const otp_ = result[0];
            const now = Date.now();
            const updatedAt = Date.parse(otp_.lastUpdated);
            const timeDif = Math.ceil((now - updatedAt) / 1000);
            return res.json({
              phoneNumber: otp_.phoneNumber,
              lastUpdated: otp_.lastUpdated,
              timeDif: timeDif,
            });
          } else {
            return res.json({
              timeDif: 'expired'
            });
          }  
        })
        .catch((error) => {
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async resendOtp(req: Request, res: Response) {
    if (req.body.phone && req.body.sms) {
      const phoneNumber = req.body.phone;
      const sms = req.body.sms;
      const pin = getOtpCode(4);
      await this.otpService
        .updateResendOtp(phoneNumber, pin)
        .then(async (result) => {
          if (result == "updated") {
            const newOtp = new OtpModel();
            newOtp.phoneNumber = phoneNumber;
            newOtp.pin = pin;
            await this.otpService
              .sendSMS(req, res, newOtp, sms)
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
          return res.status(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async deleteOtp(req: Request, res: Response) {
    if (req.body.phone) {
      const phone = req.body.phone;
      await this.otpService
        .deleteOtp(phone)
        .then(async (result) => {
          return res.sendStatus(200);
        })
        .catch((error) => {
          return res.sendStatus(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }

  public async validateTID(req: Request, res: Response) {
    await this.otpService
      .checkTID()
      .then(async (result) => {
        return res.json({
          tenantID: result,
        });
      })
      .catch((error) => {
        return res.sendStatus(500);
      });
  }
}
