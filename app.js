// Import Libraries and Setup

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);//socket io needs an http server
const { Server } = require("socket.io");
const io = new Server(server);

// Tell our Node.js Server to host our sketch from the dist folder.
app.use(express.static("dist"));

// Setup Our Node.js server to listen to connections from chrome, and open chrome when it is ready
server.listen(3000, () => {
  console.log("listening on *:3000");
});

let printEveryMessage = true; 

// Callback function for what to do when our sketch connects and sends us messages
io.on("connection", (socket) => {
  console.log("a user connected");

  // Code to run every time we get a message from front-end 
  socket.on("message", (data) => {

    //do something
    socket.broadcast.emit('message', data);//broadcast.emit means send to everyone but the sender

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });
});

