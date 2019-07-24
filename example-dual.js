const PROTO_PATH = __dirname + '/protos/WandService.proto';
const WAND_1_LABEL = "wand1";
const WAND_2_LABEL = "wand2";

const config = require('./config.json');
var noble = require('noble');
const KanoWand = require('./index')
const kanoInfo = require('./kano_info.json');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var wand_proto = grpc.loadPackageDefinition(packageDefinition).duelingfundamentals;

if (config.GRPC.ENABLED) {
  var client = new wand_proto.WandService(config.GRPC.SERVER + ':' + config.GRPC.PORT, grpc.credentials.createInsecure());
}

var wand1 = new KanoWand();
var wand2 = new KanoWand();

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    console.log('[Noble] Scanning for devices...');
    noble.startScanning();
  } else {
    console.log('[Noble] Stopping device scan due to state change to', state);
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  let deviceName = peripheral.advertisement.localName || "";
  if (deviceName.startsWith("Kano-Wand") && !wand1.name && isRequestedDeviceName(config.WAND.WAND_1_DEVICE_NAME, deviceName)) {
    wand1.name = "Wand_1 (" + deviceName + ")";
    console.log("Found wand1 with name", deviceName);

    if (wand1.name && wand2.name) {
      console.log('[Noble] Stopping device scan since all required wands have been discovered.');
      noble.stopScanning();
    }

    peripheral.connect(function (error) {
      wand1.init(peripheral, wand1.name)
        .then(() => {
          wand1.vibrate(kanoInfo.PATTERN.REGULAR);
          wand1.spells.subscribe((spell) => {
            console.log(wand1.name, spell);

            if (client) {
              client.castSpell({ name: spell.spell, wand: WAND_1_LABEL}, function (err, response) {
                if (!err && response) {
                  console.log('Response to castSpell from server:', response.message);
                } else {
                  console.error('Error response to castSpell from server:', err)
                }
              });
            }
          });

          wand1.onWandMove.subscribe((obj) => {
            if (client) {
              client.wandMove({wand: WAND_1_LABEL, position: {x: obj.x, y: obj.y}, isButtonPressed: obj.isButtonPressed}, function (err, response) {
                if (!err && response) {
                  // Useful for debugging, but very verbose
                  //console.log('Response to wandMove from server:', response.message);
                } else {
                  console.error('Error response to wandMove from server:', err)
                }
              });
            }
          });

          setInterval(() => {
            wand1.sendKeepAlive(() => {
              console.log('Sent keep alive for wand1 at interval')
            });
          }, 1000 * config.WAND.KEEP_ALIVE_FREQUENCY_IN_SECONDS);
        });
    });
  }
  else if (deviceName.startsWith("Kano-Wand") && !wand2.name && isRequestedDeviceName(config.WAND.WAND_2_DEVICE_NAME, deviceName)) {
    wand2.name = "Wand_2 (" + deviceName + ")";
    console.log("Found wand2 with name", deviceName);

    if (wand1.name && wand2.name) {
      console.log('[Noble] Stopping device scan since all required wands have been discovered.');
      noble.stopScanning();
    }

    peripheral.connect(function (error) {
      wand2.init(peripheral, wand2.name)
        .then(() => {
          wand2.vibrate(kanoInfo.PATTERN.REGULAR, () => {
            // Vibrate again for the second wand
            setTimeout(() => {
              wand2.vibrate(kanoInfo.PATTERN.REGULAR)
            }, 500);
          });
          wand2.spells.subscribe((spell) => {
            console.log(wand2.name, spell);

            if (client) {
              client.castSpell({ name: spell.spell, wand: WAND_2_LABEL, positions: spell.positions.map(([x, y]) => { return { x: x, y: y } }) }, function (err, response) {
                if (!err && response) {
                  console.log('Response to castSpell from server:', response.message);
                } else {
                  console.error('Error response to castSpell from server:', err)
                }
              });
            }
          });

          wand2.onWandMove.subscribe((obj) => {
            if (client) {
              client.wandMove({wand: WAND_2_LABEL, position: {x: obj.x, y: obj.y}, isButtonPressed: obj.isButtonPressed}, function (err, response) {
                if (!err && response) {
                  // Useful for debugging, but very verbose
                  //console.log('Response to wandMove from server:', response.message);
                } else {
                  console.error('Error response to wandMove from server:', err)
                }
              });
            }
          });

          setInterval(() => {
            wand2.sendKeepAlive(() => {
              console.log('Sent keep alive for wand2 at interval')
            });
          }, 1000 * config.WAND.KEEP_ALIVE_FREQUENCY_IN_SECONDS);
        });
    });
  }
});

let isRequestedDeviceName = function(requestedDeviceName, deviceName) {
  if (!requestedDeviceName) {
    // No specific device name was requested, so accept any device name
    return true;
  } else if (!deviceName) {
    // Should not accept an empty device name
    return false;
  }

  let requested = requestedDeviceName.toLowerCase();
  let actual = deviceName.toLowerCase();

  return requested === actual;
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    wand1.reset_position();
    wand2.reset_position();
  }
});
