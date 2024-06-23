// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var fs = require('fs');
var files = fs.readdirSync(__dirname +'/public/images');
var images = [];
var chosenFile = '';
var chosenFile2 = '';
var num = 0;
const clients = io.sockets.adapter.rooms.get('Room Name');
const numClients = clients ? clients.size : 0;
let words = ["streetlamp","sky","people","firehydrant"];
let randword = '';
app.set('port', 80);
app.use(express.static(__dirname + '/public'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(80, function() {
  console.log('Starting server on port 80');
});
var people = [];
var numUsers=0;
var users=[];
var playing = [];
var names = [];
var index=0;
var index2=0;
var other=0;
io.on('connection', function(socket){
  console.log('socket connection -', socket.id);
  socket.on('nname', function(data){
    people[socket.id] = data.nickname;
    console.log('new player registered -', data.nickname);
    numUsers +=1;
    console.log(numUsers);
    names.push(data.nickname);
      console.log(people);
      if(numUsers >= 2){
        
        randword = words[Math.floor(Math.random() * words.length)]
        console.log(randword);
        numUsers = numUsers -2;
        
        console.log(people[other], other);
        console.log("game started with", other, "and", socket.id);
        io.to(other).emit('vs', data.nickname);
        io.to(socket.id).emit('vs', people[other]);
        io.to(socket.id).emit('word', randword);
        io.to(other).emit('word', randword);
        io.to(socket.id).emit('vsid', other);
        io.to(other).emit('vsid', socket.id);
        io.to(socket.id).emit('id', socket.id);
        io.to(other).emit('id', other);
        io.to(socket.id).emit('user', 1);
        io.to(other).emit('user', 2);
        
        delete people[other];
        delete people[socket.id];

        playing[socket.id] =  other;
        playing[other] = socket.id;
        num=0;
        number1 = Math.floor(Math.random() * files.length);
        files.forEach(element => {
          if(num < 10){
            if (element.includes('.jpg') || element.includes('.png')) {
              num+=1;
              chosenFile = files[Math.floor(Math.random() * files.length)];
              chosenFile2 = files[Math.floor(Math.random() * files.length)];
              if(number1 == num){
                console.log("random number");
                while(chosenFile.includes(randword)==false || chosenFile2.includes(randword)==false){
                  chosenFile = files[Math.floor(Math.random() * files.length)];
                  chosenFile2 = files[Math.floor(Math.random() * files.length)];
                }
              }
              io.to(socket.id).emit('images', chosenFile);
              io.to(other).emit('images', chosenFile2);
            }
          }
        });
        console.log(numUsers);
      }else{
        other=socket.id;  
      }
  });

  socket.on('click', function(data){
    io.to(playing[socket.id]).emit('click', data.id);
  });

  socket.on('unclick', function(data){
    io.to(playing[socket.id]).emit('unclick', data.id);
    io.to(socket.id).emit('skip', data.id);
  });
  
  socket.on('verify', function(data){
    io.to(playing[socket.id]).emit('verify', data.id);
  });
  socket.on('end', function(data){
    io.to(playing[socket.id]).emit('end', data.id);
    delete playing[socket.id];
    delete playing[playing[socket.id]];
    names.splice(index2, 1);
    names.splice(index, 1);
  });
  socket.on('imgdata', function(data){
    io.to(playing[socket.id]).emit('imgdata', data.id);
  });
  number1 = Math.floor(Math.random() * files.length);
  socket.on('skip', function(data){
    num=0;
    io.to(socket.id).emit('skip', data);
    files.forEach(element => {
      if(num < 10){
        if (element.includes('.jpg')) {
          num+=1;
          var chosenFile3 = files[Math.floor(Math.random() * files.length)] 
          if(number1 == num){
            console.log("random number");
            while(chosenFile3.includes(randword)==false){
              chosenFile3 = files[Math.floor(Math.random() * files.length)];
            }
          }
          io.to(socket.id).emit('images', chosenFile3);
        }
      }
    });
  });
  socket.on('verify', function(data){
    io.to(playing[socket.id]).emit('verify', data.id);
    //io.to(playing[socket.id]).emit('otherwin', data.id);
    //io.to(socket.id).emit('win', data.id);
  });
  socket.on('disconnect', function(){
    names.splice(index2, 1);
    names.splice(index, 1);
    io.to(playing[socket.id]).emit('opponentLeft');
    if(playing[socket.id] != null){ 
      console.log('players disconnected -', socket.id, " : "+ people[socket.id]);
      delete playing[socket.id];
      console.log(numUsers);
    }
    if(people[socket.id] != null){
      console.log('user disconnected -', socket.id)
      numUsers =numUsers - 1;
      delete people[socket.id];
      console.log(numUsers);
    }
    console.log('Disconnection', people);
  });
});
