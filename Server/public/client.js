const { RANDOM_NERDS_SERVER, RANDOM_NERDS_CLIENT } = { RANDOM_NERDS_SERVER: "randomnerdsServer", RANDOM_NERDS_CLIENT: "randomnerdsClient" }

const ANIMATION_SPLASH_DURATION = 15000;

//ACTIONS
const { CALCULATE_SCORE, START_THE_GAME, GET_RANDOM_BUSH, ON_USER_JOIN, GAME_OVER, ALL_USER_JOINED, ON_ERROR, ON_USER_LEAVE } = {
    CALCULATE_SCORE: "CALCULATE_SCORE",
    START_THE_GAME: "START_THE_GAME",
    GET_RANDOM_BUSH: "GET_RANDOM_BUSH",
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
const splash = document.querySelector("#splash");
const splashAudio = document.querySelector("#splash-audio");
const shotGunAudio = document.querySelector("#shotgun");
const soundIcon = document.querySelector("#volume-icon");
const virusImageSplash = document.querySelector("#virus-image-splash");
const playersListContainer = document.querySelector("#playersContainer");
const virusesGameField = document.querySelector("#viruses-game-field");
const dashboard = document.querySelector("#dashboard")
const smashAudio = document.querySelector("#smash")
const errorAlert = document.querySelector("#errorAlert")
const countDown = document.querySelector("#countDown");
const winnerModal = document.querySelector("#winner-modal");
const winnerModalName = document.querySelector("#winner-modal-name");


//FOR ELECTRON
//splashAudio.play();


let client = null;

const titles = ["The Mammoth",
    "The Martyr",
    "The Silencer",
    "The Undying",
    "The Ox",
    "True Claw",
    "Giantstare",
    "Silentcut",
    "Warhallow",
    "Ironsword",
    "The Butcher",
    "The Bloodlust",
    "The Terror",
    "The Limp",
    "Doom Scar",
    "Strongclaw",
    "Ravenblow",
    "Gold Hide",
    "Thundercleaver",
    "The Shepherd",
    "The Deceiver",
    "The Cursed",
    "The Scarred One",
    "The Firestarter",
    "Sharp Might",
    "Singlecrest",
    "Wolf Fist",
    "Brightcleaver",
    "Singlesword"
]

registerPlayerBtn.addEventListener("click", () => {
    let username = userNameInput.value;
    if (!username) {
        toggleError(true, "Username is required")
    } else {
        username += "_" + titles[Math.floor(Math.random() * titles.length)];
        playerNameText.innerHTML = username;
        playerScoreText.innerHTML = 0;
        //CREATE CLIENT
        const cl = new Paho.MQTT.Client("mga.twilightparadox.com", Number(8083), username);

        cl.disconnectedPublishing = true;
        cl.onConnectionLost = onConnectionLost;
        cl.onMessageArrived = onMessageArrived;
        client = cl;

        client.connect({ onSuccess: onConnect, userName: "hack", password: "hack1234" });
    }
})



// SUNSCRIBE
function onConnect() {
    //VALIDATE USERNAME IS NOT ALREADY TAKEN
    client.subscribe(RANDOM_NERDS_CLIENT);
    sendMessageObject({ action: ON_USER_JOIN, payload: { userId: client.clientId, userScore: 0 } }, RANDOM_NERDS_SERVER)
    personalDataBlock.style.display = "none";


    //SHOW GAME PANEL
    hideGameRegistrationForm();
}


function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        // toggleError(true, responseObject.errorMessage)
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
    if (client) {
        client.send(message)
    }
}


const gameState = {
    randomBush: 0,
    gameIsPlaying: false,
    randomTime: 0
};





function reducer({ action, payload }) {
    switch (action) {
        case CALCULATE_SCORE:
            //Update score of all users in users list
            renderUserList(payload.users)
            //Update user score
            displayPlayerScore(payload.user.userId, payload.user.userScore)
            break;
        case START_THE_GAME:
            gameState.gameIsPlaying = payload.gameIsPlaying;
            //Hide start button
            enableStartGameButton(!gameState.gameIsPlaying);
            renderGameGraphics();
            //RESET USERS SCORE
            resetCurrentUser(payload.users)
            //DISPLAY USERS LIST WHEN GAME IS RESTARTED
            renderUserList(payload.users)
            //TURN OFF AUDIO
            splashAudio.pause();
            break;
        case GET_RANDOM_BUSH:
            gameState.randomBush = payload.rndBush;
            gameState.randomTime = payload.rndTime;
            break;
        case GAME_OVER:
            gameState.gameIsPlaying = payload.gameIsPlaying;
            enableStartGameButton(!gameState.gameIsPlaying)
            gameCursorEnable(false)
            showGameField(false)
            virusesGameField.removeEventListener("click", shotGunAudioListener)
            showWinnerModal(true, payload.user.userId)
            break;
        case ON_USER_JOIN:
            //ADD USER TO LIST OF USER
            renderUserList(payload)
            break;
        case ON_USER_LEAVE:
            renderUserList(payload)
            enableStartGameButton(payload.length >= 2)
            break;
        case ALL_USER_JOINED:
            //ALL CONDITIONS MET TO START THE GAME
            enableStartGameButton(payload)
            break;
        case ON_ERROR:
            //SHOW SERVER ERROR IN UI
            toggleError(true, payload)
            break;
        default:
            return { action: "Default action" }
    }
}


