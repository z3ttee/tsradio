import { Platform } from "@angular/cdk/platform";

export function isMobilePlatform(platform: Platform) {
    return platform.ANDROID || platform.IOS;
}