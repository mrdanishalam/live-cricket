const socket = io();

/* =========================
   VIDEO
========================= */

const video =
document.getElementById("video");

let peerConnection;

const config = {

  iceServers:[
    {
      urls:"stun:stun.l.google.com:19302"
    }
  ]

};

/* =========================
   WATCHER
========================= */

socket.emit("watcher");

/* =========================
   OFFER
========================= */

socket.on(
  "offer",
  async (id,description)=>{

    peerConnection =
    new RTCPeerConnection(config);

    await peerConnection
    .setRemoteDescription(
      description
    );

    const answer =
    await peerConnection
    .createAnswer();

    await peerConnection
    .setLocalDescription(
      answer
    );

    socket.emit(
      "answer",
      id,
      peerConnection.localDescription
    );

    peerConnection.ontrack =
    event=>{

      video.srcObject =
      event.streams[0];

      video.play();

    };

    peerConnection.onicecandidate =
    event=>{

      if(event.candidate){

        socket.emit(
          "candidate",
          id,
          event.candidate
        );

      }

    };

});

/* =========================
   ICE CANDIDATE
========================= */

socket.on(
  "candidate",
  (id,candidate)=>{

    if(peerConnection){

      peerConnection
      .addIceCandidate(
        new RTCIceCandidate(candidate)
      );

    }

});

/* =========================
   LIVE SCORE UPDATE
========================= */

socket.on(
  "score-update",
  (data)=>{

    console.log(data);

    /* =========================
       SCORE
    ========================= */

    document
    .getElementById("score")
    .innerText = data.score;

    document
    .getElementById("overs")
    .innerText =
    data.overs + " Overs";

    document
    .getElementById("rr")
    .innerText =
    data.rr;

    /* =========================
       BATTING TABLE
    ========================= */

    const battingTable =
    document.getElementById(
      "battingTable"
    );

    battingTable.innerHTML = "";

    data.batting.forEach(player=>{

      battingTable.innerHTML += `

      <tr>

      <td>
      ${player.name}
      ${player.name === data.striker ? "⭐" : ""}
      </td>

      <td>${player.runs}</td>

      <td>${player.balls}</td>

      <td>${player.fours}</td>

      <td>${player.sixes}</td>

      <td>${player.status}</td>

      </tr>

      `;

    });

    /* =========================
       BOWLING TABLE
    ========================= */

    const bowlingTable =
    document.getElementById(
      "bowlingTable"
    );

    bowlingTable.innerHTML = "";

    data.bowling.forEach(player=>{

      bowlingTable.innerHTML += `

      <tr>

      <td>${player.name}</td>

      <td>${player.overs}</td>

      <td>${player.runs}</td>

      <td>${player.wickets}</td>

      </tr>

      `;

    });

    /* =========================
       COMMENTARY
    ========================= */

    const commentaryBox =
    document.getElementById(
      "commentaryBox"
    );

    commentaryBox.innerHTML = "";

    data.commentary
    .slice(0,10)
    .forEach(c=>{

      commentaryBox.innerHTML += `

      <div class="comment">
      ${c}
      </div>

      `;

    });

});