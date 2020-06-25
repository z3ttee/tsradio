package live.tsradio.dataserver.files

data class Preferences(
        val mySQL: PreferenceSections.MySQLSettings = PreferenceSections.MySQLSettings(),
        val dataserver: PreferenceSections.DataserverSettings = PreferenceSections.DataserverSettings())