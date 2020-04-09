const mqtt = require("mqtt");
const controller = require("./controller")

const config = {
    clientId: "roman",
    username: "hack",
    password: "hack1234"
}

const client = mqtt.connect("mqtt://mga.twilightparadox.com", config)


client.on('connect', function () {
    client.subscribe('randomnerds', function (err) {
        if (!err) {
            client.publish('randomnerds', 'Hello From Server')
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    const l = new controller.Logic();

    // l.test();
    //client.end()
    //process.exit()
})

client.on("error", function (error) { console.log("Can't connect" + error) });
