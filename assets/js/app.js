// app.js
import { initImageUpload } from "./image-handler.js";
import { initPoints, renderPoints } from "./points-manager.js";
import { initHistory, undo, redo, saveHistory } from "./history-manager.js";
import { saveToLocalStorage, saveSettings, loadFromLocalStorage } from "./state-manager.js";
import { initUIControls } from "./ui-controller.js";

// Глобальные переменные (как в оригинальном коде)
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

// Функции, которые используются в модулях
function updateCounter() {
  counter.textContent = `Точек: ${points.length}`;
}

// Обертки для функций
function renderPointsApp() {
  renderPoints(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter);
}

function saveToLocalStorageApp() {
  saveToLocalStorage(mainImage, points);
}

function saveSettingsApp() {
  saveSettings(showNumbers, pointSize, pointOpacity);
}

function saveHistoryApp() {
  const result = saveHistory(points, history, historyIndex, saveToLocalStorageApp);
  historyIndex = result.historyIndex;
  history = result.history;
}

function loadFromLocalStorageApp() {
  const saved = loadFromLocalStorage(
    mainImage,
    points,
    toggleNumbers,
    pointSizeInput,
    pointOpacityInput,
    renderPointsApp
  );

  if (saved) {
    showNumbers = saved.showNumbers;
    pointSize = saved.pointSize;
    pointOpacity = saved.pointOpacity;
  }
}

// Инициализация кнопок
function initButtons() {
  undoBtn.addEventListener("click", () => {
    const result = undo(points, history, historyIndex, renderPointsApp, saveToLocalStorageApp);
    historyIndex = result.historyIndex;
    points = result.points;
  });

  redoBtn.addEventListener("click", () => {
    const result = redo(points, history, historyIndex, renderPointsApp, saveToLocalStorageApp);
    historyIndex = result.historyIndex;
    points = result.points;
  });

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

  saveBtn.addEventListener("click", () => {
    if (!mainImage.src || !mainImage.complete) return;

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
        ctx.fillText(p.id.toString(), x, y);
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
}

// Инициализация всех модулей
function initApp() {
  // Загрузка из localStorage
  loadFromLocalStorageApp();

  // Инициализация UI контролов
  initUIControls(
    () => showNumbers,
    () => pointSize,
    () => pointOpacity,
    (newShowNumbers) => { showNumbers = newShowNumbers; },
    (newPointSize) => { pointSize = newPointSize; },
    (newPointOpacity) => { pointOpacity = newPointOpacity; },
    renderPointsApp,
    saveSettingsApp
  );

  // Инициализация загрузки изображений
  initImageUpload(
    () => points,
    () => history,
    () => historyIndex,
    (newPoints) => { points = newPoints; },
    (newHistory) => { history = newHistory; },
    (newHistoryIndex) => { historyIndex = newHistoryIndex; },
    renderPointsApp,
    saveToLocalStorageApp
  );

  // Инициализация точек
  initPoints(
    () => points,
    (newPoints) => { points = newPoints; },
    saveHistoryApp,
    renderPointsApp
  );

  // Инициализация истории
  initHistory(
    undoBtn,
    redoBtn,
    () => points,
    () => history,
    () => historyIndex,
    (newPoints) => { points = newPoints; },
    (newHistoryIndex) => { historyIndex = newHistoryIndex; },
    renderPointsApp,
    saveToLocalStorageApp
  );

  // Назначение обработчиков кнопок
  initButtons();
}

// Запуск приложения
initApp();