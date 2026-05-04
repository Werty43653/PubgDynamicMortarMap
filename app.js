// ============================================================
// PUBG Mortar Calculator — app.js
// ============================================================

// ------ MAP CONFIG ------------------------------------------
// mapSizeM: real in-game map side length in metres
// gridM:    grid line interval (metres) drawn on canvas
// gridLabel: how to label major grid squares
// -------------------------------------------------------
const MAPS = {
  taego: {
  name: 'Taego',
  info: 'Taego — 8×8 km',
  image: 'maps/taego.png',
  mapSizeM: 8000,
  gridM: 1000,
  gridAlpha: 0.30,
},
  rondo: {
    name: 'Rondo',
    info: 'Rondo — 8×8 km',
    image: 'maps/rondo.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  sanhok: {
    name: 'Sanhok',
    info: 'Sanhok — 4×4 km',
    image: 'maps/sanhok.png',
    mapSizeM: 4000,
    gridM: 500,
    gridAlpha: 0.28,
  },
  erangel: {
    name: 'Erangel',
    info: 'Erangel — 8×8 km',
    image: 'maps/erangel.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  miramar: {
    name: 'Miramar',
    info: 'Miramar — 8×8 km',
    image: 'maps/miramar.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  vikendi: {
    name: 'Vikendi',
    info: 'Vikendi — 6×6 km',
    image: 'maps/vikendi.png',
    mapSizeM: 6000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  karakin: {
    name: 'Karakin',
    info: 'Karakin — 2×2 km',
    image: 'maps/karakin.png',
    mapSizeM: 2000,
    gridM: 250,
    gridAlpha: 0.28,
  },
  deston: {
    name: 'Deston',
    info: 'Deston — 8×8 km',
    image: 'maps/deston.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  paramo: {
    name: 'Paramo',
    info: 'Paramo — 3×3 km',
    image: 'maps/paramo.png',
    mapSizeM: 3000,
    gridM: 500,
    gridAlpha: 0.28,
  },
};

// PUBG grid column letters (left→right) and row numbers (top→bottom)
const GRID_COLS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const GRID_ROWS = ['1','2','3','4','5','6','7','8','9','10','11','12'];

// ============================================================
// State
// ============================================================
let currentMap = 'erangel';
let pointA = null;
let pointB = null;
let clicks = 0;
let totalDist = 0;
let mapImage = null;
let showGrid = true;

let zoom = 1;
let panX = 0;
let panY = 0;

let isDragging = false;
let dragMoved = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPanX = 0;
let dragStartPanY = 0;

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.style.cursor = 'grab';

// ============================================================
// Helpers
// ============================================================
function metersPerPixel() {
  return MAPS[currentMap].mapSizeM / canvas.width;
}

function pxToMeters(px) {
  return px * metersPerPixel();
}

function screenToWorld(x, y) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return [
    cx + (x - cx - panX) / zoom,
    cy + (y - cy - panY) / zoom
  ];
}

function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return [
    (e.clientX - rect.left) * scaleX,
    (e.clientY - rect.top) * scaleY
  ];
}

// ============================================================
// Drawing
// ============================================================
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawMapImage() {
  if (!mapImage) return;

  ctx.save();
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
  ctx.scale(zoom, zoom);
  ctx.drawImage(mapImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  ctx.restore();
}

function drawGrid() {
  const cfg = MAPS[currentMap];
  const cellPx = (canvas.width / cfg.mapSizeM) * cfg.gridM;
  const cells = Math.round(cfg.mapSizeM / cfg.gridM);

  ctx.save();
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
  ctx.scale(zoom, zoom);

  ctx.strokeStyle = `rgba(255,255,255,${cfg.gridAlpha})`;
  ctx.lineWidth = 0.8 / zoom;
  ctx.setLineDash([]);

  for (let i = 0; i <= cells; i++) {
    const pos = Math.round(i * cellPx);

    ctx.beginPath();
    ctx.moveTo(pos - canvas.width / 2, -canvas.height / 2);
    ctx.lineTo(pos - canvas.width / 2, canvas.height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, pos - canvas.height / 2);
    ctx.lineTo(canvas.width / 2, pos - canvas.height / 2);
    ctx.stroke();
  }

  if (cells <= 12) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `bold ${Math.max(9, Math.round(cellPx * 0.14)) / zoom}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const label = (GRID_COLS[c] || c) + (GRID_ROWS[r] || r);
        ctx.fillText(label, -canvas.width / 2 + c * cellPx + 4, -canvas.height / 2 + r * cellPx + 3);
      }
    }
  }

  ctx.restore();
}

function drawScaleRuler() {
  const mpp = metersPerPixel() / zoom;

  const candidates = [50, 100, 200, 250, 500, 1000];
  const target = 120;
  let rulerM = candidates[0];

  for (const m of candidates) {
    if (m / mpp <= target) rulerM = m;
  }

  const rulerPx = rulerM / mpp;
  const x0 = 14, y0 = canvas.height - 22;
  const barH = 8;

  ctx.save();

  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;

  ctx.fillStyle = '#000';
  ctx.fillRect(x0 - 1, y0 - 1, rulerPx + 2, barH + 2);

  const half = rulerPx / 2;
  ctx.fillStyle = 'white';
  ctx.fillRect(x0, y0, half, barH);
  ctx.fillStyle = '#333';
  ctx.fillRect(x0 + half, y0, half, barH);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;

  for (const t of [0, 0.5, 1.0]) {
    ctx.beginPath();
    ctx.moveTo(x0 + t * rulerPx, y0 - 3);
    ctx.lineTo(x0 + t * rulerPx, y0 + barH + 2);
    ctx.stroke();
  }

  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 11px Arial';
  ctx.textBaseline = 'bottom';

  ctx.textAlign = 'left';
  ctx.fillText('0', x0, y0 - 4);

  ctx.textAlign = 'center';
  ctx.fillText(`${rulerM / 2}m`, x0 + half, y0 - 4);

  ctx.textAlign = 'right';
  ctx.fillText(`${rulerM}m`, x0 + rulerPx, y0 - 4);

  ctx.restore();
}

function drawDot(x, y, color) {
  ctx.save();
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
  ctx.scale(zoom, zoom);

  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - canvas.width / 2, y - canvas.height / 2, 5 / zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5 / zoom;
  ctx.stroke();

  ctx.restore();
}

function drawPoints() {
  if (pointA) {
    drawDot(pointA[0], pointA[1], '#ff3030');
  }

  if (pointB) {
    drawDot(pointB[0], pointB[1], '#ff3030');

    ctx.save();
    ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
    ctx.scale(zoom, zoom);

    ctx.strokeStyle = '#ff3030';
    ctx.lineWidth = 1.8 / zoom;
    ctx.setLineDash([6 / zoom, 4 / zoom]);
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.moveTo(pointA[0] - canvas.width / 2, pointA[1] - canvas.height / 2);
    ctx.lineTo(pointB[0] - canvas.width / 2, pointB[1] - canvas.height / 2);
    ctx.stroke();

    const mx = (pointA[0] + pointB[0]) / 2 - canvas.width / 2;
    const my = (pointA[1] + pointB[1]) / 2 - canvas.height / 2;
    const distM = Math.round(pxToMeters(dist(pointA, pointB)));

    ctx.font = `bold ${13 / zoom}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'white';
    ctx.fillText(distM + 'm', mx, my - 12 / zoom);

    ctx.restore();
  }
}

