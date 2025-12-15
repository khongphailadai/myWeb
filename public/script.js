const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const algorithmSelect = document.getElementById('algorithmSelect');
const newMazeBtn = document.getElementById('newMazeBtn');
const showSolutions = document.getElementById('showSolutions');
const slider = document.getElementById("sizeSlider");
const sizeLabel = document.getElementById("sizeLabel");
const visitDelaySlider = document.getElementById('visitDelaySlider');
const themeToggle = document.getElementById('themeToggle');
//const pathDelaySlider = document.getElementById('pathDelaySlider');
//const visitDelayLabel = document.getElementById('visitDelayLabel');
//const pathDelayLabel = document.getElementById('pathDelayLabel');

slider.addEventListener("input", () => {
    sizeLabel.textContent = `${slider.value} × ${slider.value}`;
});

let rows = 15;
let cols = 15;
let cellSize = 30;

// Update player object to include current and target positions for animation
let player = { x: 0, y: 0, currentX: cellSize / 2, currentY: cellSize / 2, targetX: cellSize / 2, targetY: cellSize / 2 };
let isAnimating = false; // Flag to prevent moves during animation

let goal = { x: cols - 1, y: rows - 1 };

slider.addEventListener("change", () => {
    const newSize = parseInt(slider.value);

    rows = newSize;
    cols = newSize;

    //cellSize = Math.floor(450 / newSize); 
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    player = { x: 0, y: 0, currentX: cellSize / 2, currentY: cellSize / 2, targetX: cellSize / 2, targetY: cellSize / 2 };
    goal = { x: cols - 1, y: rows - 1 };
    
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    drawAll(); 
});

function getThemeColors() {
    const isLight = document.body.classList.contains('light-mode');
    return {
        wall: isLight ? '#000' : '#333',
        path: isLight ? '#fff' : '#000',
        player: isLight ? '#0734fcff' : 'yellow',
        goal: isLight ? '#fb00ffff' : 'lime',
        visited: 'rgba(28,106,37,0.9)',
        solution: isLight ? 'rgba(255, 119, 0, 1)' : 'rgba(0,255,255,0.95)'
    };
}


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
/*
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
*/

function generateMazeDFS() {
  initializeMaze();
  const stack = [];
  const visited = new Set();
  const visitedOrder = [];
  const start = { x: 0, y: 0 };
  maze[start.y][start.x] = 0;
  visitedOrder.push([start.x, start.y]);
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
      const wx = current.x + next.dir.dx;
      const wy = current.y + next.dir.dy;
      maze[wy][wx] = 0;
      visitedOrder.push([wx, wy]);
      maze[next.y][next.x] = 0;
      visitedOrder.push([next.x, next.y]);
      visited.add(`${next.x},${next.y}`);
      stack.push(next);
    }
  }
  maze[goal.y][goal.x] = 0;
  visitedOrder.push([goal.x, goal.y]);
  return visitedOrder;
}
/*
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
*/
/*

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
*/

function generateMazePrim() {
  initializeMaze();
  const walls = [];
  const visitedOrder = [];
  function markCell(x, y) {
    if (maze[y][x] === 0) return;
    maze[y][x] = 0;
    visitedOrder.push([x, y]);
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
      visitedOrder.push([wx, wy]); // wall removed
      markCell(nx, ny);
    }
  }
  maze[goal.y][goal.x] = 0;
  visitedOrder.push([goal.x, goal.y]);
  return visitedOrder;
}

function generateMazeKruskal() {
  initializeMaze();
  const cells = [];
  const sets = {};
  let setId = 0;
  const visitedOrder = [];

  for (let y = 0; y < rows; y += 2) {
    for (let x = 0; x < cols; x += 2) {
      cells.push({ x, y });
      sets[`${x},${y}`] = setId++;
      maze[y][x] = 0;
      visitedOrder.push([x, y]);
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
      visitedOrder.push([w.x, w.y]); 
      unionSet(w.a, w.b);
    }
  }

  maze[goal.y][goal.x] = 0;
  visitedOrder.push([goal.x, goal.y]);
  return visitedOrder;
}

