import * as common from './common.mjs'
import { Player , Board} from './common.mjs';

//-p 6969 -a 127.0.0.1 -s -c-1

const canvasId = "app";

const app = document.getElementById(canvasId) as HTMLCanvasElement;
if (app === null)
{
    throw new Error("Does not exist");
}

app.width = common.CANVAS_WIDTH;
app.height = common.CANVAS_HEIGHT;

const ctx = app.getContext("2d");
if (ctx === null)
{
    throw new Error("No canvas");
}

const resetBut = document.getElementById("resetBut") as HTMLButtonElement;

const colourState= ["#181818","cyan", "magenta", "yellow"];

let myBoard: Board;
let myId: undefined | number = undefined;
const players = new Map<number,Player>();

const ws = new WebSocket(`ws:${window.location.hostname}:${common.SERVER_PORT}`);

ws.addEventListener('open', () => 
{
    console.log('Connected to server');
});

ws.addEventListener('close', () => 
{
    console.log('Disconnected from server');
});

ws.addEventListener("error", (event) => {
    console.log("Websocket error", event)
});

ws.addEventListener('message', (e) => 
{
    const message = JSON.parse(e.data)
    console.log(`Received message from server: ${e.data}`);

    if (myId === undefined) 
    {
        if (message.kind === "Hello")
        {
            myId = message.Id;
            myBoard = message.board.slice(0);
        }
        else
        {
            console.log('Crap message');
            ws.close();
        }
    }
    else
    {
        if (message.kind === "PlayerConnected")
        {
            players.set(message.Id, {Id: message.Id})
        }
        else if (message.kind === "PlayerLeft")
        {
            players.delete(message.id)
        }
        else if (message.kind === "PlayerDrawing")
        {
            const player = players.get(message.Id)
            if (player === undefined) 
            {
                console.log(`We don't know anything about player with id ${message.id}`);
                ws.close();
                return;
            }
            myBoard[message.row][message.col] = message.state;
        }
        else
        {
            console.log('Crap message');
            ws.close();
        }
    }
});

// =========================================================

// Render board
function render(ctx: CanvasRenderingContext2D , myBoard: Board)
{
    ctx.fillStyle = "#181818"
    ctx.fillRect(0, 0, app.width, app.height);

    for (let row = 0; row < common.BOARD_ROWS; row++) 
    {
    for (let col = 0; col < common.BOARD_COL; col++)
    {
        ctx.fillStyle = colourState[myBoard[row][col]];
        ctx.fillRect(col * common.CELL_WIDTH, row * common.CELL_HEIGHT, common.CELL_WIDTH, common.CELL_HEIGHT);
    }
    }
}

const frame = (timestamp: number) =>
{
    if (myId !== undefined)
    {
        render(ctx, myBoard);
    }
    

    window.requestAnimationFrame(frame)
}
window.requestAnimationFrame(frame);


app.addEventListener("mousemove", (e) => {
    if (e.buttons == 1)
    {    
        const rect = app.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / common.CELL_WIDTH);
        const row = Math.floor(y / common.CELL_HEIGHT);
        let state;
        if (e.ctrlKey == true)
        {
            //myBoard[row][col] = 0;
            state = 0;
        }
        else
        {
            //myBoard[row][col] = (col + row) % 3 + 1;
            state  = (col + row) % 3 + 1;
        }

        ws.send(JSON.stringify({
            state: state,
            row: row,
            col: col,
        }));
    }
}); 

app.addEventListener("mousedown", (e) => {
   
    const rect = app.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / common.CELL_WIDTH);
    const row = Math.floor(y / common.CELL_HEIGHT);
    let state;
    if (e.ctrlKey == true)
    {
        //myBoard[row][col] = 0;
        state = 0;
    }
    else
    {
        //myBoard[row][col] = (col + row) % 3 + 1;
        state  = (col + row) % 3 + 1;
    } 

    ws.send(JSON.stringify({
        state: state,
        row: row,
        col: col,
    }));
}); 

resetBut.addEventListener("click", (e) => 
{
    for (let r = 0; r < common.BOARD_ROWS; r++)
    {
        for (let c = 0; c < common.BOARD_COL; c++)
        {
            myBoard[r][c] = 0;
        }
    }
})