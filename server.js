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

app.post('/', (req, res) => res.json());

io.on('connection', (socket) => {
  console.log('socket connected...', socket.id);

  socket.on('CHAT_MESSAGE', (data) => io.emit('CHAT_MESSAGE', data));

  socket.on('JOINED', (data) => {
    usersStore.push(data);
    io.emit('JOINED', usersStore);
  });

  socket.on('CHAT_IMAGE', (data) => {
    console.log(data);
    io.emit('CHAT_IMAGE', data);
  });

  socket.on('disconnect', () => {
    usersStore = usersStore.filter(item => item.id !== socket.id);
    io.emit('LEAVE', usersStore);
  });
});

server.listen(3000, (err) => {
  if (err) throw Error(err);
  console.log('Сервер запущен');
});