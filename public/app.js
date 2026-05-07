const socket = io();

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

socket.on("broadcaster",()=>{

socket.emit("watcher");

});

socket.on(
"offer",
(id,description)=>{

peerConnection =
new RTCPeerConnection(config);

peerConnection
.setRemoteDescription(description)
.then(()=>
peerConnection.createAnswer()
)
.then(sdp=>
peerConnection
.setLocalDescription(sdp)
)
.then(()=>{

socket.emit(
"answer",
id,
peerConnection.localDescription
);

});

peerConnection.ontrack =
event=>{

video.srcObject =
event.streams[0];

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

socket.on(
"candidate",
(id,candidate)=>{

peerConnection
.addIceCandidate(
new RTCIceCandidate(candidate)
);

});

socket.on(
"score-update",
(data)=>{

document
.getElementById("score")
.innerText = data.score;

document
.getElementById("overs")
.innerText =
data.overs + " Overs";

document
.getElementById("rr")
.innerText = data.rr;

const battingTable =
document.getElementById(
"battingTable"
);

battingTable.innerHTML = "";

data.batting.forEach(player=>{

battingTable.innerHTML += `

<tr>

<td>${player.name}</td>

<td>${player.runs}</td>

<td>${player.balls}</td>

<td>${player.fours}</td>

<td>${player.sixes}</td>

<td>${player.status}</td>

</tr>

`;

});

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