require('coffee-script/register');
var io = require('socket.io-client');
multimeter = require('multimeter-stack');
var multi = multimeter(process);
multi.on('^C', process.exit);

socket = io()

socket.on "bucketFilled", (data) ->
  player = getPlayerByID(data.id)
