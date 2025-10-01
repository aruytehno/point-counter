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
  const rect = mainImage.getBoundingClientRect();
  points.forEach((p) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";

    // преобразуем относительные координаты в экранные
    const x = p.relX * rect.width;
    const y = p.relY * rect.height;

    pointEl.style.left = `${x}px`;
    pointEl.style.top = `${y}px`;
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
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;

  const id = points.length + 1;
  points.push({ id, relX, relY });

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

  // Рисуем картинку
  ctx.drawImage(mainImage, 0, 0);

  // Настройки текста для точек
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Рисуем точки
  points.forEach((p) => {
    const x = p.relX * mainImage.naturalWidth;
    const y = p.relY * mainImage.naturalHeight;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(p.id, x, y);
  });

  // === Итоговое количество точек в правом верхнем углу ===
  const total = points.length;
  if (total > 0) {
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    // обводка для читаемости
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.strokeText(`Итого: ${total}`, canvas.width - 20, 20);

    ctx.fillStyle = "white";
    ctx.fillText(`Итого: ${total}`, canvas.width - 20, 20);
  }

  // === Скачивание с числом в названии ===
  const link = document.createElement("a");
  link.download = `result_${total}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

