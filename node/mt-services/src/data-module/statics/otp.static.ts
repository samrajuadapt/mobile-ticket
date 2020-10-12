import { Error } from "mongoose";
import { IOtpDocument, IOtpModel } from "../types/otp.type";

// all static methods are defined here

export async function createOtp(
  this: IOtpModel,
  {
    tenantId,
    phoneNumber,
    pin,
  }: {
    tenantId: string;
    phoneNumber: string;
    pin: string;
  }
): Promise<IOtpDocument> {
  const record = await this.findOne({ tenantId, phoneNumber });
  if (record) {
    throw new Error('User already exists');
  } else {
    return this.create({ tenantId, phoneNumber, pin });
  }
}

export async function findByPhoneNumber(
  this: IOtpModel,
  tId: string,
  number: string
): Promise<IOtpDocument[]> {
  return await this.find({ tenantId: tId, phoneNumber: number });
}

