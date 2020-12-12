const CELL_SIZE = 5;
const COLS = CELL_SIZE * 30;
const ROWS = CELL_SIZE * 20;
const DEAD = 0;
const ALIVE = 1;
const ADD_NEW = 2;
const INTERVAL = 60;

class Cell {
    constructor() {
        this.state = 'background';
    }

    getColor() {
        return colors[this.state];
    }

    getState() {
        return ['live', 'justLive'].includes(this.state) ? 1 : 0;
    }

    setState(state) {
        switch (state) {
            case DEAD:
                if (!['dead', 'justDead'].includes(this.state)) {
                    this.state = 'justDead';
                } else {
                    this.state = 'dead';
                }
                break;
            case ALIVE:
                if (!['live', 'justLive'].includes(this.state)) {
                    this.state = 'justLive';
                } else {
                    this.state = 'live';
                }
                break;
            case ADD_NEW:
                this.state = 'justLive';
                break;
            default:
                if (this.state === 'justLive') {
                    this.state = 'live';
                } else if (this.state === 'justDead') {
                    this.state = 'dead';
                }
                break;
        }
    }
}

const colors = {
    background: 'white',
    dead: 'gray',
    justDead: 'red',
    live: 'black',
    justLive: 'green'
}

const setup = () => {
    let grid = createGrid();
    let nextgrid = grid;

    const canvas = document.getElementById('c');
    const ctx = canvas.getContext("2d");
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;

    return {
        grid,
        nextgrid,
        ctx,
        canvas
    };
}

const createGrid = () => {
    const grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid[i] = [];
        for (let j = 0; j < COLS; j++) {
            grid[i][j] = new Cell();
        }
    }

    return grid;
}

const loop = (cb) => {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            cb(i, j);
        }
    }
}

const countNeighbours = (grid, x, y) => {
    let count = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            count += grid[(x + i + ROWS) % ROWS][(y + j + COLS) % COLS].getState();
        }
    }
    count -= grid[x][y].getState();

    return count;
}

const draw = (grid, ctx) => {
    loop((i, j) => {
        ctx.fillStyle = grid[i][j].getColor();
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

const drawSpecific = (grid, ctx, i, j) => {
    ctx.fillStyle = grid[i][j].getColor();
    ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

const nextGrid = (nextgrid) => {
    loop((i, j) => {
        let cell = nextgrid[i][j];
        const count = countNeighbours(nextgrid, i, j);
        if (!cell.getState() && count === 3) {
            nextgrid[i][j].setState(ALIVE);
        } else if (cell.getState() && (count < 2 || count > 3)) {
            nextgrid[i][j].setState(DEAD);
        } else {
            nextgrid[i][j].setState(99);
        }
    })

    return nextgrid;
}

const main = () => {
    let {grid, nextgrid, canvas, ctx} = setup();
    let pressedMouse = false;
    let intervalRun = false;
    const rect = canvas.getBoundingClientRect();
    const start = () => {
        intervalRun = true;
        nextgrid = grid;
        nextGrid(nextgrid)
        grid = nextgrid;
        draw(grid, ctx);
    }

    draw(grid, ctx);

    canvas.addEventListener("mousedown", function () {
        pressedMouse = true;
        clearInterval(drawInterval);

        canvas.onmousemove = function (event) {
            if (pressedMouse === true) {
                const y = event.clientY - rect.top;
                const x = event.clientX - rect.left;
                const i = Math.floor(y / CELL_SIZE);
                const j = Math.floor(x / CELL_SIZE);
                grid[i][j].setState(ADD_NEW);
                drawSpecific(grid, ctx, i, j);
            }
        }
    });
    canvas.addEventListener("mouseup", function (e) {
        pressedMouse = false;
        if (intervalRun) {
            drawInterval = setInterval(start, INTERVAL)
        }
    });

    let drawInterval;
    const buttonStart = document.querySelector('button.start');
    const buttonStop = document.querySelector('button.stop');
    const buttonReset = document.querySelector('button.reset');

    buttonStart.addEventListener('click', () => {
        drawInterval = setInterval(start, INTERVAL)
    });
    buttonStop.addEventListener('click', () => {
        clearInterval(drawInterval);
        intervalRun = false;
    });
    buttonReset.addEventListener('click', () => {
        grid = createGrid();
        draw(grid, ctx);
    });
}

main();