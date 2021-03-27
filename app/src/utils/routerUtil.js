import config from "@/config/config"

export class RouterUtil {

    static setPageTitle(title) {
        document.title = config.app.titlePrefix + ( title || config.app.slogan )
    }

}