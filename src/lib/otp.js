import moment from "moment";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const getOtpExpiry = () => {
  return moment()
    .add(3, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
};