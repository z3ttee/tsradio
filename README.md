# TSRadio Project
This repository consists of multiple projects together building the system behind TSRadio. The project is a private project of mine (not intended for public usage in near future).

#### Daemon
WiP

#### Dataserver
The dataserver is build upon a socketio implementation for netty, so listeners to the radio connect to this socket to receive metadata updates in realtime.\
Daemons also connect to the same socket to provide these updates.
Because the daemon and the dataserver are sharing the file ``preferences.json`` it is necessary to place these jars into the same directory.\
Additionally you should create a java keystore, holding a certificate, in the same directory (make sure to name it exactly ``keystore.jks``). The sockets wont work without an ssl certificate.\
 \
How to run the ``dataserver.jar``:
```
java -Xmx256M -jar dataserver.jar -keystorepw YOUR_KEYSTORE_PASSWORD
```
Generating the certificate using the Java's keytool (self-signed cert):
```
keytool -genkey -keyalg RSA -alias selfsigned -keystore PATH\TO\keystore.jks -storepass YOUR_KEYSTORE_PASSWORD -validity DESIRED_EXPIRY_IN_DAYS -keysize 2048
```
