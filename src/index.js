let http = require('http');
let fs = require('fs');
let gpio = require('gpio');
let signal = require('signal');

let lightState = 0;
let blindsState = 1000000;
gpio.pins[16].setType(gpio.INPUT);
gpio.pins[22].setType(gpio.OUTPUT).setValue(lightState);
gpio.pins[21].setType(gpio.OUTPUT);
gpio.pins[21].setValue(0);

function writeStatic(path, res) {
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
        gpio.pins[16].getValue(gpio.ANALOG, (err, val) => {
            let responseText;
            console.log(val);
            if (val <= 0.50) {
                responseText = "Dunkel";
            } else if (val <= 0.80) {
                responseText = "Mittel";
            } else if (val > 0.80) {
                responseText = "Hell";
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(responseText);
            res.end();
            return;
        })
    } else if (req.url == '/light') {
        res.end();
        lightState = !lightState;
        gpio.pins[22].setValue(lightState);
    } else if (req.url == '/blinds') {
        res.end();
        signal.send(signal.RESTART, [{index: 21, setEvents: signal.EVENT_1, clearEvents: signal.EVENT_2 | signal.EVENT_3}], [0, blindsState, 20000000]);
        if (blindsState === 1000000) {
            blindsState = 2000000;
        } else {
            blindsState = 1000000;
        }
    } else {
        writeStatic(req.url == '/' ? '/index.html' : req.url, res);
    }
}).listen(80);