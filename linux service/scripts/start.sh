#!/usr/bin/bash

if ! screen -list | grep -q "streamer"; then
	screen -dmS "streamer" sh -c 'java -Xmx512M -Duser.dir=/home/philserver/tsradio/ -jar /home/philserver/streamer.jar; exec bash'
fi
