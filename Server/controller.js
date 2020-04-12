const server = require("./mqttHelper").mqttHelper

const { acitons: { CALCULATE_SCORE, START_THE_GAME, GET_RANDOM_BUSH, CLICK_VIRUS, ON_USER_JOIN, GAME_OVER, ALL_USER_JOINED, ON_ERROR, ON_USER_LEAVE } } = require("./actions")


const RANDOM_NERDS_CLIENT = "randomnerdsClient";

const sendMessageObject = (obj) => {
    server.publish(RANDOM_NERDS_CLIENT, JSON.stringify(obj))
}


const users = [];

function getRandomBush(bshSize) {
    return Math.floor(Math.random() * bshSize);
}


function generateRandomTime(min = 300, max = 1000) {
    return Math.floor(Math.random() * (max - min) + min)
}

function calculateScore({ userId }) {
    let user = users.find(u => u.userId == userId)
    user.userScore = user.userScore + 1;
    let gameIsPlaying = true;

    if (user.userScore == 3) {
        gameIsPlaying = false;
    }

    return {
        user, gameIsPlaying, users
    }
}

const reducer = ({ action, payload }) => {
    switch (action) {
        case START_THE_GAME:
            if (!canStartGame(users)) {
                return { action: ON_ERROR, payload: "The Game cannot be started. Please wait for second user to join" }
            }
            //SET SCORE TO 0 FOR EACH
            users.forEach(us => us.userScore = 0)
            return { action: START_THE_GAME, payload: true }
        case GET_RANDOM_BUSH:
            const rndBush = getRandomBush(payload);
            const rndTime = generateRandomTime();
            return { action: GET_RANDOM_BUSH, payload: { rndBush, rndTime } }
        case CALCULATE_SCORE:
            return { action: CALCULATE_SCORE, payload: calculateScore(payload) }
        case ON_USER_JOIN:
            users.push(payload);
            if (canStartGame(users)) {
                sendMessageObject({ action: ALL_USER_JOINED, payload: true })
            }
            return { action: ON_USER_JOIN, payload: users }
            break;
        case ON_USER_LEAVE:
            console.log('LEAVE')
            removeUserFromList(payload, users);
            return { action: ON_USER_LEAVE, payload: users }

        default:
            return { action: "Default action" }
    }
}


function canStartGame(users) {
    if (users.length == 2) {
        return true;
    }

    return false;
}


function removeUserFromList(id, users) {
    users = users.filter(u => u.userId != id)
}

server.on('message', function (topic, message) {
    const response = reducer(JSON.parse(message.toString()));
    sendMessageObject(response)
})


