const upload = document.getElementById("upload");
const mainImage = document.getElementById("mainImage");
const pointsContainer = document.getElementById("points");
const counter = document.getElementById("counter");
const saveBtn = document.getElementById("saveBtn");

let points = [];

// === 1. Загрузка изображения ===
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    mainImage.src = event.target.result;
    points = [];
    pointsContainer.innerHTML = "";
    updateCounter();
  };
  reader.readAsDataURL(file);
});

// === 2. Установка точек ===
mainImage.addEventListener("click", (e) => {
  const rect = mainImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const id = points.length + 1;
  points.push({ id, x, y });

  const pointEl = document.createElement("div");
  pointEl.className = "point";
  pointEl.style.left = `${x}px`;
  pointEl.style.top = `${y}px`;
  pointEl.textContent = id;

  pointsContainer.appendChild(pointEl);
  updateCounter();
});

// === 3. Обновление счётчика ===
function updateCounter() {
  counter.textContent = `Точек: ${points.length}`;
}

// === 4. Сохранение в PNG ===
saveBtn.addEventListener("click", () => {
  if (!mainImage.src) return;

  const canvas = document.createElement("canvas");
  canvas.width = mainImage.naturalWidth;
  canvas.height = mainImage.naturalHeight;
  const ctx = canvas.getContext("2d");

  // Рисуем изображение
  ctx.drawImage(mainImage, 0, 0);

  // Рисуем точки
  ctx.fillStyle = "red";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(p.id, p.x, p.y);
    ctx.fillStyle = "red"; // вернуть обратно для следующей точки
  });

  // Скачивание
  const link = document.createElement("a");
  link.download = "result.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
