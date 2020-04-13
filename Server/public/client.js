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
const splash = document.querySelector("#splash");
const splashAudio = document.querySelector("#splash-audio");
const shotGunAudio = document.querySelector("#shotgun");
const soundIcon = document.querySelector(".fa-volume-up");
const virusImageSplash = document.querySelector("#virus-image-splash");
const playersListContainer = document.querySelector("#playersContainer");
const virusesGameField = document.querySelector("#viruses-game-field");
const dashboard = document.querySelector("#dashboard")
const smashAudio = document.querySelector("#smash")
const errorAlert = document.querySelector("#errorAlert")
// splashAudio.setAttribute("muted", true)


let client = {};

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
    console.log("connected " + client.clientId)
    sendMessageObject({ action: ON_USER_JOIN, payload: { userId: client.clientId, userScore: 0 } }, RANDOM_NERDS_SERVER)
    personalDataBlock.style.display = "none";


    //SHOW GAME PANEL
    hideGameRegistrationForm();
}


function onConnectionLost(responseObject) {
    console.log(responseObject)
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
    // score: 0,
    randomTime: 300,
    playerScore: 0,
    // users: []
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
            //RESET USERS SCORE
            resetCurrentUser(payload.users)
            renderUserList(payload.users)
            showVirus()
            break;
        case GET_RANDOM_BUSH:
            gameState.randomBush = payload.rndBush;
            gameState.randomTime = payload.rndTime;
            break;
        case CLICK_VIRUS:
            break;
        case GAME_OVER:
            gameState.gameIsPlaying = payload.gameIsPlaying;
            alert("WINNER IS " + payload.user.userId)
            enableStartGameButton(!gameState.gameIsPlaying)
            gameCursorEnable(false)
            break;
        case ON_USER_JOIN:
            //ADD USER TO LIST OF USER
            //addUsersToListState(payload)
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
            //SHOW ERROR IN UI
            break;
        default:
            return { action: "Default action" }
    }
}



btnStartGame.addEventListener("click", (ev) => {
    //STOP AUDIO SPLASH
    splashAudio.pause();
    sendMessageObject({ action: START_THE_GAME }, RANDOM_NERDS_SERVER)
    gameCursorEnable(true)

    virusesGameField.addEventListener("click", (ev) => {
        if (ev.target.className != "virus") {
            shotGunAudio.play()
        }

    })
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
        btnStartGame.style.display = "block";
    } else {
        btnStartGame.style.display = "none";
    }
}


function addUsersToListState(arrayUsers) {
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

//@TODO:
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
    } else {
        splashAudio.muted = true;
        splashAudio.pause();
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
}, 100)


function hideGameRegistrationForm() {
    playersListContainer.style.display = "block"
    virusesGameField.style.display = "block";
    dashboard.style.display = "block";
}

window.addEventListener("beforeunload", () => {
    sendMessageObject({ action: ON_USER_LEAVE, payload: client.clientId }, RANDOM_NERDS_SERVER)
})

