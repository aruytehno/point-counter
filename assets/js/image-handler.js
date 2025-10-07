// image-handler.js
export function initImageUpload(getPoints, getHistory, getHistoryIndex, setPoints, setHistory, setHistoryIndex, renderPoints, saveToLocalStorage) {
  const upload = document.getElementById("upload");
  const mainImage = document.getElementById("mainImage");

  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      mainImage.src = event.target.result;

      // Очищаем данные через сеттеры
      setPoints([]);
      setHistory([]);
      setHistoryIndex(-1);

      renderPoints();
      saveToLocalStorage();
    };
    reader.readAsDataURL(file);
  });
}