# audio-sync
Synchronizes audio playback between devices.


## How it works

*audio-sync* needs a time server and a broadcast server to be running
on your local network.

The time server is used to calculate clock differences between devices
running *audio-sync*.

The broadcast server is used to send commands to each *audio-sync* client.


## Install

Clone this repo, which is the *audio-sync* client.
Then install required servers:

`npm install -g websocket-broadcast time-diff-server`


## Run

`npm start`
