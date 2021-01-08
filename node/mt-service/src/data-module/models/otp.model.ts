import { model, Mongoose } from "mongoose";
import { IOtpDocument, IOtpModel } from "../types/otp.type";
import OtpSchema from "../schemas/otp.schema";

// export const OtpModel = model<IOtpDocument>("otp", OtpSchema);
export const OtpModel = model<IOtpDocument>("otp", OtpSchema) as IOtpModel;