function showGameField(condition) {
    if (condition) {
        virusesGameField.style.display = "block"
    } else {
        virusesGameField.style.display = "none"
    }
}

//COUNDOWN TOGGLER

function showCountDown(condition) {
    if (condition) {
        countDown.style.display = "block"
    } else {
        countDown.style.display = "none"
    }
}

function shotGunAudioListener(ev) {
    if (ev.target.className != "virus") {
        shotGunAudio.play()
    }
}


function renderGameGraphics() {
    showCountDown(true);
    setTimeout(() => {
        showCountDown(false);
        showGameField(true)
        gameCursorEnable(true)
        virusesGameField.addEventListener("click", shotGunAudioListener)
        showVirus()
    }, 3700)
}

//BUTTON START GAME
btnStartGame.addEventListener("click", (ev) => {
    //STOP AUDIO SPLASH

    sendMessageObject({ action: START_THE_GAME }, RANDOM_NERDS_SERVER)
})


function showVirus() {
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

    //PLAY SOUND HIT TARGET
    smashAudio.play();
}

function displayPlayerScore(id, score) {
    if (id == client.clientId)
        playerScoreText.innerHTML = score;
}


function enableStartGameButton(condition) {
    if (condition) {
        btnStartGame.style.display = "inline-block";
    } else {
        btnStartGame.style.display = "none";
    }
}



//WINNER MODAL
function showWinnerModal(condition, winner) {
    if (condition) {
        winnerModal.style.display = "flex";
        winnerModalName.innerHTML = winner ?? "";
        setTimeout(() => showWinnerModal(false, ""), 8500)
    } else {
        winnerModal.style.display = "none"
        winnerModalName.innerHTML = "";
    }
}


//Handle animation in list
let userListIds = []


function renderUserList(arrayUsers) {
    usersListUL.innerHTML = ""
    arrayUsers.forEach(user => {
        let userLi = document.createElement("li");
        if (userListIds.indexOf(user.userId) == -1) {
            userLi.classList.add("animated", "bounceInUp");
        }

        let userLiText = `User: ${user.userId} <br> Score: ${user.userScore} <hr>`;
        userLi.innerHTML = userLiText;
        usersListUL.appendChild(userLi);
        userListIds.push(user.userId)
    })
}


function resetCurrentUser(arrayUsers) {
    arrayUsers.forEach(user => {
        if (user.userId == client.clientId) {
            playerScoreText.innerHTML = 0;
        }
    })
}

function hideErrorClick() {
    toggleError(false, "")
}

function toggleError(show, error) {
    errorAlert.classList.remove("bounceInLeft");
    errorAlert.classList.remove("bounceOutRight");
    errorAlert.classList.remove("animated");

    if (show) {
        errorAlert.style.display = "block";
        errorAlert.classList.add("animated");
        errorAlert.classList.add("bounceInLeft");
        errorAlert.querySelector("#error-text").innerHTML = error

        errorAlert.querySelector("span").addEventListener("click", hideErrorClick)
    } else {
        errorAlert.classList.add("animated");
        errorAlert.classList.add("bounceOutRight");

        setTimeout(() => {
            errorAlert.style.display = "none";
        }, 800)

        errorAlert.querySelector("span").removeEventListener("click", hideErrorClick)
    }

}


//HIT VIRUS
viruses.forEach(virus => {
    virus.addEventListener("click", getScore)
})


//CursorAIM
function gameCursorEnable(condition) {
    if (condition) {
        document.body.classList.add("cursor-aim");
    } else {
        document.body.classList.remove("cursor-aim");
    }

}

//AUDIO SPLASH
soundIcon.addEventListener("click", () => {
    if (splashAudio.muted) {
        // splashAudio.currentTime = 0;
        splashAudio.muted = false;
        splashAudio.play();
        soundIcon.classList.replace("fa-volume-off", "fa-volume-up")
    } else {
        splashAudio.muted = true;
        splashAudio.pause();
        soundIcon.classList.replace("fa-volume-up", "fa-volume-off")
    }

})

setTimeout(() => {
    splashAudio.volume = 0.2
}, 13000)



//ANIMATION  SPLASH
setTimeout(() => {
    splash.classList.add("animated")
    splash.classList.add("zoomOut")
    setTimeout(() => {
        splash.style.display = "none";
    }, 900)
}, ANIMATION_SPLASH_DURATION)



//REGISTRATION FORM
function hideGameRegistrationForm() {
    playersListContainer.style.display = "block"
    dashboard.style.display = "flex";
}

window.addEventListener("beforeunload", () => {
    if (client) {
        sendMessageObject({ action: ON_USER_LEAVE, payload: client.clientId }, RANDOM_NERDS_SERVER)
    }

})

