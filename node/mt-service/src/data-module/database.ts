import * as Mongoose from "mongoose";
import { OtpModel } from "./models/otp.model";
import * as fs from "fs";


let database: Mongoose.Connection;
let configuration: any;
const userConfigFile = "mt-service/src/config/config.json";
configuration = JSON.parse(
  fs.readFileSync(userConfigFile).toString()
);
const localConString = configuration.db_connection_string.value;

export const connectDB = () => {
  const uri = localConString;

  if (database) {
   return;
  }
  // Mongoose.set('maxTimeMS', 5000);
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

  // database.on("disconnected", async () => {
  //   console.log("disconnected from database");
  // });

  // database.on("close", async () => {
  //   console.log("close");
  // });

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