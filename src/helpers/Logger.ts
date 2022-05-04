import { Config } from "../types/Config";

export class Logger {
  constructor(private config: Config) {
    if (config.enableLogging) {
      this.log("constructor", "Logging has been enabled");
    }
  }

  public log(method: string, message: string, isFatal = false, data?: any) {
    if (this.config.enableLogging) {
      const log = `HM (${method}) - ${message}`;

      if (data) {
        console.log(log, data);
      }
      else {
        console.log(log);
      }

      if (this.config.logger) {
        this.config.logger(method, message, isFatal, data);
      }

      if (isFatal) {
        throw new Error(log);
      }
    }
  }
}
