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

socket.emit("watcher");

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

      console.log("TRACK RECEIVED");

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