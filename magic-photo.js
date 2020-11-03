const noble = require('@abandonware/noble');
const KanoWand = require('./index');
const mpv = require('node-mpv');


const wand = new KanoWand();

const JSONOptions = {
  "socket": "/tmp/node-mpv.sock"
};

const commandLineOptions = [
  "--fullscreen",
  "--start=+1",
  "--pause",
  "--loop-file"
];

const player = new mpv(JSONOptions, commandLineOptions);

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  let deviceName = peripheral.advertisement.localName || "";
  if (deviceName.startsWith("Kano-Wand")) {
    noble.stopScanning();
    console.log("foundWand");

    peripheral.connect(function (error) {
      wand.init(peripheral)
        .then(() => {
          player.load("/home/pirelay/kano-wand-nodejs/video/current-video/video.mp4")
          wand.vibrate(1);
        });
    });
  }

});

wand.spells.subscribe((spell) => {
  console.log(spell);
  if (spell.spell === 'Locomotor') {
    player.togglePause();
  }
});

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    wand.reset_position();
  }
});