import * as Mongoose from "mongoose";
import { OtpModel } from "./models/otp.model";


let database: Mongoose.Connection;

export const connectDB = () => {
  const uri = "mongodb://user3:user3@localhost/test1";

  if (database) {
    return;
  }

  Mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  database = Mongoose.connection;

  database.once("open", async () => {
    console.log("Connected to database");
  });

  database.on("error", () => {
    console.log("Error connecting to database");
  });

  return {
    OtpModel,
  };
};

export const disconnectDB = () => {
  if (!database) {
    return;
  }
  Mongoose.disconnect();
};