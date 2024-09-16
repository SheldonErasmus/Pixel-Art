import {WebSocketServer, WebSocket} from 'ws';
import * as common from './common.mjs'

const FRAME_FPS = 30;

const wss = new WebSocketServer({port: common.SERVER_PORT})

wss.on('connection', (ws: WebSocket) => 
{
    console.log('New client connected');

    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        ws.send(`Server received your message: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    })
});

function tick()
{

}

setTimeout(tick, 1000 / FRAME_FPS);