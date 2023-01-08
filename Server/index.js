const { proxyServer } = require('peasplayer-tcp-local-tunnel');
const express = require('express');
const app = express();

global.serverActive = false;

app.use(express.json());

app.post('/setup', (req, res) => {
    if (!global.serverActive) {
        if (req.body.proxyPort === undefined || req.body.proxyPort === 3000)
            return res.json({ error: "Invalid proxy port" })
        if (req.body.tunnelPort === undefined || req.body.tunnelPort === 3000)
            return res.json({ error: "Invalid tunnel port" })
        proxyServer.start({
            proxyPort: req.body.proxyPort,
            tunnelPort: req.body.tunnelPort
        });
        global.serverActive = true;
        res.sendStatus(201);
    }
    else
        return res.json({ error: "Server is already running" })
})

app.post('/stop', (req, res) => {
    proxyServer.stop(() => console.log("Tunnel closed"), () => console.log("Proxy stopped"));
    global.serverActive = false;
    res.sendStatus(200)
})

app.listen(3000)