function dist(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function redraw() {
  clear();
  drawMapImage();
  if (showGrid) drawGrid();
  drawScaleRuler();
  drawPoints();
}

// ============================================================
// Canvas sizing
// ============================================================
function resizeCanvas() {
  const wrap = canvas.parentElement;
  const size = Math.min(wrap.clientWidth, wrap.clientHeight);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  redraw();
}

// ============================================================
// Map loading
// ============================================================
function loadMap(mapKey) {
  if (!MAPS[mapKey]) return;

  document.querySelectorAll('.mapbox').forEach(el => el.classList.remove('active'));
  const btn = document.getElementById('btn-' + mapKey);
  if (btn) btn.classList.add('active');

  document.getElementById('mapname').textContent = MAPS[mapKey].info;

  currentMap = mapKey;
  zoom = 1;
  panX = 0;
  panY = 0;
  resetPoints();

  mapImage = new Image();
  mapImage.onload = () => redraw();
  mapImage.src = MAPS[mapKey].image;
}

// ============================================================
// Reset
// ============================================================
function resetPoints() {
  pointA = null;
  pointB = null;
  clicks = 0;
  totalDist = 0;
  document.getElementById('display').textContent = '0m';
  redraw();
}

// ============================================================
// Click handler
// ============================================================
canvas.addEventListener('click', (e) => {
  if (dragMoved) {
    dragMoved = false;
    return;
  }

  const [x, y] = getCanvasPoint(e);
  const [wx, wy] = screenToWorld(x, y);

  clicks++;

  if (clicks % 2 === 1) {
    pointA = [wx, wy];
    pointB = null;
    totalDist = 0;
  } else {
    pointB = [wx, wy];
    totalDist = dist(pointA, pointB);
    const meters = Math.round(pxToMeters(totalDist));
    document.getElementById('display').textContent = meters + 'm';
  }

  redraw();
});

// ============================================================
// Drag to move map
// ============================================================
canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;

  isDragging = true;
  dragMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStartPanX = panX;
  dragStartPanY = panY;
  canvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    dragMoved = true;
  }

  panX = dragStartPanX + dx;
  panY = dragStartPanY + dy;
  redraw();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

// ============================================================
// Zoom
// ============================================================
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();

  const [x, y] = getCanvasPoint(e);

  const oldZoom = zoom;
  const delta = e.deltaY < 0 ? 1.0 : -1.0;
  const newZoom = Math.min(20, Math.max(1, zoom + delta));

  if (newZoom === oldZoom) return;

  const world = screenToWorld(x, y);
  zoom = newZoom;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  panX = x - cx - zoom * (world[0] - cx);
  panY = y - cy - zoom * (world[1] - cy);

  redraw();
}, { passive: false });

// ============================================================
// Grid toggle
// ============================================================
document.getElementById('gridToggle').addEventListener('change', (e) => {
  showGrid = e.target.checked;
  redraw();
});

// ============================================================
// Map buttons
// ============================================================
document.querySelectorAll('a[data-map]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    loadMap(a.dataset.map);
  });
});

// ============================================================
// Clear button
// ============================================================
document.getElementById('clearBtn').addEventListener('click', resetPoints);

// ============================================================
// Window resize
// ============================================================
window.addEventListener('resize', resizeCanvas);

// ============================================================
// Init
// ============================================================
resizeCanvas();
loadMap('erangel');