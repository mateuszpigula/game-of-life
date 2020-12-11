const CELL_SIZE = 3;
const COLS = CELL_SIZE * 40*2;
const ROWS = CELL_SIZE * 20*2;

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
    const grid = new Array(COLS);
    for (let i = 0; i < ROWS; i++) {
        grid[i] = new Array(COLS).fill(0);
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
            count += grid[(x + i + ROWS) % ROWS][(y + j + COLS) % COLS];
        }
    }
    count -= grid[x][y];

    return count;
}

const draw = (grid, ctx) => {
    loop((i, j) => {
        ctx.fillStyle = grid[i][j] ? 'white' : 'black';
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

const nextGrid = (nextgrid) => {
    loop((i, j) => {
        let cell = nextgrid[i][j];
        const count = countNeighbours(nextgrid, i, j);
        if (!cell && count === 3) {
            nextgrid[i][j] = 1
        } else if (cell && (count < 2 || count > 3)) {
            nextgrid[i][j] = 0
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
                grid[Math.floor(y / CELL_SIZE)][Math.floor(x / CELL_SIZE)] = 1;
                draw(grid, ctx);
            }
        }
    });
    canvas.addEventListener("mouseup", function (e) {
        pressedMouse = false;
        if (intervalRun) {
            drawInterval = setInterval(start, 60)
        }
    });

    let drawInterval;
    const buttonStart = document.querySelector('button.start');
    const buttonStop = document.querySelector('button.stop');
    const buttonReset = document.querySelector('button.reset');

    buttonStart.addEventListener('click', () => {
        drawInterval = setInterval(start, 60)
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