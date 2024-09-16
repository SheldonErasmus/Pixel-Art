import * as common from './common.mjs'

const canvasId = "app";

const app = document.getElementById(canvasId) as HTMLCanvasElement;
if (app === null)
{
    throw new Error("Does not exist");
}

const ctx = app.getContext("2d");
if (ctx === null)
{
    throw new Error("No canvas");
}

const resetBut = document.getElementById("resetBut") as HTMLButtonElement;

app.width = 800;
app.height = 800;

const BOARD_ROWS = 100;
const BOARD_COL = 100;

const CELL_WIDTH = app.width / BOARD_COL
const CELL_HEIGHT = app.height / BOARD_ROWS

const colourState= ["#181818","cyan", "magenta", "yellow"];

// Create board
type Board = Array<Array<number>>;
const myBoard: Board = [];

for (let r = 0; r < BOARD_ROWS; r++)
{
    myBoard.push(new Array<number>(BOARD_COL).fill(0));
}

// Render board
function render(ctx: CanvasRenderingContext2D , myBoard: Board)
{
    ctx.fillStyle = "#181818"
    ctx.fillRect(0, 0, app.width, app.height);

    for (let row = 0; row < BOARD_ROWS; row++) 
    {
    for (let col = 0; col < BOARD_COL; col++)
    {
        ctx.fillStyle = colourState[myBoard[row][col]];
        ctx.fillRect(col * CELL_WIDTH, row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
    }
    }
}

app.addEventListener("mousemove", (e) => {
    if (e.buttons == 1)
    {    
        const rect = app.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / CELL_WIDTH);
        const row = Math.floor(y / CELL_HEIGHT);
        
        if (e.ctrlKey == true)
        {
            myBoard[row][col] = 0;
        }
        else
        {
            myBoard[row][col] = (col + row) % 3 + 1;
        }
        
        render(ctx, myBoard);
    }
}); 

app.addEventListener("mousedown", (e) => {
   
    const rect = app.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    
    if (e.ctrlKey == true)
    {
        myBoard[row][col] = 0;
    }
    else
    {
        myBoard[row][col] = (col + row) % 3 + 1;
    }
    
    render(ctx, myBoard);
    
}); 

resetBut.addEventListener("click", (e) => 
{
    for (let r = 0; r < BOARD_ROWS; r++)
    {
        for (let c = 0; c < BOARD_COL; c++)
        {
            myBoard[r][c] = 0;
        }
    }

    render(ctx, myBoard);
})

render(ctx, myBoard);


// =========================================================

const ws = new WebSocket(`ws://localhost:${common.SERVER_PORT}`);

ws.addEventListener('open', () => 
{
    console.log('Connected to server');
  
    ws.send('Hello, server!');
});
  
ws.addEventListener('message', (e) => 
{
    console.log(`Received message from server: ${e.data}`);
});
  
ws.addEventListener('close', () => 
{
    console.log('Disconnected from server');
});




