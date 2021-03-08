const express = require('express');
const app = express();
const server = require('http').Server(app);
const cookerParser = require('cookie-parser');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket']
  }
});

let usersStore = [];

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', [req.headers.origin]);
  res.append('Access-Control-Allow-Credentials', 'true');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Set-Cookie");
  res.append("SameSite", "None; Secure");
  next();
}, express.json({limit: "50mb"}), cookerParser());

io.on('connection', (socket) => {
  console.log('socket connected...', socket.id);

  socket.on('chat-message', (data) => {

    socket.broadcast.emit('chat-message', data);
  });

  socket.on('JOINED', (data) => {
    usersStore.push({
      id: socket.id,
      userName: data.userName
    });
    //Нужен один из представленных ниже вариантов;
    socket.emit('JOINED', usersStore);
    // console.log(usersStore)
  });

  socket.on('disconnect', () => {
    usersStore = usersStore.filter(item => {
      if (item.id === socket.id) {
        socket.broadcast.emit('LEAVE', item.userName)
      }
      return item.id !== socket.id;
    })
  })
});

app.post('/', (req, res) => {
  res.json();
});

server.listen(3000, (err) => {
  if (err) throw Error(err);
  console.log('Сервер запущен');
});