let http = require('http');
let fs = require('fs');
let gpio = require('gpio');

let state = 0;
gpio.pins[22].setType(gpio.OUTPUT).setValue(state);

fs.readFile('src/client.html', 'utf8', (err, page) => {
    if(err) {
        console.log(err);
        return;
    }

    http.createServer((req, res) => {
        if (req.url == '/Toggle') {
            res.end();
    
            state = !state;
            gpio.pins[22].setValue(state);
        } else if (req.url == '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(page);
        } else {
            res.writeHead(404);
            res.end();
        }
    }).listen(80);
});