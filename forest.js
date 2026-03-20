// ==================== 初始森林 ====================

const FOREST_PLANTS_KEY  = "wordcards:forest:plants:v1";
const FOREST_COUNTER_KEY = "wordcards:forest:counter:v1";
const FOREST_THRESH_KEY  = "wordcards:forest:thresh:v1";

const F_COLS = 8;
const F_ROWS = 4;
const F_PS   = 3;   // canvas pixels per logical pixel
const F_SW   = 12;  // sprite logical width
const F_SH   = 16;  // sprite logical height

const FOREST_PAL = {
  G: "#2d8a2d", g: "#52c452", f: "#1a5c1a",
  B: "#5c3011", b: "#8b5e2b",
  R: "#cc2222", r: "#ff4444",
  Y: "#c8960a", y: "#f5d020",
  K: "#cc1877", W: "#e8e0d0",
};

// Pixel art plant sprites (12 wide × 16 tall, '.' = transparent)
const PLANT_TYPES = [
  { name: "蕨", pixels: [
    "............",
    "......g.....",
    ".....gGg....",
    "....gGGGg...",
    "...g.gGg.g..",
    "..g..gGg..g.",
    ".....gGg....",
    "......G.....",
    "......B.....",
    "......B.....",
    ".....BB.....",
    "....BB......",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "蘑菇", pixels: [
    "............",
    "....RRRR....",
    "...RRRRRRr..",
    "..RRWRRWRR..",
    "..RRRRRRRR..",
    "...RRRRRR...",
    "....RRRR....",
    ".....bb.....",
    ".....bb.....",
    ".....bb.....",
    "....bbbb....",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "竹", pixels: [
    "..GG....GG..",
    ".gGG....GG..",
    "..GG....GGg.",
    "..GG....GG..",
    "..GGGGGGGG..",
    "..GG....GG..",
    ".gGG....GG..",
    "..GG....GGg.",
    "..GG....GG..",
    "..GGGGGGGG..",
    "..BB....BB..",
    "..BB....BB..",
    ".BBB...BBB..",
    "............",
    "............",
    "............",
  ]},
  { name: "花", pixels: [
    "............",
    "...K...K....",
    "...KKKKK....",
    "..K.KyK.K...",
    "..K.KyK.K...",
    "...KKKKK....",
    "...K...K....",
    ".....G......",
    ".....G......",
    "....GG......",
    "...GGG......",
    "..gGGGg.....",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "松", pixels: [
    ".....f......",
    "....fff.....",
    "...fffff....",
    "..ffGffff...",
    "fffGGGGffff.",
    "....fff.....",
    "...fffff....",
    "..fffGfff...",
    "fffffffGGff.",
    "....fff.....",
    ".....B......",
    ".....B......",
    "....BBB.....",
    "............",
    "............",
    "............",
  ]},
  { name: "仙人掌", pixels: [
    "............",
    ".....G......",
    ".....G......",
    "..GG.G......",
    "..G..G......",
    "..G..GGGGG..",
    ".....G......",
    ".....G......",
    ".....G......",
    ".....G......",
    "....GGG.....",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "郁金香", pixels: [
    "............",
    ".....K......",
    "....KKK.....",
    "...KKKKK....",
    "..KKKKKKK...",
    "...KKKKK....",
    "....KKK.....",
    ".....G......",
    ".....G......",
    "....GgG.....",
    "...GgGgG....",
    "..GGGgGGG...",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "向日葵", pixels: [
    "............",
    "...y.y.y....",
    "....yyy.....",
    "..y.yYy.y...",
    "..y.YYY.y...",
    "...yYYYy....",
    "...y.y.y....",
    ".....G......",
    ".....G......",
    "....GG......",
    "...GGG......",
    "..gGGGg.....",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "苔藓球", pixels: [
    "............",
    "....fGff....",
    "..fGGGGGf...",
    ".fGGgGGGGf..",
    "fGGGGGGGGGf.",
    ".fGGGgGGGf..",
    "..fGGGGGf...",
    "...fGGGf....",
    "....fff.....",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "小树", pixels: [
    ".....g......",
    "....ggg.....",
    "...gGGgg....",
    "..ggGGGgg...",
    ".ggGGGGGgg..",
    "...gGGgg....",
    "....gGg.....",
    ".....B......",
    ".....B......",
    ".....B......",
    "....BBB.....",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "草丛", pixels: [
    "............",
    "..g..g..g...",
    "..g.ggg.g...",
    ".gg.gGg.gg..",
    "ggg.GGG.ggg.",
    ".ggGGGGGgg..",
    "..GGGGGGG...",
    "...GGGGG....",
    "....GGG.....",
    ".....G......",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
  { name: "浆果丛", pixels: [
    "............",
    "..R.G.R.G...",
    ".RgRGGRgR...",
    "gRgGGGGgRg..",
    "RgGGGGGGgR..",
    ".gGGGGGGg...",
    "..gGGGGg....",
    "...gGGg.....",
    "....BB......",
    "...BBBB.....",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
  ]},
];

// ---- State ----
let forestPlants  = [];
let forestCounter = 0;
let forestThresh  = 0;

function forestRandThresh() {
  return Math.floor(Math.random() * 51) + 50; // 50–100
}

function loadForest() {
  try {
    const raw = localStorage.getItem(FOREST_PLANTS_KEY);
    forestPlants = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(forestPlants)) forestPlants = [];
  } catch { forestPlants = []; }

  try {
    forestCounter = parseInt(localStorage.getItem(FOREST_COUNTER_KEY) || "0", 10);
    if (isNaN(forestCounter) || forestCounter < 0) forestCounter = 0;
  } catch { forestCounter = 0; }

  try {
    forestThresh = parseInt(localStorage.getItem(FOREST_THRESH_KEY) || "0", 10);
    if (!forestThresh || forestThresh < 50) forestThresh = forestRandThresh();
  } catch { forestThresh = forestRandThresh(); }
}

function saveForest() {
  localStorage.setItem(FOREST_PLANTS_KEY,  JSON.stringify(forestPlants));
  localStorage.setItem(FOREST_COUNTER_KEY, String(forestCounter));
  localStorage.setItem(FOREST_THRESH_KEY,  String(forestThresh));
}

// ---- Spawn ----
function spawnPlant() {
  const total = F_COLS * F_ROWS;
  if (forestPlants.length >= total) return;

  const occupied = new Set(forestPlants.map(p => p.row * F_COLS + p.col));
  const empty = [];
  for (let i = 0; i < total; i++) if (!occupied.has(i)) empty.push(i);
  if (!empty.length) return;

  const idx  = empty[Math.floor(Math.random() * empty.length)];
  const type = Math.floor(Math.random() * PLANT_TYPES.length);
  forestPlants.push({ col: idx % F_COLS, row: Math.floor(idx / F_COLS), type });
  saveForest();

  showForestNotif(PLANT_TYPES[type].name);
  if (currentView === "forest") renderForestCanvas();
  updateForestStatus();
}

function showForestNotif(plantName) {
  let el = document.getElementById("forestNotif");
  if (!el) {
    el = document.createElement("div");
    el.id = "forestNotif";
    el.className = "forest-notif";
    document.body.appendChild(el);
  }
  el.textContent = `🌿 一株${plantName}出现在了初始森林`;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function incrementForestCounter() {
  forestCounter++;
  if (forestCounter >= forestThresh) {
    forestCounter = 0;
    forestThresh  = forestRandThresh();
    spawnPlant();
  } else {
    saveForest();
    updateForestStatus();
  }
}

// ---- Status bar ----
function updateForestStatus() {
  const countEl = document.getElementById("forestPlantCount");
  const hintEl  = document.getElementById("forestNextHint");
  const barEl   = document.getElementById("forestBar");
  if (!countEl) return;

  const n = forestPlants.length;
  const total = F_COLS * F_ROWS;

  if (n >= total) {
    countEl.textContent = `${n} 株植物（满了）`;
    hintEl.textContent  = "初始森林已郁郁葱葱";
    if (barEl) barEl.style.width = "100%";
  } else {
    countEl.textContent = `${n} 株植物`;
    hintEl.textContent  = `还需 ${forestThresh - forestCounter} 张单词召唤下一株`;
    if (barEl) barEl.style.width = `${(forestCounter / forestThresh) * 100}%`;
  }
}

// ---- Canvas rendering ----
function drawPlantSprite(ctx, plant, x, y) {
  for (let row = 0; row < plant.pixels.length; row++) {
    const line = plant.pixels[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === ".") continue;
      const color = FOREST_PAL[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * F_PS, y + row * F_PS, F_PS, F_PS);
    }
  }
}

function renderForestCanvas() {
  const canvas = document.getElementById("forestCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cW = W / F_COLS, cH = H / F_ROWS;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#080e08");
  bg.addColorStop(1, "#0d1c0d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Fixed stars in upper portion
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  const starSeeds = [
    0.12, 0.87, 0.34, 0.65, 0.23, 0.91, 0.45, 0.78,
    0.56, 0.09, 0.38, 0.72, 0.19, 0.84, 0.61, 0.47,
    0.03, 0.29, 0.68, 0.55, 0.41, 0.96, 0.17, 0.73,
  ];
  for (let i = 0; i < starSeeds.length; i++) {
    const sx = ((starSeeds[i] * 397 + i * 113) % 1) * W;
    const sy = ((starSeeds[i] * 271 + i * 79)  % 1) * H * 0.42;
    ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
  }

  // Subtle depth tint per row (front rows slightly brighter)
  const tints = [0, 0.08, 0.14, 0.20];
  for (let r = 0; r < F_ROWS; r++) {
    const a = tints[r];
    ctx.fillStyle = `rgba(20,40,20,${a})`;
    ctx.fillRect(0, r * cH, W, cH);
  }

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let c = 1; c < F_COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * cW, 0); ctx.lineTo(c * cW, H); ctx.stroke();
  }
  for (let r = 1; r < F_ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * cH); ctx.lineTo(W, r * cH); ctx.stroke();
  }

  // Draw plants, back rows first
  const sorted = [...forestPlants].sort((a, b) => a.row - b.row);
  const spriteW = F_SW * F_PS, spriteH = F_SH * F_PS;
  for (const p of sorted) {
    const x = Math.round(p.col * cW + (cW - spriteW) / 2);
    const y = Math.round(p.row * cH + (cH - spriteH));
    drawPlantSprite(ctx, PLANT_TYPES[p.type], x, y);
  }

  updateForestStatus();
}

// ---- Init ----
loadForest();
updateForestStatus();

document.getElementById("viewForest").addEventListener("click", () => switchView("forest"));
nextBtn.addEventListener("click",    incrementForestCounter);
shuffleBtn.addEventListener("click", incrementForestCounter);
