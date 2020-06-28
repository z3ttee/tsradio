# TSRadio Project
This repository consists of multiple projects together building the system behind TSRadio. The project is a private project of mine (not intended for public usage in near future).

#### Daemon
WiP

#### Master
The master is build upon a socketio implementation for netty, so listeners to the radio connect to this socket to receive metadata updates in realtime.\
Daemons also connect to the same socket to provide these updates.
Because the daemon and the master are sharing the file ``preferences.json`` it is necessary to place these jars into the same directory.\
If a daemon is detected by the master on startup, it will automatically be executed.
Additionally you should create a java keystore, holding a certificate, in the same directory (make sure to name it exactly ``keystore.jks``). Otherwise ssl wont be supported.\
 \
Before installing as a service, make sure that the ``screen``-package is installed.
Installation as service (Make sure to execute this as root (or using sudo before the actual command), or make sure the application can write to ``/etc/systemd/system/``):
```
screen java -jar master.jar -installService -user YOUR_USERNAME
```
This only works on linux. A ``.service`` file will be created and starting the service can be done using ``systemd``. The service name will be ``tsrm`` or ``tsrm.service``\
The start and stop scripts can then be found in the ``/scripts/`` directory in the root of the application. \
You can open the console using ``screen -r tsrm`` when logged in as the same user the master is started with
 \
How to run the ``master.jar`` (non-service):
```
java -Xmx256M -jar master.jar
```

Generating the certificate using the Java's keytool (self-signed cert):
```
keytool -genkey -keyalg RSA -alias selfsigned -keystore PATH\TO\keystore.jks -storepass YOUR_KEYSTORE_PASSWORD -validity DESIRED_EXPIRY_IN_DAYS -keysize 2048
```
