const socket = io();

const video = document.getElementById("video");

const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

socket.emit("watcher");

peerConnection.ontrack = event => {
  video.srcObject = event.streams[0];
};

peerConnection.onicecandidate = event => {
  if(event.candidate){
    socket.emit("candidate", "broadcaster", event.candidate);
  }
};

socket.on("offer", (id, description) => {

  peerConnection.setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });

});

socket.on("candidate", (id, candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("score-update", (data) => {

  document.getElementById("teams").innerText =
    `${data.team1} vs ${data.team2}`;

  document.getElementById("score").innerText =
    data.score;

  document.getElementById("overs").innerText =
    data.overs + " Overs";

  document.getElementById("batsman").innerText =
    data.batsman;

  document.getElementById("bowler").innerText =
    data.bowler;

});

socket.on("score-update", (data) => {

  // batting table

  const battingTable =
  document.getElementById("battingTable");

  battingTable.innerHTML = "";

  data.batting.forEach(player => {

    battingTable.innerHTML += `
      <tr>
        <td>${player.name}</td>
        <td>${player.runs}</td>
        <td>${player.balls}</td>
        <td>${player.fours}</td>
        <td>${player.sixes}</td>
        <td>${player.sr}</td>
      </tr>
    `;

  });

  // bowling table

  const bowlingTable =
  document.getElementById("bowlingTable");

  bowlingTable.innerHTML = "";

  data.bowling.forEach(player => {

    bowlingTable.innerHTML += `
      <tr>
        <td>${player.name}</td>
        <td>${player.overs}</td>
        <td>${player.runs}</td>
        <td>${player.wickets}</td>
        <td>${player.eco}</td>
      </tr>
    `;

  });

});