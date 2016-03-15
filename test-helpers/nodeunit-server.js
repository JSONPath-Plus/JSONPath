require('http').createServer(function (req, res) {
  var s = require('fs').createReadStream('.' + req.url);
  s.pipe(res);
  s.on('error', function () {});
}).listen(8082);
