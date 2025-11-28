const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const algorithmSelect = document.getElementById('algorithmSelect');
const newMazeBtn = document.getElementById('newMazeBtn');
const showSolutions = document.getElementById('showSolutions');
const slider = document.getElementById("sizeSlider");
const sizeLabel = document.getElementById("sizeLabel");

slider.addEventListener("input", () => {
    sizeLabel.textContent = `${slider.value} × ${slider.value}`;
});

let rows = 15;
let cols = 15;
let cellSize = 30;

let player = { x: 0, y: 0 };
let goal = { x: cols - 1, y: rows - 1 };

slider.addEventListener("change", () => {
    const newSize = parseInt(slider.value);

    rows = newSize;
    cols = newSize;

    //cellSize = Math.floor(450 / newSize); 
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    player = { x: 0, y: 0 };
    goal = { x: cols - 1, y: rows - 1 };
    
});


//canvas.width = cols * cellSize;
//canvas.height = rows * cellSize;

let maze = [];
/*
let player = { x: 0, y: 0 };
let goal = { x: cols - 1, y: rows - 1 };
*/
function initializeMaze() {
  maze = Array.from({ length: rows }, () => Array(cols).fill(1));
}

function generateMazeDFS() {
  initializeMaze();
  const stack = [];
  const visited = new Set();
  const start = { x: 0, y: 0 };
  maze[start.y][start.x] = 0;
  stack.push(start);
  visited.add('0,0');

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];

  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbors = directions
      .map(d => ({ x: current.x + d.dx * 2, y: current.y + d.dy * 2, dir: d }))
      .filter(n =>
        n.x >= 0 &&
        n.x < cols &&
        n.y >= 0 &&
        n.y < rows &&
        !visited.has(`${n.x},${n.y}`)
      );

    if (!neighbors.length) stack.pop();
    else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[current.y + next.dir.dy][current.x + next.dir.dx] = 0;
      maze[next.y][next.x] = 0;
      visited.add(`${next.x},${next.y}`);
      stack.push(next);
    }
  }
  maze[goal.y][goal.x] = 0;
}

function generateMazePrim() {
  initializeMaze();

  const walls = [];
  function markCell(x, y) {
    maze[y][x] = 0; 
    const directions = [
      [x + 2, y, x + 1, y], 
      [x - 2, y, x - 1, y], 
      [x, y + 2, x, y + 1], 
      [x, y - 2, x, y - 1], 
    ];

    for (const [nx, ny, wx, wy] of directions) {
      if (
        nx >= 0 &&
        nx < cols &&
        ny >= 0 &&
        ny < rows &&
        maze[ny][nx] === 1
      ) {
        walls.push([nx, ny, wx, wy]);
      }
    }
  }
  markCell(0, 0);
  while (walls.length > 0) {
    const index = Math.floor(Math.random() * walls.length);
    const [nx, ny, wx, wy] = walls.splice(index, 1)[0];
    if (maze[ny][nx] === 1) {
      maze[wy][wx] = 0; 
      markCell(nx, ny);
    }
  }
  maze[goal.y][goal.x] = 0;
}



