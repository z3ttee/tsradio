package live.tsradio.master.files

data class Preferences(
    val node: PreferenceSections.GeneralSettings = PreferenceSections.GeneralSettings(),
    val icecast: PreferenceSections.IcecastSettings = PreferenceSections.IcecastSettings(),
    val mySQL: PreferenceSections.MySQLSettings = PreferenceSections.MySQLSettings()
)