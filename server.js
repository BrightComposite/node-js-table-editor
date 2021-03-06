var express = require('express')
var app = express()

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile('/index.html')
})

app.get('/help.html', function(req, res) {
  res.sendFile('/help.html')
})

var port = process.env.PORT || 5000;
app.listen(port)

console.log("Server started!")