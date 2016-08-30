var app = require('express')();

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

app.listen(8080);

console.log("Server started!")