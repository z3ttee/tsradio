package live.tsradio.discordbot.config

import java.io.File

object MainConfig : ConfigHelper("config.yml", "", 1) {

    override fun onCreate(file: File?) {
        putValue("general", "prefix", "tsr ")
        // TODO: Support nickname changes
        putValue("general", "nickname", "TSRadio")
    }

    override fun onCreateFailed(file: File) {}
    override fun onUpgrade(file: File, prevVersion: Int, newVersion: Int) {}
    override fun onDowngrade(file: File, prevVersion: Int, newVersion: Int) {}
}