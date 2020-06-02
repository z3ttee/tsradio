#!/usr/bin/bash

if ! screen -list | grep -q "tsrd"; then
	screen -dmS "tsrd" sh -c 'java -Xmx512M -Duser.dir=/home/server/tsradio/ -jar /home/server/tsradio/daemon.jar; exec bash'
fi