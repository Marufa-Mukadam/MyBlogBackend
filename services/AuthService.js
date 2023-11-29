import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const key = "secretkey";
export const emailVerification = (newpassword, email) => {

  const salt = bcrypt.genSaltSync(10);
  console.log("salt",salt)
  const hash = bcrypt.hashSync(newpassword, salt);

  //generating 6 digit otp
  const otp = Math.floor(Math.random() * 10000 + 1);
  //5 minutes expiry in milliseconds
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  const otp_data = `${email}.${otp}.${otpExpiry}`; //email.otp.expiry_timestamp
  const hashotp = crypto
    .createHmac("sha256", key)
    .update(otp_data)
    .digest("hex");
  const hashedotp = `${hashotp}.${otpExpiry}`;
  let retData = {};
  retData.hashedotp = hashedotp;
  retData.otp = otp;
  retData.hash = hash;
  return retData;
};
