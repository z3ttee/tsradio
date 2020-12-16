#!/usr/bin/bash

if screen -list | grep -q "streamer"; then
	screen -X -S "streamer" quit
fi