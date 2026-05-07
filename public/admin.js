const socket = io();

function run(r){

  if(r === 0){
    socket.emit("dot");
  }
  else{
    socket.emit("run", r);
  }

}

function wicket(){
  socket.emit("wicket");
}