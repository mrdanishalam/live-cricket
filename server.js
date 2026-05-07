const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let score = 0;
let wickets = 0;
let balls = 0;

let striker = {
  name: "Danish",
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0
};

let nonStriker = {
  name: "Rahman",
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0
};

let bowler = {
  name: "Sahil",
  overs: 0,
  runs: 0,
  wickets: 0
};

let batting = [striker, nonStriker];
let bowling = [bowler];

let commentary = [];
let lastOver = [];

function oversFormat() {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function runRate() {
  const overs = balls / 6 || 1;
  return (score / overs).toFixed(2);
}

function emitScore() {

  io.emit("score-update", {

    team1: "Team Hassan",
    team2: "Royal Tigers",

    score: `${score}/${wickets}`,

    overs: oversFormat(),

    currentRunRate: runRate(),

    striker,
    nonStriker,
    bowler,

    batting,
    bowling,

    commentary,
    lastOver

  });

}

io.on("connection", (socket) => {

  emitScore();

  socket.on("run", (run) => {

    score += run;

    striker.runs += run;
    striker.balls += 1;

    bowler.runs += run;

    balls++;

    if(run === 4) striker.fours++;
    if(run === 6) striker.sixes++;

    lastOver.push(run);

    commentary.unshift(`🏏 ${striker.name} scored ${run} run`);

    if(run % 2 !== 0){
      [striker, nonStriker] =
      [nonStriker, striker];
    }

    if(balls % 6 === 0){

      bowler.overs++;

      [striker, nonStriker] =
      [nonStriker, striker];

      lastOver = [];

    }

    emitScore();

  });

  socket.on("dot", () => {

    striker.balls += 1;

    balls++;

    lastOver.push(".");

    commentary.unshift(`🛑 Dot Ball`);

    if(balls % 6 === 0){

      bowler.overs++;

      [striker, nonStriker] =
      [nonStriker, striker];

      lastOver = [];

    }

    emitScore();

  });

  socket.on("wicket", () => {

    wickets++;

    balls++;

    striker.balls++;

    bowler.wickets++;

    lastOver.push("W");

    commentary.unshift(
      `❌ OUT! ${striker.name}`
    );

    striker = {
      name: "New Batsman",
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0
    };

    batting.push(striker);

    emitScore();

  });

});
server.listen(3000, () => {
  console.log("Running...");
});