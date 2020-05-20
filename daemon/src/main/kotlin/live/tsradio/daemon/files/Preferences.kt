package live.tsradio.daemon.files

import com.google.cloud.firestore.Firestore

data class Preferences(
    val node: PreferenceSections.GeneralSettings = PreferenceSections.GeneralSettings(),
    val icecast: PreferenceSections.IcecastSettings = PreferenceSections.IcecastSettings(),
    val channels: PreferenceSections.ChannelSettings = PreferenceSections.ChannelSettings(),
    val firestore: PreferenceSections.FirestoreSettings = PreferenceSections.FirestoreSettings())