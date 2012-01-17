/**
 * Module dependencies.
 */ // this is test

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , sio = require('socket.io');

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
  app.use(express.static(__dirname + '/public')); //정적 페이지 위치 지정
  app.set('views', __dirname); //뷰페이지 위치 지정
  app.set('view engine', 'jade'); //뷰 엔진으로 jade 사용

  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  };
});

/**
 * App routes.
 */

app.get('/', function (req, res) { //get 방식 root주소 접근 시 뷰페이지 index를 render
  res.render('index', { layout: false });
});

/**
 * App listen.
 */
console.log(
app.listen(8080, function () { //http 8080 port listen
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
}));

/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app)
  , nicknames = {};
io.sockets.on('connection', function (socket) { //socket이 connect될 때의 event
    socket.on('join room', function(roomNo) {

    });

  socket.on('user message', function (msg) { //'user message' event
    socket.broadcast.emit('user message', socket.nickname, msg); //접속된 클라이언트에 user message 이벤트(닉네임,메시지)
});

  socket.on('nickname', function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nick] = socket.nickname = nick;
      socket.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('nicknames', nicknames);
    }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
});
