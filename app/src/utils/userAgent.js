import UAParser from "ua-parser-js";

export class UserAgent {

    static agent = UAParser(navigator.userAgent)

    static getDeviceType() {
        return this.agent.device.type || "desktop"
    }

}