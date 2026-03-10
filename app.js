// === 你的 CARDS 数据放这里（如果你是脚本生成的，就保留脚本生成的 CARDS） ===
/* 示例：
const CARDS = [
  { word:"arbitrage", zh:"套利", en_note:"...", zh_note:"..." }
];
*/

let mode = "all"; // "all" | "fav"
const CARDS = window.CARDS || [];
// --- 收藏：localStorage ---
const FAV_KEY = "wordcards:favorites:v1";
function loadFavSet() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function saveFavSet(set) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}
let favSet = loadFavSet();

function keyOfCard(c) {
  // 用 word 当唯一键（你如果有重复 word，就换成 word + en_note 的组合）
  return (c?.word ?? "").toString();
}
function isFav(c) {
  return favSet.has(keyOfCard(c));
}
function toggleFav(c) {
  if (!c) return;
  const k = keyOfCard(c);
  if (!k) return;
  if (favSet.has(k)) favSet.delete(k);
  else favSet.add(k);
  saveFavSet(favSet);
}

// --- DOM ---
const listEl = document.getElementById("list");
const qEl = document.getElementById("q");
const countBadge = document.getElementById("countBadge");
const cardEl = document.getElementById("card");
const cardInner = document.getElementById("cardInner");
const shuffleBtn = document.getElementById("shuffleBtn");
const nextBtn = document.getElementById("nextBtn");
const favBtn = document.getElementById("favBtn");
const tabAll = document.getElementById("tabAll");
const tabFav = document.getElementById("tabFav");

// --- 状态 ---
let filtered = [];
let current = null;
let showBack = false;

// --- 工具 ---
const safe = (s) => (s ?? "").toString();
const includes = (hay, needle) => safe(hay).toLowerCase().includes(needle);

function escapeHtml(str) {
  return safe(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseList() {
  if (mode === "all") return CARDS;
  // 收藏列表：从 CARDS 里筛选出收藏的
  return CARDS.filter((c) => favSet.has(keyOfCard(c)));
}

function applyFilter() {
  const needle = qEl.value.trim().toLowerCase();
  const base = baseList();

  if (!needle) {
    filtered = [...base];
  } else {
    filtered = base.filter(
      (c) =>
        includes(c.word, needle) ||
        includes(c.zh, needle) ||
        includes(c.en_note, needle) ||
        includes(c.zh_note, needle)
    );
  }
}

function renderTabs() {
  if (!tabAll || !tabFav) return;
  tabAll.classList.toggle("is-active", mode === "all");
  tabFav.classList.toggle("is-active", mode === "fav");
}

function renderList() {
  listEl.innerHTML = "";
  countBadge.textContent = filtered.length;

  if (!filtered.length) {
    const div = document.createElement("div");
    div.className = "item";
    div.style.cursor = "default";
    div.innerHTML =
      '<div class="word">没有匹配结果</div><div class="note-zh" style="margin-top:6px;">换个关键词试试。</div>';
    listEl.appendChild(div);
    return;
  }

  for (const c of filtered) {
    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="row1">
        <div class="word">${escapeHtml(c.word)}</div>
        <div class="zh">${escapeHtml(c.zh)}</div>
      </div>
      <div class="notes">
        <div class="note-en">${escapeHtml(c.en_note)}</div>
        <div class="note-zh">${escapeHtml(c.zh_note)}</div>
      </div>
    `;

    item.addEventListener("click", () => {
      loadCard(c);
    });

    listEl.appendChild(item);
  }
}

function renderFavBtn() {
  if (!favBtn) return;
  if (!current) {
    favBtn.textContent = "收藏";
    return;
  }
  favBtn.textContent = isFav(current) ? "已收藏" : "收藏";
}

function renderCard() {
  if (!current) {
    cardInner.innerHTML =
      '<div class="card-word">（空）</div><div class="card-sub">没有数据</div>';
    renderFavBtn();
    return;
  }

  if (!showBack) {
    cardInner.innerHTML = `
      <div class="card-word">${escapeHtml(current.word)}</div>
      <div class="card-sub">点击显示注释</div>
    `;
  } else {
    cardInner.innerHTML = `
      <div class="card-notes">
        <div class="wordline">
          <div class="w">${escapeHtml(current.word)}</div>
          <div class="z">${escapeHtml(current.zh)}</div>
        </div>
        <div class="note-en">${
          escapeHtml(current.en_note) ||
          '<span style="opacity:.55;">（无英文注释）</span>'
        }</div>
        <div class="note-zh">${
          escapeHtml(current.zh_note) ||
          '<span style="opacity:.55;">（无中文注释）</span>'
        }</div>
      </div>
    `;
  }

  renderFavBtn();
}

function loadCard(c) {
  current = c;
  showBack = false;
  renderCard();
}

function randomCard(fromList) {
  const arr = fromList?.length ? fromList : baseList();
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- 刷新整套 UI（切换列表、收藏变动后用）---
function refreshAll({ keepCurrent = true } = {}) {
  renderTabs();
  applyFilter();
  renderList();

  if (keepCurrent && current) {
    // 如果当前卡在收藏模式下被取消收藏，需要处理
    if (mode === "fav" && !isFav(current)) {
      // 当前不在收藏里了，换一张
      loadCard(randomCard(filtered));
    } else {
      renderCard();
    }
  } else {
    loadCard(randomCard(filtered));
  }
}

// --- 事件 ---
qEl.addEventListener("input", () => refreshAll({ keepCurrent: true }));

cardEl.addEventListener("click", () => {
  if (!current) return;
  showBack = !showBack;
  renderCard();
});

shuffleBtn.addEventListener("click", () => {
  loadCard(randomCard(filtered));
});

nextBtn.addEventListener("click", () => {
  loadCard(randomCard(filtered));
});

favBtn.addEventListener("click", () => {
  if (!current) return;
  toggleFav(current);
  renderFavBtn();

  // 如果在“收藏列表”里点取消收藏，要立刻从列表里消失
  if (mode === "fav") {
    refreshAll({ keepCurrent: true });
  }
});

tabAll.addEventListener("click", () => {
  mode = "all";
  refreshAll({ keepCurrent: true });
});

tabFav.addEventListener("click", () => {
  mode = "fav";
  refreshAll({ keepCurrent: true });
});

// init
refreshAll({ keepCurrent: false });