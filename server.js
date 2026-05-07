const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

/* =========================
   LIVE STREAM VARIABLES
========================= */

let broadcaster = null;

/* =========================
   MATCH VARIABLES
========================= */

let totalScore = 0;

let wickets = 0;

let balls = 0;

let batting = [];

let bowling = [];

let commentary = [];

/* =========================
   HELPERS
========================= */

function oversFormat(){

  return `${Math.floor(balls / 6)}.${balls % 6}`;

}

function runRate(){

  const overs = balls / 6 || 1;

  return (totalScore / overs).toFixed(2);

}

/* =========================
   SEND SCORE TO EVERYONE
========================= */

function emitScore(){

  io.emit("score-update",{

    team1:"Team Hassan",

    team2:"Royal Tigers",

    score:`${totalScore}/${wickets}`,

    overs:oversFormat(),

    rr:runRate(),

    striker:
    batting.length
    ? batting[batting.length - 1].name
    : "",

    batting,

    bowling,

    commentary

  });

}

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection",(socket)=>{

  console.log("User Connected");

/* =========================
   BROADCASTER
========================= */

  socket.on(
    "broadcaster",
    ()=>{

      broadcaster = socket.id;

      console.log(
        "Broadcaster Connected:",
        broadcaster
      );

    }
  );

/* =========================
   WATCHER
========================= */

  socket.on(
    "watcher",
    ()=>{

      console.log(
        "Watcher Joined:",
        socket.id
      );

      if(broadcaster){

        socket.to(broadcaster)
        .emit(
          "watcher",
          socket.id
        );

      }

    }
  );

/* =========================
   OFFER
========================= */

  socket.on(
    "offer",
    (id,message)=>{

      socket.to(id)
      .emit(
        "offer",
        socket.id,
        message
      );

    }
  );

/* =========================
   ANSWER
========================= */

  socket.on(
    "answer",
    (id,message)=>{

      socket.to(id)
      .emit(
        "answer",
        socket.id,
        message
      );

    }
  );

/* =========================
   ICE CANDIDATE
========================= */

  socket.on(
    "candidate",
    (id,message)=>{

      socket.to(id)
      .emit(
        "candidate",
        socket.id,
        message
      );

    }
  );

/* =========================
   SEND INITIAL SCORE
========================= */

  emitScore();

/* =========================
   RUN EVENT
========================= */

  socket.on("run",(data)=>{

    const run = data.run;

    totalScore += run;

    balls++;

    /* =========================
       BATSMAN
    ========================= */

    let batsman =
    batting.find(
      p => p.name === data.striker
    );

    if(!batsman){

      batsman = {

        name:data.striker,

        runs:0,

        balls:0,

        fours:0,

        sixes:0,

        status:"not out"

      };

      batting.push(batsman);

    }

    batsman.runs += run;

    batsman.balls++;

    if(run === 4){

      batsman.fours++;

    }

    if(run === 6){

      batsman.sixes++;

    }

    /* =========================
       BOWLER
    ========================= */

    let bowler =
    bowling.find(
      b => b.name === data.bowler
    );

    if(!bowler){

      bowler = {

        name:data.bowler,

        overs:0,

        runs:0,

        wickets:0

      };

      bowling.push(bowler);

    }

    bowler.runs += run;

    if(balls % 6 === 0){

      bowler.overs++;

    }

    /* =========================
       COMMENTARY
    ========================= */

    commentary.unshift(
      `🏏 ${data.striker} scored ${run}`
    );

    emitScore();

  });

/* =========================
   DOT BALL
========================= */

  socket.on("dot",(data)=>{

    balls++;

    let batsman =
    batting.find(
      p => p.name === data.striker
    );

    if(!batsman){

      batsman = {

        name:data.striker,

        runs:0,

        balls:0,

        fours:0,

        sixes:0,

        status:"not out"

      };

      batting.push(batsman);

    }

    batsman.balls++;

    commentary.unshift(
      `🛑 Dot Ball by ${data.bowler}`
    );

    emitScore();

  });

/* =========================
   WICKET
========================= */

  socket.on("wicket",(data)=>{

    wickets++;

    balls++;

    let batsman =
    batting.find(
      p => p.name === data.striker
    );

    if(batsman){

      batsman.status = "out";

      batsman.balls++;

    }

    let bowler =
    bowling.find(
      b => b.name === data.bowler
    );

    if(!bowler){

      bowler = {

        name:data.bowler,

        overs:0,

        runs:0,

        wickets:0

      };

      bowling.push(bowler);

    }

    bowler.wickets++;

    commentary.unshift(
      `❌ OUT! ${data.striker}`
    );

    emitScore();

  });

/* =========================
   DISCONNECT
========================= */

  socket.on("disconnect",()=>{

    console.log("User Disconnected");

  });

});

/* =========================
   SERVER START
========================= */

const PORT =
process.env.PORT || 3000;

server.listen(PORT,()=>{

  console.log(
    `Server Running On ${PORT}`
  );

});