function drawBlankMaze() {
  const colors = getThemeColors();
  ctx.fillStyle = colors.wall; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function animateMazeGeneration(visitedOrder, options = {}) {
  
  if (animationAbortController) animationAbortController.abort();
  animationAbortController = new AbortController();
  const signal = animationAbortController.signal;
  const genDelay = options.genDelay ?? Number(visitDelaySlider?.value ?? 5);


  //drawMaze();
  drawBlankMaze();
  //drawGoal();
  //drawPlayer();

  for (const [x, y] of visitedOrder) {
    if (signal.aborted) return;
    const colors = getThemeColors();
    ctx.fillStyle = colors.path; 
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    await sleep(visitDelaySlider?.value ?? genDelay);
  }

  drawAll();
}

function drawMaze() {
  const colors = getThemeColors();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = maze[y][x] === 1 ? colors.wall : colors.path;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function movePlayer(dx, dy) {
  if (isAnimating) return;

  

  const newX = player.x + dx;
  const newY = player.y + dy;
  if (
    newX >= 0 &&
    newX < cols &&
    newY >= 0 &&
    newY < rows &&
    maze[newY][newX] === 0
  ) {
    if (animationAbortController) animationAbortController.abort();

    player.targetX = newX * cellSize + cellSize / 2;
    player.targetY = newY * cellSize + cellSize / 2;
    player.x = newX;
    player.y = newY;
    isAnimating = true;
    animatePlayerMove();
  }
}

function animatePlayerMove() {
  const speed = 0.2; 
  const dx = player.targetX - player.currentX;
  const dy = player.targetY - player.currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 1) { 
    player.currentX = player.targetX;
    player.currentY = player.targetY;
    isAnimating = false;
    drawAll();
    if (player.x === goal.x && player.y === goal.y) {
      goalOverlay.classList.remove('hidden');
    }
    return;
  }
  player.currentX += dx * speed;
  player.currentY += dy * speed;

  drawAll();
  requestAnimationFrame(animatePlayerMove);
}

function drawPlayer() {
  const colors = getThemeColors();
  ctx.fillStyle = colors.player;
  ctx.beginPath();
  ctx.arc(
    player.currentX,
    player.currentY,
    cellSize / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawGoal() {
  const colors = getThemeColors();
  ctx.fillStyle = colors.goal;
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

const goalOverlay = document.getElementById('goalOverlay');
const playAgainBtn = document.getElementById('playAgainBtn');

playAgainBtn.addEventListener('click', () => {
  goalOverlay.classList.add('hidden');
  generateNewMaze();
});

document.addEventListener('keydown', e => {
  if (e.key === 'i') movePlayer(0, -1);
  if (e.key === 'k') movePlayer(0, 1);
  if (e.key === 'j') movePlayer(-1, 0);
  if (e.key === 'l') movePlayer(1, 0);
});

async function generateNewMaze() {
  
  if (animationAbortController) {
    animationAbortController.abort();
  }

  const algorithm = algorithmSelect.value;
  let visitedOrder = [];
  if (algorithm === 'dfs') visitedOrder = generateMazeDFS();
  else if (algorithm === 'prim') visitedOrder = generateMazePrim();
  else visitedOrder = generateMazeKruskal();

  player = { x: 0, y: 0, currentX: cellSize / 2, currentY: cellSize / 2, targetX: cellSize / 2, targetY: cellSize / 2 };
  goal = { x: cols - 1, y: rows - 1 };

  const options = { genDelay: Number(visitDelaySlider?.value ?? 8) };
  await animateMazeGeneration(visitedOrder, options);

  console.log(rows, cols, maze.length, maze[0].length);
}




newMazeBtn.addEventListener('click', generateNewMaze);

function drawVisited(x, y, color) {
  if (!color) {
    const colors = getThemeColors();
    color = colors.visited;
  }
  ctx.fillStyle = color;
  ctx.fillRect(
    x * cellSize + cellSize * 0.2,
    y * cellSize + cellSize * 0.2,
    cellSize * 0.6,
    cellSize * 0.6
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bfs(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const queue = [[sx, sy]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visitedOrder = [];
  const dirs = [
    [1, 0],   
    [-1, 0], 
    [0, 1],  
    [0, -1]   
  ];
  visited[sy][sx] = true;
  visitedOrder.push([sx, sy]);
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
        visitedOrder.push([nx, ny]);
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
  return { visitedOrder, path };
}


function dfs(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;

  const stack = [[sx, sy]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visitedOrder = [];

  const dirs = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
  ];

  visited[sy][sx] = true;
  visitedOrder.push([sx, sy]);


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
        visitedOrder.push([nx, ny]);
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
  return { visitedOrder, path };
}


function dijkstra(start, end) {
  const [sx, sy] = start;
  const [ex, ey] = end;

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const visitedOrder = [];

  const dirs = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
  ];

  dist[sy][sx] = 0;
  visitedOrder.push([sx, sy]);
  const pq = [[sx, sy, 0]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[2] - b[2]);
    const [x, y, d] = pq.shift();

    if (visited[y][x]) continue;
    visited[y][x] = true;

    if (x === ex && y === ey) break;
    visitedOrder.push([x, y]);

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
  return { visitedOrder, path };
}


function drawPath(path) {
  if (!path || path.length === 0) return;

  ctx.fillStyle = '#00ffff'; 

  for (const [x, y] of path) {
    ctx.fillRect(
      x * cellSize  + cellSize /5, 
      y * cellSize  + cellSize /5,
      cellSize /5,
      cellSize /5
    );
  }
  
}

let animationAbortController = null;

async function animatePathfinding(result, options = {}) {
  animationAbortController = new AbortController();
  const signal = animationAbortController.signal;
  
  const { visitedOrder, path } = result;
  const visitDelay = options.visitDelay ?? 8;
  const pathDelay = options.pathDelay ?? 25;

  drawMaze();
  drawGoal();
  drawPlayer();

  for (const [x, y] of visitedOrder) {
    if (signal.aborted) return; 
    const colors = getThemeColors();
    drawVisited(x, y, colors.visited.replace('0.9', '0.75'));
    await sleep(visitDelay);
  }

  if (path && path.length) {
    const colors = getThemeColors();
    for (const [x, y] of path) {
      if (signal.aborted) return; 
      drawVisited(x, y, colors.solution);
      await sleep(pathDelay);
    }
  }
}

function showSolution() {
  if (animationAbortController) animationAbortController.abort();

  const algo = document.getElementById("pathAlgo").value;
  let result;
 
  if (algo === "bfs") result = bfs([player.x, player.y], [goal.x, goal.y]);
  else if (algo === "dfs") result = dfs([player.x, player.y], [goal.x, goal.y]);
  else if (algo == "dijkstra") result = dijkstra([player.x, player.y], [goal.x, goal.y]);
 
  if (!result || !result.path || result.path.length === 0) {
    alert("Không tìm thấy đường đi");
    return;
  }

  const options = {
    visitDelay: Number(visitDelaySlider?.value ?? 8),
    pathDelay: Number(25)
  };
  animatePathfinding(result, options);
}
showSolutions.addEventListener("click", showSolution);