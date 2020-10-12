import { connectDB } from "../../data-module/database";
import { OtpModel } from "../../data-module/models/otp.model";

(async () => {
    const otp = { tenantId: "001", phoneNumber: "0000000", otp: "123" };
    
    try {
      const a = await connectDB().OtpModel.createOtp(otp);
      console.log(a);
    } catch (e) {
      console.log(e);
    }
  })();