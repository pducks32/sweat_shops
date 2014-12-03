require('coffee-script/register');
var io = require('socket.io-client');
multimeter = require('multimeter-stack');
var multi = multimeter(process);
multi.on('^C', process.exit);

socket = io("https://shielded-headland-9938.herokuapp.com")

socket.on "bucketFilled", (data) ->
  player = getPlayerByID(data.id)

socket.on ""
