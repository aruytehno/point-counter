// app.js
import { initImageUpload } from "./image-handler.js";
import { initPoints, renderPoints } from "./points-manager.js";
import { initHistory, undo, redo, saveHistory } from "./history-manager.js";
import { saveToLocalStorage, saveSettings, loadFromLocalStorage } from "./state-manager.js";
import { initUIControls } from "./ui-controller.js";
import { initZoomAndPan } from "./zoom-handler.js"; // 👈 добавлен импорт

// Глобальные переменные состояния
let state = {
  points: [],
  history: [],
  historyIndex: -1,
  showNumbers: true,
  pointSize: 20,
  pointOpacity: 1
};

// Получение элементов DOM
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

// Функции для работы с состоянием
function updateState(newState) {
  state = { ...state, ...newState };
  updateUI();
}

function updateUI() {
  updateCounter();
  renderPoints(
    pointsContainer,
    state.points,
    mainImage,
    state.pointSize,
    state.pointOpacity,
    state.showNumbers,
    updateCounter
  );
  updateHistoryButtons();
}

function updateCounter() {
  counter.textContent = state.points.length;
}

function updateHistoryButtons() {
  undoBtn.disabled = state.historyIndex <= 0;
  redoBtn.disabled = state.historyIndex >= state.history.length - 1;
}

// Обертки для функций
function saveToLocalStorageApp() {
  saveToLocalStorage(mainImage, state.points);
}

function saveSettingsApp() {
  saveSettings(state.showNumbers, state.pointSize, state.pointOpacity);
}

function saveHistoryApp() {
  const result = saveHistory(state.points, state.history, state.historyIndex, saveToLocalStorageApp);
  updateState({ history: result.history, historyIndex: result.historyIndex });
}

function loadFromLocalStorageApp() {
  const saved = loadFromLocalStorage(
    mainImage,
    state.points,
    toggleNumbers,
    pointSizeInput,
    pointOpacityInput,
    () => updateUI()
  );

  if (saved) {
    updateState({
      showNumbers: saved.showNumbers,
      pointSize: saved.pointSize,
      pointOpacity: saved.pointOpacity,
      history: saved.history || [],
      historyIndex: saved.historyIndex || -1
    });
  }
}

// Инициализация кнопок
function initButtons() {
  undoBtn.addEventListener("click", () => {
    const result = undo(state.points, state.history, state.historyIndex, () => updateUI(), saveToLocalStorageApp);
    updateState({ points: result.points, historyIndex: result.historyIndex });
  });

  redoBtn.addEventListener("click", () => {
    const result = redo(state.points, state.history, state.historyIndex, () => updateUI(), saveToLocalStorageApp);
    updateState({ points: result.points, historyIndex: result.historyIndex });
  });

  resetBtn.addEventListener("click", () => {
    localStorage.clear();
    updateState({
      points: [],
      history: [],
      historyIndex: -1,
      showNumbers: true,
      pointSize: 20,
      pointOpacity: 1
    });
    mainImage.src = "";
    pointsContainer.innerHTML = "";
    toggleNumbers.checked = true;
    pointSizeInput.value = 20;
    pointOpacityInput.value = 100;

    // Обновляем отображаемые значения
    const pointSizeValue = document.getElementById("pointSizeValue");
    const pointOpacityValue = document.getElementById("pointOpacityValue");
    if (pointSizeValue) pointSizeValue.textContent = "20";
    if (pointOpacityValue) pointOpacityValue.textContent = "100";

    updateUI();
  });

  saveBtn.addEventListener("click", () => {
    if (!mainImage.src || !mainImage.complete) return;

    const canvas = document.createElement("canvas");
    canvas.width = mainImage.naturalWidth;
    canvas.height = mainImage.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(mainImage, 0, 0);

    state.points.forEach((p) => {
      const x = p.relX * mainImage.naturalWidth;
      const y = p.relY * mainImage.naturalHeight;
      const scale = mainImage.naturalWidth / mainImage.width;
      const radius = (state.pointSize / 2) * scale;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,0,0,${state.pointOpacity})`;
      ctx.fill();

      if (state.showNumbers) {
        ctx.fillStyle = "white";
        ctx.font = `${radius}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.id.toString(), x, y);
      }
    });

    const total = state.points.length;
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

// Управление боковой панелью
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const mainContent = document.querySelector('.main-content');

  if (!sidebar || !sidebarToggle || !mainContent) {
    console.warn('Sidebar elements not found');
    return;
  }

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');

    // Обновляем иконку кнопки
    const icon = sidebarToggle.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.classList.remove('bi-list');
      icon.classList.add('bi-layout-sidebar');
    } else {
      icon.classList.remove('bi-layout-sidebar');
      icon.classList.add('bi-list');
    }
  });

  // Закрытие боковой панели при клике вне ее на мобильных устройствах
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target) &&
        !sidebar.classList.contains('collapsed')) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
      const icon = sidebarToggle.querySelector('i');
      icon.classList.remove('bi-list');
      icon.classList.add('bi-layout-sidebar');
    }
  });
}

// Инициализация всех модулей
function initApp() {
  // Загрузка из localStorage
  loadFromLocalStorageApp();

  // Инициализация UI контролов
  initUIControls(
    () => state.showNumbers,
    () => state.pointSize,
    () => state.pointOpacity,
    (newShowNumbers) => updateState({ showNumbers: newShowNumbers }),
    (newPointSize) => updateState({ pointSize: newPointSize }),
    (newPointOpacity) => updateState({ pointOpacity: newPointOpacity }),
    () => updateUI(),
    saveSettingsApp
  );

  // Инициализация загрузки изображений
  initImageUpload(
    () => state.points,
    () => state.history,
    () => state.historyIndex,
    (newPoints) => updateState({ points: newPoints }),
    (newHistory) => updateState({ history: newHistory }),
    (newHistoryIndex) => updateState({ historyIndex: newHistoryIndex }),
    () => updateUI(),
    saveToLocalStorageApp
  );

  // Инициализация точек
  initPoints(
    () => state.points,
    (newPoints) => updateState({ points: newPoints }),
    saveHistoryApp,
    () => updateUI()
  );

  // Инициализация истории
  initHistory(
    undoBtn,
    redoBtn,
    () => state.points,
    () => state.history,
    () => state.historyIndex,
    (newPoints) => updateState({ points: newPoints }),
    (newHistoryIndex) => updateState({ historyIndex: newHistoryIndex }),
    () => updateUI(),
    saveToLocalStorageApp
  );

  // Назначение обработчиков кнопок
  initButtons();

  // 👇 инициализация zoom/pan
  initZoomAndPan("image-container");

  // 👇 инициализация боковой панели
  initSidebar();

  // Первоначальное обновление UI
  updateUI();
}

// Запуск приложения
initApp();