const upload = document.getElementById("upload");
const mainImage = document.getElementById("mainImage");
const pointsContainer = document.getElementById("points");
const counter = document.getElementById("counter");
const saveBtn = document.getElementById("saveBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const resetBtn = document.getElementById("resetBtn");
const toggleNumbers = document.getElementById("toggleNumbers");
const pointSizeInput = document.getElementById("pointSize");
const pointOpacityInput = document.getElementById("pointOpacity");

let showNumbers = toggleNumbers.checked;
let pointSize = parseInt(pointSizeInput.value);
let pointOpacity = parseInt(pointOpacityInput.value) / 100;

let points = [];
let history = [];
let historyIndex = -1;

// === Обработчики чекбокса и ползунков ===
toggleNumbers.addEventListener("change", () => {
  showNumbers = toggleNumbers.checked;
  saveSettings();
  renderPoints();
});

pointSizeInput.addEventListener("input", () => {
  pointSize = parseInt(pointSizeInput.value);
  saveSettings();
  renderPoints();
});

pointOpacityInput.addEventListener("input", () => {
  pointOpacity = parseInt(pointOpacityInput.value) / 100;
  saveSettings();
  renderPoints();
});

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

    const x = p.relX * rect.width;
    const y = p.relY * rect.height;

    pointEl.style.left = `${x}px`;
    pointEl.style.top = `${y}px`;
    pointEl.style.width = `${pointSize}px`;
    pointEl.style.height = `${pointSize}px`;
    pointEl.style.opacity = pointOpacity;
    pointEl.textContent = showNumbers ? p.id : "";
    pointsContainer.appendChild(pointEl);
  });
  updateCounter();
}

function saveHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.stringify(points));
  historyIndex++;
  saveToLocalStorage();
}

function saveToLocalStorage() {
  if (mainImage.src.startsWith("data:image")) {
    localStorage.setItem("imageSrc", mainImage.src);
  }
  localStorage.setItem("points", JSON.stringify(points));
}

function saveSettings() {
  localStorage.setItem("showNumbers", showNumbers);
  localStorage.setItem("pointSize", pointSize);
  localStorage.setItem("pointOpacity", pointOpacity);
}

function loadFromLocalStorage() {
  const savedImage = localStorage.getItem("imageSrc");
  const savedPoints = localStorage.getItem("points");
  const savedShowNumbers = localStorage.getItem("showNumbers");
  const savedPointSize = localStorage.getItem("pointSize");
  const savedPointOpacity = localStorage.getItem("pointOpacity");

  if (savedImage) mainImage.src = savedImage;
  if (savedPoints) points = JSON.parse(savedPoints);
  if (savedShowNumbers !== null) {
    showNumbers = savedShowNumbers === "true";
    toggleNumbers.checked = showNumbers;
  }
  if (savedPointSize) {
    pointSize = parseInt(savedPointSize);
    pointSizeInput.value = pointSize;
  }
  if (savedPointOpacity) {
    pointOpacity = parseFloat(savedPointOpacity);
    pointOpacityInput.value = Math.round(pointOpacity * 100);
  }

  renderPoints();
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
    saveToLocalStorage();
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
    saveToLocalStorage();
  }
});

redoBtn.addEventListener("click", () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    points = JSON.parse(history[historyIndex]);
    renderPoints();
    saveToLocalStorage();
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

  points.forEach((p) => {
    const x = p.relX * mainImage.naturalWidth;
    const y = p.relY * mainImage.naturalHeight;
    const scale = mainImage.naturalWidth / mainImage.width;
    const radius = (pointSize / 2) * scale;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,0,0,${pointOpacity})`;
    ctx.fill();

    if (showNumbers) {
      ctx.fillStyle = "white";
      ctx.font = `${radius}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.id, x, y);
    }
  });

  const total = points.length;
  if (total > 0) {
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.strokeText(`Итого: ${total}`, canvas.width - 20, 20);
    ctx.fillStyle = "white";
    ctx.fillText(`Итого: ${total}`, canvas.width - 20, 20);
  }

  const link = document.createElement("a");
  link.download = `result_${total}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// === 5. Сброс ===
resetBtn.addEventListener("click", () => {
  localStorage.clear();
  points = [];
  history = [];
  historyIndex = -1;
  mainImage.src = "";
  pointsContainer.innerHTML = "";
  showNumbers = true;
  toggleNumbers.checked = true;
  pointSize = 20;
  pointOpacity = 1;
  pointSizeInput.value = pointSize;
  pointOpacityInput.value = 100;
  updateCounter();
});

// === При загрузке страницы восстанавливаем ===
window.addEventListener("load", loadFromLocalStorage);
