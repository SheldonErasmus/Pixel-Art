export const SERVER_PORT = 6970;

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;
export const BOARD_ROWS = 100;
export const BOARD_COL = 100;
export const CELL_WIDTH = CANVAS_WIDTH / BOARD_COL
export const CELL_HEIGHT = CANVAS_HEIGHT / BOARD_ROWS

export interface Player {
    Id: number,
}

export type Board = Array<Array<number>>;

export interface PlayerDrawing {
    kind: "PlayerDrawing",
    Id: number,
    state:number,
    row:number,
    col:number,
}

export interface PlayerConnected {
    kind: "PlayerConnected",
    Id: number,
}

export interface PlayerLeft {
    kind: "PlayerLeft",
    Id: number,
}

export interface Hello {
    kind: "Hello",
    Id: number,
    board: Board
}

export type Event = PlayerDrawing | PlayerConnected | PlayerLeft;
