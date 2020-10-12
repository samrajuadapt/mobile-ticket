import * as http from "http";
import * as fs from "fs";
import app from "./config/app";

let port = 82;
let otpService = "disable";
let configFile = "../proxy-config.json";
let userConfigFile = "../../src/app/config/config.json";

//update configurations using config.json
var configuration = JSON.parse(fs.readFileSync(configFile, "utf8"));
//update user-configurations using config.json for functional server
var userConfiguration = JSON.parse(fs.readFileSync(userConfigFile, "utf8"));

otpService = userConfiguration.otp_service.value;
port = configuration.local_functional_server_port.value;

if (otpService == "enable") {
  app.listen(port, () => {
    console.log('MT service server listening on port ' + port);
 });
}
