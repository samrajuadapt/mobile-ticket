import { IOtpDocument, LockState } from "../types/otp.type";

// all static methods are defined here

export async function resetOtp(this: IOtpDocument, pin: string): Promise<void> {
  const now = new Date();
  if (this.lastUpdated < now) {
    // have to set 3 minute restriction
    this.lastUpdated = now;
    this.pin = pin;
    this.attempts = this.attempts + 1;
    await this.save();
  }
}

export async function updateLock(
  this: IOtpDocument,
  phone: string,
  tenantId: string,
  lockType: number
): Promise<void> {
  await this.updateOne(
    { tenantId: tenantId, phoneNumber: phone },
    { locked: lockType == 1 ? LockState.TRY_OTP : LockState.WRONG_OTP }
  )
    .then((obj) => {
      console.log(obj);
    })
    .catch((err) => {
      console.log(err);
    });
}
