const { client } = require('peasplayer-tcp-local-tunnel');
const fetch = require('node-fetch');
const fs = require('fs')
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const config = fs.existsSync('./config.json') ? JSON.parse(fs.readFileSync('./config.json')) :
    { ip: "localhost", setupPort: 3000, useHttps: false, connectionAttempts: 10, ports: 1 };
if (config == undefined){
    return console.log("Config missing!")
}

rl.question('What port does your local program use?', function (localPort) {
    rl.question('What port should be publicly available? ', function (proxyPort) {
        rl.question('What port should the tunnel use? ', function (tunnelPort) {
            fetch((config.useHttps ? "https://" : "http://") + config.ip + ":" + config.setupPort + '/setup', {
                method: 'post',
                body:    JSON.stringify({ proxyPort: proxyPort, tunnelPort: tunnelPort}),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(response => {
                    if (response.status === 201) {
                        console.log("Server started...")
                        client(
                            {
                                host: config.ip,
                                port: tunnelPort
                            },
                            {
                                host: 'localhost',
                                port: localPort
                            },
                            config.connectionAttempts,
                            config.ports
                        );
                        console.log("Connecting...")
                    }
                    else {
                        response.json().then(json => console.error(json.error))
                    }
                })
            rl.close();
        });
    });
});

async function stopServer() {
    await fetch((config.useHttps ? "https://" : "http://") + config.ip + ":" + config.setupPort + '/stop', {
        method: 'post',
        body:    null,
        headers: { 'Content-Type': 'application/json' },
    })
    console.log("Tunnel closed!")
    console.log("Waiting for connection to be destroyed ...")
}

process.on('stopServer', stopServer);

process.on('exit', () => {
    process.emit('stopServer');
});

process.on('SIGINT', () => {
    process.emit('stopServer');
});