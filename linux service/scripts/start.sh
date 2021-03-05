#!/usr/bin/bash

if ! screen -list | grep -q "streamer"; then
	screen -dmS "streamer" sh -c 'java -Xmx512M -Duser.dir=/path/to/tsradio/ -jar /path/to/tsradio/streamer.jar; exec bash'
fi
