const socket = io();

let players = [];

function addPlayer(){

const name =
document.getElementById(
"playerName"
).value;

if(!name) return;

players.push(name);

updateDropdowns();

document.getElementById(
"playerName"
).value = "";

}

function updateDropdowns(){

const striker =
document.getElementById(
"striker"
);

const bowler =
document.getElementById(
"bowler"
);

striker.innerHTML = "";
bowler.innerHTML = "";

players.forEach(player=>{

striker.innerHTML +=
`<option>${player}</option>`;

bowler.innerHTML +=
`<option>${player}</option>`;

});

}

function run(r){

socket.emit("run",{

run:r,

striker:
document.getElementById(
"striker"
).value,

bowler:
document.getElementById(
"bowler"
).value

});

}

function dotBall(){

socket.emit("dot",{

striker:
document.getElementById(
"striker"
).value,

bowler:
document.getElementById(
"bowler"
).value

});

}

function wicket(){

socket.emit("wicket",{

striker:
document.getElementById(
"striker"
).value,

bowler:
document.getElementById(
"bowler"
).value

});

}