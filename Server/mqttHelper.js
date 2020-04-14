const mqtt = require("mqtt");
const { RANDOM_NERDS_SERVER } = { RANDOM_NERDS_SERVER: "randomnerdsServer" };

const config = {
  port: 1883,
  clientId: "roman_local",
  username: "hack",
  password: "hack1234",
};

const server = mqtt.connect("mqtt://mga.twilightparadox.com", config);
server.on("connect", function () {
  server.subscribe(RANDOM_NERDS_SERVER, function (err) {
    if (!err) {
      console.log("Server connected to MQTT");
    }
  });
});

server.on("error", function (error) {
  console.log("Can't connect" + error);
});

module.exports.mqttHelper = server;
