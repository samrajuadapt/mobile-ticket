import { Application, Request, Response } from "express";
import { OtpController } from "../controllers/otp.controller";

export class OtpRoutes {

    private otpController: OtpController = new OtpController();

    public route(app: Application) {
            
        app.post('/MTService/sms', (req: Request, res: Response) => {  
            this.otpController.createOtp(req, res);
        });
        app.post('/MTService/otp/check', (req: Request, res: Response) => {
            this.otpController.checkOtp(req, res);
        });
        app.post('/MTService/otp/lock', (req: Request, res: Response) => {
            this.otpController.lockOtp(req, res);
        });
        app.post('/MTService/otp/resend', (req: Request, res: Response) => {
            this.otpController.resendOtp(req, res);
        });
        app.post('/MTService/otp/time', (req: Request, res: Response) => {
            this.otpController.getTime(req, res);
        });
        app.post('/MTService/otp/validateTID', (req: Request, res: Response) => {
            this.otpController.validateTID(req, res);
        });
        app.delete('/MTService/otp/delete', (req: Request, res: Response) => {
            this.otpController.deleteOtp(req, res);
        });

    }
}