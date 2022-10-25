import { BaseConfig } from '../types/BaseConfig';

export class Logger {
    private config: BaseConfig;

    public setConfig(config: BaseConfig) {
        this.config = config;
    }

    public log(method: string, message: string, isFatal = false, data?: any) {
        if (this.config.enableLogging) {
            const log = `HM (${method}) - ${message}`;

            if (data) {
                console.log(log, data);
            } else {
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
