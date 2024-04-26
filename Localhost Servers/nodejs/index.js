import express from 'express';
const app = express();
import Runtime from './Runtime.js'

// NodeJS remote execution websocket
import {server as WebSocketServer} from 'websocket';

const PORT = process.env.PORT || 2000;
let server = app.listen(PORT, () => {
    console.log(`Node.js remote REPL server is listening on port ${PORT}`);
});

const nodejsREPLWebsocket = new WebSocketServer({
    httpServer: server
});

let sessions = [];

nodejsREPLWebsocket.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        console.log('Received a message: ' + message.utf8Data);
        let operation = JSON.parse(message.utf8Data);
        if(operation.action === 'open') {
            sessions.push(new Runtime());
            connection.sendUTF( JSON.stringify({ action: 'open', id: sessions.length - 1}))
        } else if (operation.action === 'eval' && Object.keys(sessions).includes(operation.id + "")) {
            let runtime = sessions[operation.id];
            runtime.execute(operation.code, (result) => {
                console.log('Runtime execution - \nCode:\n\t' + operation.code.split("\n").join('\n\t') + "\nRuntime ID: " + operation.id + "\nResult:\n\t" + result.split("\n").join('\n\t'));
                connection.sendUTF( JSON.stringify({ action: 'eval', id: operation.id, result}))
            })
        }
    });
    connection.on('close', function(connection) {
        console.log("Connection closed, closing " + sessions.length + " active sessions.")
        sessions = [];
    });
});