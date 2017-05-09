# audio-sync
Synchronizes audio playback between devices.


## How it works

*audio-sync* needs a time server and a broadcast server to be running
on your local network.

The time server is used to calculate clock differences between devices
running *audio-sync*.

The broadcast server is used to send commands to each *audio-sync* client.

It also supports loading audio from YouTube by using 
[youtube-audio-server](https://www.npmjs.com/package/youtube-audio-server)


## Install

Clone this repo, which is the *audio-sync* client.
Then install required servers:

`npm install -g websocket-broadcast time-diff-server youtube-audio-server`


## Run

First, start required servers:

`websocket-broadcast`

`tds`

`yas`

And, finally, start *audio-sync*:

`npm start`
