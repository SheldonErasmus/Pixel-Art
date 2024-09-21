import {WebSocketServer, WebSocket} from 'ws';
import * as common from './common.mjs';
import {Event, Player, Board} from './common.mjs';

const FRAME_FPS = 60;

const wss = new WebSocketServer({port: common.SERVER_PORT});

interface PlayerWithSocket extends Player {
    ws: WebSocket
};

const eventQueue = new Array<Event>();
const players = new Map<number,PlayerWithSocket>()

let IdIndex = 0;

const theBoard:Board = [];

for (let r = 0; r < common.BOARD_ROWS; r++)
{
    theBoard.push(new Array<number>(common.BOARD_COL).fill(0));
}

wss.on('connection', (ws: WebSocket) => 
{
    const Id = IdIndex++;
    console.log(`Player ${Id} connected`);

    const player: PlayerWithSocket = {
        ws: ws,
        Id: Id,
    };

    players.set(Id, player);
    eventQueue.push({
        kind: 'PlayerConnected',
        Id: Id,
    });

    ws.addEventListener('message', (message) => {
        let data = JSON.parse(message.data.toString())
        console.log(`Id: ${Id}`, `state: ${data.state}`, `row: ${data.row}`, `col ${data.col}`);
        
        eventQueue.push({
            kind: 'PlayerDrawing',
            Id: Id,
            state: data.state,
            row: data.row,
            col: data.col,
        });
    });

    ws.on('close', () => {
        console.log(`Player ${Id} disconnected`);
        players.delete(Id);
        eventQueue.push({
            kind: 'PlayerLeft',
            Id: Id,
        });
    })
});

function tick()
{
    eventQueue.forEach(event => {
        switch (event.kind) {
            case 'PlayerConnected': {
                const joinedPlayer = players.get(event.Id);
                if (joinedPlayer === undefined) {return;}
                joinedPlayer.ws.send(JSON.stringify({
                    kind: "Hello",
                    Id: joinedPlayer.Id,
                    board: theBoard
                }));

                players.forEach((otherPlayer) => {
                    joinedPlayer.ws.send(JSON.stringify({
                        kind: "PlayerConnected",
                        Id: otherPlayer.Id
                    }));

                    if (otherPlayer.Id !== joinedPlayer.Id)
                    {
                        otherPlayer.ws.send(JSON.stringify({
                            kind: "PlayerConnected",
                            Id: joinedPlayer.Id
                        }))
                    }
                })
            } break;
    
            case 'PlayerLeft': {
                const eventString = JSON.stringify(event);
                players.forEach((player) => player.ws.send(eventString));
            } break;
        
            case 'PlayerDrawing': {
                const player = players.get(event.Id);
                if (player === undefined) {return;}
                theBoard[event.row][event.col] = event.state;
                
                const eventString = JSON.stringify(event);
                players.forEach((player) => {player.ws.send(eventString);});
            } break;
        }
    });

    eventQueue.length = 0;

    setTimeout(tick, 1000 / FRAME_FPS);
}

setTimeout(tick, 1000 / FRAME_FPS);