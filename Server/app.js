const express = require("express");
const app = express();
const controller = require("./controller");
const port = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/public`));

app.use("/", (req, res, next) => {
  res.sendFile(`${__dirname}/public/game.html`);
  //res.sendFile(`${__dirname}/public/test.html`);
});

app.listen(port, () => {
  console.log("Server is listening on port 3000");
});
