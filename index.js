let http = require('http');
let fs = require('fs');
let gpio = require('gpio');

let state = 0;
gpio.pins[16].setType(gpio.INPUT);
gpio.pins[22].setType(gpio.OUTPUT).setValue(state);

function writeStatic(path, res) {
    console.log(path);
    fs.readFile('/www/' + path, (err, data) => {
        if (err) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('fs.readFile error: ' + err);
            return;
        }

        let contentType = 'text/html';
        if (path.substr(-4) == '.png')
            contentType = 'image/png';
        else if (path.substr(-3) == '.js')
            contentType = 'text/javascript';
        else if (path.substr(-4) == '.css')
            contentType = 'text/css';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

http.createServer((req, res) => {
    if (req.url == '/temp') {
        res.end();
        gpio.pins[16].getValue(gpio.ANALOG, (err, val) => {
            console.log(val);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(val);
            return;
        })
    } else if (req.url == '/light') {
        res.end();
        state = !state;
        gpio.pins[22].setValue(state);
    } else {
        writeStatic(req.url == '/' ? '/index.html' : req.url, res);
    }
}).listen(80);