function generateMazeKruskal() {
  initializeMaze();
  const cells = [];
  const sets = {};
  let setId = 0;

  for (let y = 0; y < rows; y += 2) {
    for (let x = 0; x < cols; x += 2) {
      cells.push({ x, y });
      sets[`${x},${y}`] = setId++;
      maze[y][x] = 0;
    }
  }

  const walls = [];
  for (const c of cells) {
    if (c.x + 2 < cols) walls.push({ x: c.x + 1, y: c.y, a: c, b: { x: c.x + 2, y: c.y } });
    if (c.y + 2 < rows) walls.push({ x: c.x, y: c.y + 1, a: c, b: { x: c.x, y: c.y + 2 } });
  }

  walls.sort(() => Math.random() - 0.5);

  const findSet = (x, y) => sets[`${x},${y}`];
  const unionSet = (a, b) => {
    const oldSet = sets[`${b.x},${b.y}`];
    const newSet = sets[`${a.x},${a.y}`];
    for (const key in sets) {
      if (sets[key] === oldSet) sets[key] = newSet;
    }
  };

  for (const w of walls) {
    if (findSet(w.a.x, w.a.y) !== findSet(w.b.x, w.b.y)) {
      maze[w.y][w.x] = 0;
      unionSet(w.a, w.b);
    }
  }

  maze[goal.y][goal.x] = 0;
}

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = maze[y][x] === 1 ? '#333' : '#000';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(
    player.x * cellSize + cellSize / 2,
    player.y * cellSize + cellSize / 2,
    cellSize / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawGoal() {
  ctx.fillStyle = 'lime';
  ctx.fillRect(
    goal.x * cellSize + cellSize / 4,
    goal.y * cellSize + cellSize / 4,
    cellSize / 2,
    cellSize / 2
  );
}

function drawAll() {
  drawMaze();
  drawGoal();
  drawPlayer();
}

function movePlayer(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;
  if (
    newX >= 0 &&
    newX < cols &&
    newY >= 0 &&
    newY < rows &&
    maze[newY][newX] === 0
  ) {
    player.x = newX;
    player.y = newY;
    if (player.x === goal.x && player.y === goal.y) {
      setTimeout(() => alert('Chiến thắng'), 100);
      generateNewMaze();
    }
  }
  drawAll();
}

document.addEventListener('keydown', e => {
  if (e.key === 'i') movePlayer(0, -1);
  if (e.key === 'k') movePlayer(0, 1);
  if (e.key === 'j') movePlayer(-1, 0);
  if (e.key === 'l') movePlayer(1, 0);
});

function generateNewMaze() {
  const algorithm = algorithmSelect.value;
  if (algorithm === 'dfs') generateMazeDFS();
  else if (algorithm === 'prim') generateMazePrim();
  else generateMazeKruskal();

  player = { x: 0, y: 0 };
  goal = { x: cols - 1, y: rows - 1 };
  drawAll();
  console.log(rows, cols, maze.length, maze[0].length);
}



newMazeBtn.addEventListener('click', generateNewMaze);

function bfs(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const queue = [[sx, sy]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const dirs = [
    [1, 0],   
    [-1, 0], 
    [0, 1],  
    [0, -1]   
  ];
  visited[sy][sx] = true;
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x === ex && y === ey) break;

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        ny >= 0 && ny < rows &&
        nx >= 0 && nx < cols &&
        maze[ny][nx] === 0 &&
        !visited[ny][nx]
      ) {
        visited[ny][nx] = true;
        prev[ny][nx] = [x, y];
        queue.push([nx, ny]);
      }
    }
  }

  const path = [];
  let cur = [ex, ey];
  while (cur) {
    path.unshift(cur);
    const [cx, cy] = cur;
    cur = prev[cy][cx];
  }

  if (path.length === 1 && (path[0][0] !== sx || path[0][1] !== sy)) return [];
  return path;
}

function dfs(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;

  const stack = [[sx, sy]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));

  const dirs = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
  ];

  visited[sy][sx] = true;

  while (stack.length > 0) {
    const [x, y] = stack.pop();

    if (x === ex && y === ey) break;

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 && nx < cols &&
        ny >= 0 && ny < rows &&
        maze[ny][nx] === 0 &&
        !visited[ny][nx]
      ) {
        visited[ny][nx] = true;
        prev[ny][nx] = [x, y];
        stack.push([nx, ny]);
      }
    }
  }
  const path = [];
  let cur = [ex, ey];
  while (cur) {
    path.unshift(cur);
    const [cx, cy] = cur;
    cur = prev[cy][cx];
  }

  if (path.length === 1 && (path[0][0] !== sx || path[0][1] !== sy)) return [];
  return path;
}


function dijkstra(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  const dirs = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
  ];

  dist[sy][sx] = 0;
  const pq = [[sx, sy, 0]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[2] - b[2]);
    const [x, y, d] = pq.shift();

    if (visited[y][x]) continue;
    visited[y][x] = true;

    if (x === ex && y === ey) break;

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 && nx < cols &&
        ny >= 0 && ny < rows &&
        maze[ny][nx] === 0
      ) {
        const newDist = d + 1;
        if (newDist < dist[ny][nx]) {
          dist[ny][nx] = newDist;
          prev[ny][nx] = [x, y];
          pq.push([nx, ny, newDist]);
        }
      }
    }
  }
  const path = [];
  let cur = [ex, ey];
  while (cur) {
    path.unshift(cur);
    const [cx, cy] = cur;
    cur = prev[cy][cx];
  }

  if (path.length === 1 && (path[0][0] !== sx || path[0][1] !== sy)) return [];
  return path;
}


function drawPath(path) {
  if (!path || path.length === 0) return;

  ctx.fillStyle = '#00ffff'; 

  for (const [x, y] of path) {
    ctx.fillRect(
      x * cellSize + cellSize / 5, 
      y * cellSize + cellSize /5,
      cellSize /5,
      cellSize /5
    );
  }
  
}

function showSolution() {
  const algo = document.getElementById("pathAlgo").value;
  let path;

  if (algo === "bfs") path = bfs([player.x, player.y], [goal.x, goal.y]);
  else if (algo === "dfs") path = dfs([player.x, player.y], [goal.x, goal.y]);
  else if (algo == "dijkstra") path = dijkstra([player.x, player.y], [goal.x, goal.y]);

  if (!path || path.length === 0) {
    alert("Không tìm thấy đường đi");
    return;
  }

  drawMaze();
  drawPath(path);
}
//hiện đang gặp lỗi không thể vẽ ra đường đi

showSolutions.addEventListener('click', showSolution);


//generateNewMaze();
