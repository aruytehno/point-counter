// Состояние приложения
let state = {
  imageUrl: null, // Data URL загруженного изображения
  points: []      // Массив точек: { id, x, y } (координаты в долях от 0 до 1)
};

// Элементы DOM
const fileInput = document.getElementById('file-input');
const loadButton = document.getElementById('load-btn');
const imageContainer = document.getElementById('image-container');
const mainImage = document.getElementById('main-image');
const pointsLayer = document.getElementById('points-layer');
const counterElement = document.getElementById('counter');
const saveButton = document.getElementById('save-btn');
const resetButton = document.getElementById('reset-btn');
const welcomeMessage = document.getElementById('welcome-message');
const welcomeLoadButton = document.getElementById('welcome-load-btn');

// 1. Загрузка изображения
loadButton.addEventListener('click', () => fileInput.click());
welcomeLoadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleImageUpload);

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    state.imageUrl = event.target.result;
    state.points = [];
    mainImage.src = state.imageUrl;
    mainImage.classList.add('loaded'); // Добавляем класс для отображения
    welcomeMessage.classList.add('hidden'); // Скрываем welcome-сообщение
    saveState(); // Сохраняем в localStorage
    renderPoints(); // Очищаем точки
    updateCounter();
  };
  reader.readAsDataURL(file);
}

// 2. Обработка кликов для точек
// Вешаем обработчик на контейнер изображения, а не на слой точек
imageContainer.addEventListener('click', handleAddPoint);

function handleAddPoint(e) {
  // Проверяем, что кликнули именно по области изображения, а не по точкам
  if (e.target.classList.contains('point')) {
    return; // Если кликнули по существующей точке - выходим
  }

  if (!state.imageUrl || !mainImage.classList.contains('loaded')) return;

  // Получаем размеры и позицию изображения на странице
  const rect = mainImage.getBoundingClientRect();

  // Проверяем, что клик был внутри изображения
  if (e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom) {
    return;
  }

  // Вычисляем координаты клика ОТНОСИТЕЛЬНО ИЗОБРАЖЕНИЯ (в долях)
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  // Создаем новую точку
  const newPoint = {
    id: Date.now(), // Простой уникальный ID
    x: x,
    y: y
  };

  state.points.push(newPoint);
  saveState();
  renderPoints();
  updateCounter();
}

// Отрисовка всех точек
function renderPoints() {
  // Очищаем слой
  pointsLayer.innerHTML = '';

  state.points.forEach((point, index) => {
    const pointElement = document.createElement('div');
    pointElement.className = 'point';
    pointElement.textContent = index + 1; // Нумерация с 1
    pointElement.dataset.id = point.id; // Сохраняем ID для будущего использования

    // Позиционируем точку в процентах относительно image-container
    pointElement.style.left = `${point.x * 100}%`;
    pointElement.style.top = `${point.y * 100}%`;

    pointsLayer.appendChild(pointElement);
  });
}

// Обновление счетчика
function updateCounter() {
  counterElement.textContent = `Точек: ${state.points.length}`;
}

// 3. Сохранение состояния в localStorage
function saveState() {
  localStorage.setItem('pointCounterState', JSON.stringify(state));
}

// Загрузка состояния из localStorage при загрузке страницы
function loadState() {
  const saved = localStorage.getItem('pointCounterState');
  if (saved) {
    state = JSON.parse(saved);
    if (state.imageUrl) {
      mainImage.src = state.imageUrl;
      mainImage.classList.add('loaded');
      welcomeMessage.classList.add('hidden');
      // Ждем, пока изображение загрузится, прежде чем рисовать точки
      mainImage.onload = () => {
        renderPoints();
        updateCounter();
      };
    }
  }
}

// 4. Сброс состояния
resetButton.addEventListener('click', () => {
  if (confirm('Удалить изображение и все точки?')) {
    state = { imageUrl: null, points: [] };
    mainImage.src = '';
    mainImage.classList.remove('loaded');
    welcomeMessage.classList.remove('hidden');
    saveState();
    renderPoints();
    updateCounter();
  }
});

// 5. Сохранение результата (используем html2canvas для простоты)
saveButton.addEventListener('click', () => {
  if (!state.imageUrl) {
    alert('Сначала загрузите изображение!');
    return;
  }
  // "Фотографируем" контейнер с изображением и точками
  html2canvas(imageContainer).then(canvas => {
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = 'counted-image.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Инициализация: загружаем состояние при запуске
loadState();