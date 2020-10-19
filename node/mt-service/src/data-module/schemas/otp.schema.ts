import * as Mongoose from "mongoose";
import { resetOtp } from "../methods/otp.method";
import { createOtp, findByPhoneNumber } from "../statics/otp.static";

const deletionTime = 3; // document expiration time in minutes

const OtpSchema = new Mongoose.Schema({
  tenantId: String,
  phoneNumber: String,
  attempts: {
    type: Number,
    default: 0,
  },
  pin: String,
  created: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  locked: {
    type: Number
  },
  tries:{
    type: Number,
    default: 0,
  }
});

// set compound index (composite key)
OtpSchema.index({ tenantId: 1, phoneNumber: 1 }, { unique: true });
// set TTL index for 3 minutes
OtpSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: deletionTime*60 });

OtpSchema.statics.createOtp = createOtp;
OtpSchema.statics.findByPhoneNumber = findByPhoneNumber;

OtpSchema.methods.resetOtp = resetOtp;

export default OtpSchema;
