const express = require("express");
const app = express();
const controller = require("./controller")
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"))

app.use("/", (req, res, next) => {
    res.sendFile(`${__dirname}/public/game.html`)
})

app.listen(PORT, () => {
    console.log("Server is listening on port 3000")
});
