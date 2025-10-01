const upload = document.getElementById("upload");
const mainImage = document.getElementById("mainImage");
const pointsContainer = document.getElementById("points");
const counter = document.getElementById("counter");
const saveBtn = document.getElementById("saveBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

let points = [];
let history = [];
let historyIndex = -1;

// === Утилиты ===
function updateCounter() {
  counter.textContent = `Точек: ${points.length}`;
}

function renderPoints() {
  pointsContainer.innerHTML = "";
  points.forEach((p) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";
    pointEl.style.left = `${p.x}px`;
    pointEl.style.top = `${p.y}px`;
    pointEl.textContent = p.id;
    pointsContainer.appendChild(pointEl);
  });
  updateCounter();
}

function saveHistory() {
  history = history.slice(0, historyIndex + 1); // отрезаем "будущее"
  history.push(JSON.stringify(points));
  historyIndex++;
}

// === 1. Загрузка изображения ===
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    mainImage.src = event.target.result;
    points = [];
    history = [];
    historyIndex = -1;
    renderPoints();
  };
  reader.readAsDataURL(file);
});

// === 2. Установка точек ===
mainImage.addEventListener("click", (e) => {
  if (!mainImage.src) return;

  const rect = mainImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const id = points.length + 1;
  points.push({ id, x, y });

  saveHistory();
  renderPoints();
});

// === 3. Undo/Redo ===
undoBtn.addEventListener("click", () => {
  if (historyIndex > 0) {
    historyIndex--;
    points = JSON.parse(history[historyIndex]);
    renderPoints();
  }
});

redoBtn.addEventListener("click", () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    points = JSON.parse(history[historyIndex]);
    renderPoints();
  }
});

// === 4. Сохранение в PNG ===
saveBtn.addEventListener("click", () => {
  if (!mainImage.src) return;

  const canvas = document.createElement("canvas");
  canvas.width = mainImage.naturalWidth;
  canvas.height = mainImage.naturalHeight;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(mainImage, 0, 0);

  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(p.id, p.x, p.y);
  });

  const link = document.createElement("a");
  link.download = "result.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
