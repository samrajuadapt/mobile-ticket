export function generateOTP(n) {
  const add = 1;
  let max = 12 - add;

  if (n > max) {
    return generateOTP(this.max) + generateOTP(n - this.max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10;
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}

export function getOtpCode(len): string {
    return generateOTP(parseInt(len));
}