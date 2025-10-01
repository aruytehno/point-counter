// app.js
import { initImageUpload } from "./image-handler.js";
import { initPoints, renderPointsLayer } from "./points-manager.js";
import { saveHistory, undo, redo } from "./history-manager.js";
import { saveToLocalStorage, saveSettings, loadFromLocalStorage } from "./state-manager.js";
import { initUIControls } from "./ui-controller.js";

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

let points = [];
let history = [];
let historyIndex = -1;

function updateCounter() {
  counter.textContent = `Точек: ${points.length}`;
}

function renderPoints() {
  renderPointsLayer(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter);
}

function saveToLocalStorageWrapper() {
  saveToLocalStorage(mainImage, points);
}

function saveSettingsWrapper() {
  saveSettings(showNumbers, pointSize, pointOpacity);
}

// UI controls
let { showNumbers, pointSize, pointOpacity } = initUIControls(
  toggleNumbers,
  pointSizeInput,
  pointOpacityInput,
  renderPoints,
  saveSettingsWrapper
);

// Load from localStorage
({ showNumbers, pointSize, pointOpacity } = loadFromLocalStorage(
  mainImage,
  points,
  toggleNumbers,
  pointSizeInput,
  pointOpacityInput,
  renderPoints
));

// Init image upload
initImageUpload(
  upload,
  mainImage,
  points,
  history,
  historyIndex,
  renderPoints,
  saveToLocalStorageWrapper
);

// Init points
initPoints(
  mainImage,
  points,
  () => {
    historyIndex = saveHistory(points, history, historyIndex, saveToLocalStorageWrapper);
  },
  renderPoints
);

// Undo/Redo
undoBtn.addEventListener("click", () => {
  historyIndex = undo(
    points,
    history,
    historyIndex,
    renderPoints,
    saveToLocalStorageWrapper
  );
});

redoBtn.addEventListener("click", () => {
  historyIndex = redo(
    points,
    history,
    historyIndex,
    renderPoints,
    saveToLocalStorageWrapper
  );
});

// Reset
resetBtn.addEventListener("click", () => {
  localStorage.clear();
  points.length = 0;
  history.length = 0;
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

// Save PNG
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