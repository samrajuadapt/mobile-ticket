import { Document, Model } from "mongoose";

export enum LockState {
  WRONG_OTP = 1,
  TRY_OTP = 2,
}

export interface IOtp {
  tenantId: string;
  phoneNumber: string;
  attempts?: number;
  pin: string;
  created?: Date;
  lastUpdated?: Date;
  locked?: LockState;
  tries?: number;
}

export interface IOtpDocument extends IOtp, Document {
  resetOtp: (this: IOtpDocument, pin: string ) => Promise<void>;
  updateLock: (this: IOtpDocument, phone: string, tenantId: string, lockType: number ) => Promise<void>;
}
export interface IOtpModel extends Model<IOtpDocument> {
  createOtp: (
    this: IOtpModel,
    {
      tenantId,
      phoneNumber,
      pin,
    }: { tenantId: string; phoneNumber: string; pin: string }
  ) => Promise<IOtpDocument>;

  findByPhoneNumber: (
    this: IOtpModel,
    tId: string,
    number: string
  ) => Promise<IOtpDocument[]>;
}
