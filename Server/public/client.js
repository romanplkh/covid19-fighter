const { RANDOM_NERDS_SERVER, RANDOM_NERDS_CLIENT } = { RANDOM_NERDS_SERVER: "randomnerdsServer", RANDOM_NERDS_CLIENT: "randomnerdsClient" }

//ACTIONS
const { CALCULATE_SCORE, START_THE_GAME, GET_RANDOM_BUSH, CLICK_VIRUS, ON_USER_JOIN, GAME_OVER, ALL_USER_JOINED, ON_ERROR, ON_USER_LEAVE } = {
    CALCULATE_SCORE: "CALCULATE_SCORE",
    START_THE_GAME: "START_THE_GAME",
    GET_RANDOM_BUSH: "GET_RANDOM_BUSH",
    CLICK_VIRUS: "CLICK_VIRUS",
    GAME_OVER: "GAME_OVER",
    ON_USER_JOIN: "ON_USER_JOIN",
    ON_USER_LEAVE: "ON_USER_LEAVE",
    ALL_USER_JOINED: "ALL_USER_JOINED",
    ON_ERROR: "ON_ERROR"
}


//UI CONTROLS
const btnStartGame = document.querySelector("#btn");
btnStartGame.style.display = "none";
const scoreUI = document.querySelector("#score");
const bushes = document.querySelectorAll(".bush")
const viruses = document.querySelectorAll(".virus")
const userNameInput = document.querySelector("#userName");
const registerPlayerBtn = document.querySelector("#registerPlayer");
const playerNameText = document.querySelector("#playerName");
const playerScoreText = document.querySelector("#playerScore");
const usersListUL = document.querySelector("#usersList");
const personalDataBlock = document.querySelector("#personalData");



let client = {};

registerPlayerBtn.addEventListener("click", () => {
    const username = userNameInput.value;
    playerNameText.innerHTML = username;
    playerScoreText.innerHTML = 0;
    //CREATE CLIENT
    const cl = new Paho.MQTT.Client("mga.twilightparadox.com", Number(8083), username);
    cl.onConnectionLost = onConnectionLost;
    cl.onMessageArrived = onMessageArrived;
    client = cl;

    client.connect({ onSuccess: onConnect, userName: "hack", password: "hack1234" });


})


// SUNSCRIBE
function onConnect() {
    client.subscribe(RANDOM_NERDS_CLIENT);
    console.log("connected " + client.clientId)
    sendMessageObject({ action: ON_USER_JOIN, payload: { userId: client.clientId, userScore: 0 } }, RANDOM_NERDS_SERVER)
    personalDataBlock.style.display = "none";

}


function onConnectionLost(responseObject) {
    // sendMessageObject({ action: ON_USER_LEAVE, payload: client.clientId }, RANDOM_NERDS_SERVER)

    console.log(client.clientId)
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    if (message.payloadString) {
        reducer(JSON.parse(message.payloadString))
    }
}


function sendMessageObject(value, destination) {
    const message = new Paho.MQTT.Message(JSON.stringify(value));
    message.destinationName = destination;
    client.send(message)
}


const gameState = {
    randomBush: 0,
    gameIsPlaying: false,
    score: 0,
    randomTime: 300,
    playerScore: 0,
    users: []
};

btnStartGame.addEventListener("click", (ev) => {
    sendMessageObject({ action: START_THE_GAME }, RANDOM_NERDS_SERVER)
})



function reducer({ action, payload }) {
    switch (action) {
        case CALCULATE_SCORE:
            console.log(payload)
            renderUserList(payload.users)
            displayPlayerScore(payload.user.userId, payload.user.userScore)
            gameState.gameIsPlaying = payload.gameIsPlaying;
            break;
        case START_THE_GAME:
            gameState.gameIsPlaying = payload;
            //SET RANDOM TIME FOR gameState
            //SHOW VIRUS
            showVirus()
            break;
        case GET_RANDOM_BUSH:
            gameState.randomBush = payload.rndBush;
            gameState.randomTime = payload.rndTime;
            break;
        case CLICK_VIRUS:
            break;
        case GAME_OVER:
            gameState.gameIsPlaying = false;
            break;
        case ON_USER_JOIN:
            //ADD USER TO LIST OF USER
            addUserToList(payload)
            renderUserList(gameState.users)
            console.log(payload)
            break;
        case ON_USER_LEAVE:
            console.log(payload)
            break;
        case ALL_USER_JOINED:
            //ALL CONDITIONS MET TO START THE GAME
            enableStartGame(payload)
            break;
        case ON_ERROR:
            //SHOW ERROR IN UI
            break;
        default:
            return { action: "Default action" }
    }
}




function showVirus() {
    if (!gameState.gameIsPlaying) {
        alert("GAME OVER")
    }

    if (gameState.gameIsPlaying) {
        sendMessageObject({ action: GET_RANDOM_BUSH, payload: bushes.length }, RANDOM_NERDS_SERVER);
        let bush = bushes[gameState.randomBush]
        bush.nextElementSibling.classList.add("show");
        setTimeout(() => {
            bush.nextElementSibling.classList.remove("show");
            showVirus();
        }, gameState.randomTime)
    }


}

function getScore() {
    sendMessageObject({ action: CALCULATE_SCORE, payload: { userId: client.clientId } }, RANDOM_NERDS_SERVER)
}

function displayPlayerScore(id, score) {
    if (id == client.clientId)
        playerScoreText.innerHTML = score;
}


function enableStartGame(condition) {
    if (condition) {
        btnStartGame.style.display = "block";
    }
}


function addUserToList(arrayUsers) {
    arrayUsers.forEach(user => {
        if (gameState.users.findIndex(u => u.userId == user.userId) == -1) {
            gameState.users.push(user)
        }
    })

}


function renderUserList(arrayUsers) {
    usersListUL.innerHTML = ""
    arrayUsers.forEach(user => {
        let userLi = document.createElement("li");
        let userLiText = document.createTextNode(`User: ${user.userId} Score: ${user.userScore}`);
        userLi.appendChild(userLiText);
        usersListUL.appendChild(userLi);
    })
}




//@TODO:
function showError(error) {

}

viruses.forEach(virus => {
    virus.addEventListener("click", getScore)
})


