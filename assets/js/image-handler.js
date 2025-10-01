 // image-handler.js
export function initImageUpload(upload, mainImage, points, history, historyIndex, renderPoints, saveToLocalStorage) {
  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      mainImage.src = event.target.result;
      points.length = 0;
      history.length = 0;
      historyIndex = -1;
      renderPoints();
      saveToLocalStorage();
    };
    reader.readAsDataURL(file);
  });
}
