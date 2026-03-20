const CARDS = window.CARDS || [];
const FAV_KEY = "wordcards:favorites:v1";

let currentView = "card"; // card | list | fav | forest
let current = null;
let showBack = false;
let filtered = [];
let favFiltered = [];

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

const listEl = document.getElementById("list");
const favListEl = document.getElementById("favList");
const qEl = document.getElementById("q");
const countBadge = document.getElementById("countBadge");
const favCountBadge = document.getElementById("favCountBadge");
const cardEl = document.getElementById("card");
const cardInner = document.getElementById("cardInner");
const shuffleBtn = document.getElementById("shuffleBtn");
const nextBtn = document.getElementById("nextBtn");
const favBtn = document.getElementById("favBtn");
const viewCardBtn = document.getElementById("viewCard");
const viewListBtn = document.getElementById("viewList");
const viewFavBtn = document.getElementById("viewFav");
const cardView = document.getElementById("cardView");
const listView = document.getElementById("listView");
const favView = document.getElementById("favView");

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

function applyFilter() {
  const needle = qEl.value.trim().toLowerCase();

  if (!needle) {
    filtered = [...CARDS];
    favFiltered = CARDS.filter((c) => isFav(c));
    return;
  }

  const predicate = (c) =>
    includes(c.word, needle) ||
    includes(c.zh, needle) ||
    includes(c.en_note, needle) ||
    includes(c.zh_note, needle);

  filtered = CARDS.filter(predicate);
  favFiltered = CARDS.filter((c) => isFav(c) && predicate(c));
}

function renderViewTabs() {
  viewCardBtn.classList.toggle("is-active", currentView === "card");
  viewListBtn.classList.toggle("is-active", currentView === "list");
  viewFavBtn.classList.toggle("is-active", currentView === "fav");

  cardView.classList.toggle("is-active", currentView === "card");
  listView.classList.toggle("is-active", currentView === "list");
  favView.classList.toggle("is-active", currentView === "fav");

  // forest tab handled by forest.js
  const forestBtn = document.getElementById("viewForest");
  const forestView = document.getElementById("forestView");
  if (forestBtn) forestBtn.classList.toggle("is-active", currentView === "forest");
  if (forestView) forestView.classList.toggle("is-active", currentView === "forest");
  if (currentView === "forest" && typeof renderForestCanvas === "function") {
    setTimeout(renderForestCanvas, 0);
  }
}

function renderSingleList(targetEl, list) {
  targetEl.innerHTML = "";

  if (!list.length) {
    const div = document.createElement("div");
    div.className = "item";
    div.style.cursor = "default";
    div.innerHTML = '<div class="word">没有匹配结果</div><div class="note-zh" style="margin-top:6px;">换个关键词试试。</div>';
    targetEl.appendChild(div);
    return;
  }

  for (const c of list) {
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
      switchView("card");
    });

    targetEl.appendChild(item);
  }
}

function renderLists() {
  countBadge.textContent = filtered.length;
  favCountBadge.textContent = favFiltered.length;
  renderSingleList(listEl, filtered);
  renderSingleList(favListEl, favFiltered);
}

function renderFavBtn() {
  if (!current) {
    favBtn.textContent = "收藏";
    return;
  }
  favBtn.textContent = isFav(current) ? "已收藏" : "收藏";
}

function renderCard() {
  if (!current) {
    cardInner.innerHTML = '<div class="card-word">（空）</div><div class="card-sub">没有数据</div>';
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
          escapeHtml(current.en_note) || '<span style="opacity:.55;">（无英文注释）</span>'
        }</div>
        <div class="note-zh">${
          escapeHtml(current.zh_note) || '<span style="opacity:.55;">（无中文注释）</span>'
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
  const arr = fromList?.length ? fromList : filtered.length ? filtered : CARDS;
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function switchView(view) {
  currentView = view;
  renderViewTabs();
}

function refreshAll({ keepCurrent = true } = {}) {
  applyFilter();
  renderLists();

  if (keepCurrent && current) {
    if (isFav(current) || currentView !== "fav") {
      renderCard();
    } else {
      loadCard(randomCard(favFiltered));
    }
  } else {
    loadCard(randomCard(filtered));
  }
}

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
  refreshAll({ keepCurrent: true });
});

viewCardBtn.addEventListener("click", () => switchView("card"));
viewListBtn.addEventListener("click", () => switchView("list"));
viewFavBtn.addEventListener("click", () => switchView("fav"));

refreshAll({ keepCurrent: false });
switchView("card");
