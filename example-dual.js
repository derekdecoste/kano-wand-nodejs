var noble = require('noble');
const KanoWand = require('./index')

var PROTO_PATH = __dirname + '/protos/WandService.proto';

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

var client = new wand_proto.WandService('localhost:50051', grpc.credentials.createInsecure());

var wand1 = new KanoWand();
var wand2 = new KanoWand();

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  let deviceName = peripheral.advertisement.localName || "";
  if (deviceName.startsWith("Kano-Wand") && !wand1.name) {
    console.log("Found wand1 with name", deviceName);

    peripheral.connect(function (error) {
      wand1.init(peripheral, "Wand_1 (" + deviceName + ")")
        .then(() => {
          wand1.vibrate(1);
          wand1.spells.subscribe((spell) => {
            console.log(wand1.name, spell);
            client.castSpell({ name: spell.spell, wand: "wand1"}, function (err, response) {
              console.log('Response from gRPC server:', response.message);
            });
          });

          wand1.onWandMove.subscribe((obj) => {
            client.wandMove({wand: "wand1", position: {x: obj.x, y: obj.y}, isButtonPressed: obj.isButtonPressed}, function (err, response) {
              console.log('Response from gRPC server:', response.message);
            });
          });
        });
    });
  }
  else if (deviceName.startsWith("Kano-Wand") && !wand2.name) {
    noble.stopScanning();
    console.log("Found wand2 with name", deviceName);

    peripheral.connect(function (error) {
      wand2.init(peripheral, "Wand_2 (" + deviceName + ")")
        .then(() => {
          wand2.vibrate(1);
          wand2.spells.subscribe((spell) => {6
            console.log(wand2.name, spell);
            client.castSpell({ name: spell.spell, wand: "wand2", positions: spell.positions.map(([x, y]) => { return { x: x, y: y } }) }, function (err, response) {
              console.log('Response from gRPC server:', response.message);
            });
          });

          wand2.onWandMove.subscribe((obj) => {
            client.wandMove({wand: "wand2", position: {x: obj.x, y: obj.y}, isButtonPressed: obj.isButtonPressed}, function (err, response) {
              console.log('Response from gRPC server:', response.message);
            });
          });
        });
    });
  }
});

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    wand1.reset_position();
    wand2.reset_position();
  }
});
