#!/usr/bin/bash

if screen -list | grep -q "tsrd"; then
	screen -X -S "tsrd" quit
fi