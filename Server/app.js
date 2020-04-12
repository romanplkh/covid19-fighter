const express = require("express");
const app = express();
const controller = require("./controller")

app.use(express.static(__dirname + "/public"))

app.use("/", (req, res, next) => {
    res.sendFile(`${__dirname}/public/game.html`)
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
});
