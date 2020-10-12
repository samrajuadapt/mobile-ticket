import { Document, Model } from "mongoose";

export enum LockState {
  WRONG_OTP = 0,
  TRY_OTP = 1,
}

export interface IOtp {
  tenantId: string;
  phoneNumber: string;
  attempts?: number;
  otp: string;
  created?: Date;
  lastUpdated?: Date;
  locked?: LockState;
}

export interface IOtpDocument extends IOtp, Document {
  resetOtp: (this: IOtpDocument, otp: string ) => Promise<void>;
  updateLock: (this: IOtpDocument, phone: string, tenantId: string, lockType: number ) => Promise<void>;
}
export interface IOtpModel extends Model<IOtpDocument> {
  createOtp: (
    this: IOtpModel,
    {
      tenantId,
      phoneNumber,
      otp,
    }: { tenantId: string; phoneNumber: string; otp: string }
  ) => Promise<IOtpDocument>;

  findByPhoneNumber: (
    this: IOtpModel,
    tId: string,
    number: string
  ) => Promise<IOtpDocument[]>;
}
