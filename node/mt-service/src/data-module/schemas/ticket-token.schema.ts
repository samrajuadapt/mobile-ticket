import * as Mongoose from "mongoose";
// import { resetOtp } from "../methods/otp.method";
import { createToken, findByToken } from "../statics/ticket-token.static";

const deletionTime = 1; // document expiration time in minutes

const TicketTokenSchema = new Mongoose.Schema({
  tenantId: String,
  token: String,
  created: {
    type: Date,
    default: Date.now,
  }
});

// set compound index (composite key)
TicketTokenSchema.index({ tenantId: 1, token: 1 }, { unique: true });
// set TTL index for 3 minutes
TicketTokenSchema.index({ created: 1 }, { expireAfterSeconds: deletionTime*60 });

TicketTokenSchema.statics.createToken = createToken;
TicketTokenSchema.statics.findByToken= findByToken;

// OtpSchema.methods.resetOtp = resetOtp;

export default TicketTokenSchema;
