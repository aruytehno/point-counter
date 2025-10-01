// assets/js/ui-controller.js

class UIController {
    constructor() {
        this.currentSettings = {
            color: '#ff0000',
            size: 5,
            opacity: 80,
            borderOpacity: 100,
            showNumbers: true
        };

        this.isPanelCollapsed = false;
    }

    init(app) {
        this.app = app;
        this._cacheElements();
        this._setupEventListeners();
        this._updateUI();
        return Promise.resolve();
    }

    _cacheElements() {
        // Панель управления
        this.controlPanel = document.getElementById('control-panel');
        this.togglePanelBtn = document.getElementById('toggle-panel');

        // Настройки точек
        this.pointColor = document.getElementById('point-color');
        this.pointSize = document.getElementById('point-size');
        this.pointOpacity = document.getElementById('point-opacity');
        this.pointBorderOpacity = document.getElementById('point-border-opacity');
        this.showNumbers = document.getElementById('show-numbers');

        // Значения настроек
        this.sizeValue = document.getElementById('size-value');
        this.opacityValue = document.getElementById('opacity-value');
        this.borderOpacityValue = document.getElementById('border-opacity-value');

        // Управление изображением
        this.imageUpload = document.getElementById('image-upload');
        this.imageInfo = document.getElementById('image-info');
        this.saveImageBtn = document.getElementById('save-image');
        this.resetAllBtn = document.getElementById('reset-all');
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');

        // Счетчик
        this.pointsCounter = document.getElementById('points-counter');
    }

    _setupEventListeners() {
        // Переключение панели
        this.togglePanelBtn.addEventListener('click', () => this.togglePanel());

        // Настройки точек
        this.pointColor.addEventListener('input', (e) => this._onColorChange(e.target.value));
        this.pointSize.addEventListener('input', (e) => this._onSizeChange(parseInt(e.target.value)));
        this.pointOpacity.addEventListener('input', (e) => this._onOpacityChange(parseInt(e.target.value)));
        this.pointBorderOpacity.addEventListener('input', (e) => this._onBorderOpacityChange(parseInt(e.target.value)));
        this.showNumbers.addEventListener('change', (e) => this._onShowNumbersChange(e.target.checked));

        // Управление изображением
        this.imageUpload.addEventListener('change', (e) => this._onImageUpload(e.target.files[0]));
        this.saveImageBtn.addEventListener('click', () => this.app.saveImage());
        this.resetAllBtn.addEventListener('click', () => this.app.resetAll());
        this.undoBtn.addEventListener('click', () => this.app.undo());
        this.redoBtn.addEventListener('click', () => this.app.redo());

        // Подсказки для кнопок
        this._setupTooltips();
    }

    _setupTooltips() {
        // Подсказка для кнопки сброса
        this.resetAllBtn.setAttribute('title', 'Сбросить изображение и точки');
        this.resetAllBtn.setAttribute('data-bs-toggle', 'tooltip');

        // Инициализация tooltips Bootstrap
        if (typeof bootstrap !== 'undefined') {
            new bootstrap.Tooltip(this.resetAllBtn);
        }
    }

    // Управление панелью
    togglePanel() {
        this.isPanelCollapsed = !this.isPanelCollapsed;
        this.controlPanel.classList.toggle('collapsed', this.isPanelCollapsed);

        // Обновляем иконку кнопки
        const icon = this.togglePanelBtn.querySelector('i');
        if (this.isPanelCollapsed) {
            icon.classList.remove('bi-chevron-left');
            icon.classList.add('bi-chevron-right');
        } else {
            icon.classList.remove('bi-chevron-right');
            icon.classList.add('bi-chevron-left');
        }
    }

    // Обработчики настроек
    _onColorChange(color) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings.color = color;
        this._notifySettingsChange(oldSettings, this.currentSettings);
    }

    _onSizeChange(size) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings.size = size;
        this.sizeValue.textContent = size;
        this._notifySettingsChange(oldSettings, this.currentSettings);
    }

    _onOpacityChange(opacity) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings.opacity = opacity;
        this.opacityValue.textContent = opacity;
        this._notifySettingsChange(oldSettings, this.currentSettings);
    }

    _onBorderOpacityChange(borderOpacity) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings.borderOpacity = borderOpacity;
        this.borderOpacityValue.textContent = borderOpacity;
        this._notifySettingsChange(oldSettings, this.currentSettings);
    }

    _onShowNumbersChange(showNumbers) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings.showNumbers = showNumbers;
        this._notifySettingsChange(oldSettings, this.currentSettings);
    }

    _notifySettingsChange(oldSettings, newSettings) {
        this.app.getHistoryManager().recordSettingsChange(oldSettings, newSettings);
        this.app.updatePointSettings(newSettings);
    }

    // Управление изображением
    async _onImageUpload(file) {
        if (!file) return;

        try {
            await this.app.loadImage(file);
        } catch (error) {
            this._showError('Ошибка загрузки изображения: ' + error.message);
        }
    }

    _showError(message) {
        // Простой вывод ошибки (можно заменить на модальное окно Bootstrap)
        alert(message);
    }

    // Обновление UI
    updatePointsCounter(count) {
        this.pointsCounter.textContent = count;
    }

    updateHistoryButtons(canUndo, canRedo) {
        this.undoBtn.disabled = !canUndo;
        this.redoBtn.disabled = !canRedo;
    }

    updateImageInfo(info) {
        this.imageInfo.textContent = info;
    }

    _updateUI() {
        // Применяем текущие настройки к элементам управления
        this.pointColor.value = this.currentSettings.color;
        this.pointSize.value = this.currentSettings.size;
        this.pointOpacity.value = this.currentSettings.opacity;
        this.pointBorderOpacity.value = this.currentSettings.borderOpacity;
        this.showNumbers.checked = this.currentSettings.showNumbers;

        // Обновляем значения
        this.sizeValue.textContent = this.currentSettings.size;
        this.opacityValue.textContent = this.currentSettings.opacity;
        this.borderOpacityValue.textContent = this.currentSettings.borderOpacity;
    }

    // Применение настроек (для истории и восстановления состояния)
    applySettings(settings, recordHistory = true) {
        const oldSettings = { ...this.currentSettings };
        this.currentSettings = { ...settings };

        this._updateUI();

        if (recordHistory) {
            this._notifySettingsChange(oldSettings, this.currentSettings);
        } else {
            this.app.updatePointSettings(this.currentSettings);
        }
    }

    getCurrentSettings() {
        return { ...this.currentSettings };
    }

    // Методы для адаптивности
    handleResize() {
        // При необходимости можно добавить логику обработки изменения размера
        if (window.innerWidth < 768 && !this.isPanelCollapsed) {
            this.togglePanel();
        }
    }

    // Публичные методы для внешнего доступа
    showLoading(message = 'Загрузка...') {
        // Простая реализация индикатора загрузки
        const originalText = this.saveImageBtn.innerHTML;
        this.saveImageBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> ' + message;
        this.saveImageBtn.disabled = true;

        return () => {
            this.saveImageBtn.innerHTML = originalText;
            this.saveImageBtn.disabled = false;
        };
    }

    // Обновление информации об изображении
    updateImageMetadata(name, size) {
        const sizeInKB = Math.round(size / 1024);
        this.imageInfo.textContent = `${name} (${sizeInKB} KB)`;
    }

    resetImageInfo() {
        this.imageInfo.textContent = 'Изображение не загружено';
    }
}