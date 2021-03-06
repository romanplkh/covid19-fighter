const server = require("./mqttHelper").mqttHelper;

const {
  acitons: {
    CALCULATE_SCORE,
    START_THE_GAME,
    GET_RANDOM_BUSH,
    ON_USER_JOIN,
    GAME_OVER,
    ALL_USER_JOINED,
    ON_ERROR,
    ON_USER_LEAVE,
  },
} = require("./actions");

const RANDOM_NERDS_CLIENT = "randomnerdsClient";
const WINNING_SCORE = 10;

const sendMessageObject = (obj) => {
  server.publish(RANDOM_NERDS_CLIENT, JSON.stringify(obj));
};

const gameState = {
  gameIsPlaying: false,
};

let users = [];

const reducer = ({ action, payload }) => {
  switch (action) {
    case START_THE_GAME:
      if (!canStartGame(users)) {
        return {
          action: ON_ERROR,
          payload: "Oops, The Game cannot be started",
        };
      } else {
        gameState.gameIsPlaying = true;
        //SET SCORE TO 0 FOR EACH
        users.forEach((us) => (us.userScore = 0));
        return {
          action: START_THE_GAME,
          payload: { gameIsPlaying: gameState.gameIsPlaying, users: users },
        };
      }

    case GET_RANDOM_BUSH:
      const rndBush = getRandomBush(payload);
      const rndTime = generateRandomTime();
      return { action: GET_RANDOM_BUSH, payload: { rndBush, rndTime } };
    case CALCULATE_SCORE:
      if (gameState.gameIsPlaying) {
        const usersWithScore = calculateScore(payload);
        if (usersWithScore.user.userScore == WINNING_SCORE) {
          sendMessageObject({
            action: GAME_OVER,
            payload: { gameIsPlaying: false, user: usersWithScore.user },
          });
          gameState.gameIsPlaying = false;
        }
        return { action: CALCULATE_SCORE, payload: usersWithScore };
      } else {
        break;
      }
    case ON_USER_JOIN:
      console.log(`JOINED: ${payload.userId}`);
      users.push(payload);
      if (canStartGame(users)) {
        sendMessageObject({ action: ALL_USER_JOINED, payload: true });
      }
      return { action: ON_USER_JOIN, payload: users };
    case ON_USER_LEAVE:
      removeUserFromList(payload);
      console.log(`LEFT: ${payload || ""}`);
      return { action: ON_USER_LEAVE, payload: users };
    default:
      return { action: "Default action" };
  }
};

function getRandomBush(bshSize) {
  return Math.floor(Math.random() * bshSize);
}

function generateRandomTime(min = 300, max = 800) {
  return Math.floor(Math.random() * (max - min) + min);
}

function calculateScore({ userId }) {
  let user = users.find((u) => u.userId == userId);
  user.userScore = user.userScore + 1;
  return { user, users };
}

function canStartGame(users) {
  if (users.length >= 2) {
    if (!gameState.gameIsPlaying) {
      return true;
    }
  }
  return false;
}

function removeUserFromList(id) {
  users = users.filter((u) => u.userId != id);
}

server.on("message", function (topic, message) {
  const response = reducer(JSON.parse(message.toString()));
  sendMessageObject(response);
});
