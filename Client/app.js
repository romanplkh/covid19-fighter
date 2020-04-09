

// Create a client
const client = new Paho.MQTT.Client("mga.twilightparadox.com", Number(8083), "clientRoman");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect, userName: "hack", password: "hack1234" });


function onConnect() {
    client.subscribe("randomnerds");
    message = new Paho.MQTT.Message(JSON.stringify({ coords: { x: 4.34, y: 2.33 } }));
    message.destinationName = "randomnerds";
    client.send(message);
}


function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    console.log("onMessageArrived:" + message.payloadString);
}