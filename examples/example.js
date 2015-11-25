var five = require("johnny-five");

var opts = {
    port: process.argv[2] || "",
};

var board = new five.Board(opts);

board.on("ready", function() {

    console.log("Connected to board. Will now periodically read I2C data");

    var BYTES_TO_READ = 0x04;
    var address = 0x61;

    this.io.i2cConfig({address: address});

    // periodically grab the data
    setInterval(function() {
        this.io.i2cReadOnce(address, BYTES_TO_READ, function(data) {
            console.log(data);
            console.log("Duration: %s", (
                        (data[0] << 24) +
                        (data[1] << 16) +
                        (data[2] << 8)  +
                        (data[3])));
        });
    }.bind(this), 1000);

});

board.on("error", function(err) {

    console.log(err);
});
