// assets/js/app.js

class PointCounterApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async init() {
        try {
            // Инициализация модулей в правильном порядке
            this.modules.state = new StateManager();
            this.modules.ui = new UIController();
            this.modules.image = new ImageHandler();
            this.modules.points = new PointsManager();
            this.modules.history = new HistoryManager();

            // Инициализация модулей
            await this.modules.state.init();
            await this.modules.ui.init(this);
            await this.modules.image.init(this);
            await this.modules.points.init(this);
            await this.modules.history.init(this);

            // Восстановление состояния
            await this.restoreState();

            this.isInitialized = true;
            console.log('Point Counter App initialized');

        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async restoreState() {
        const state = this.modules.state.getState();

        if (state.image) {
            await this.modules.image.loadImageFromState(state.image);
        }

        if (state.points && state.points.length > 0) {
            this.modules.points.restorePoints(state.points);
        }

        if (state.settings) {
            this.modules.ui.applySettings(state.settings);
        }
    }

    // Основные методы для взаимодействия между модулями
    addPoint(x, y) {
        const point = this.modules.points.addPoint(x, y);
        this.modules.history.recordAction('add_point', { point });
        this.modules.state.saveState();
        this.updateUI();
    }

    removePoint(pointId) {
        const point = this.modules.points.removePoint(pointId);
        this.modules.history.recordAction('remove_point', { point });
        this.modules.state.saveState();
        this.updateUI();
    }

    movePoint(pointId, newX, newY) {
        const oldPosition = this.modules.points.movePoint(pointId, newX, newY);
        this.modules.history.recordAction('move_point', {
            pointId,
            oldPosition,
            newPosition: { x: newX, y: newY }
        });
        this.modules.state.saveState();
        this.updateUI();
    }

    updatePointSettings(settings) {
        this.modules.points.updateAllPointsAppearance(settings);
        this.modules.state.saveState();
    }

    updateUI() {
        const pointsCount = this.modules.points.getPointsCount();
        this.modules.ui.updatePointsCounter(pointsCount);

        const canUndo = this.modules.history.canUndo();
        const canRedo = this.modules.history.canRedo();
        this.modules.ui.updateHistoryButtons(canUndo, canRedo);
    }

    // Методы для работы с изображением
    async loadImage(file) {
        await this.modules.image.loadImage(file);
        this.modules.points.clearPoints();
        this.modules.history.clearHistory();
        this.modules.state.saveState();
        this.updateUI();
    }

    resetAll() {
        this.modules.image.resetImage();
        this.modules.points.clearPoints();
        this.modules.history.clearHistory();
        this.modules.state.saveState();
        this.updateUI();
    }

    saveImage() {
        this.modules.image.saveImageWithPoints(this.modules.points.getPoints());
    }

    // Методы для истории
    undo() {
        if (this.modules.history.canUndo()) {
            this.modules.history.undo();
            this.modules.state.saveState();
            this.updateUI();
        }
    }

    redo() {
        if (this.modules.history.canRedo()) {
            this.modules.history.redo();
            this.modules.state.saveState();
            this.updateUI();
        }
    }

    // Геттеры для доступа к модулям
    getImageHandler() {
        return this.modules.image;
    }

    getPointsManager() {
        return this.modules.points;
    }

    getStateManager() {
        return this.modules.state;
    }

    getHistoryManager() {
        return this.modules.history;
    }

    getUIController() {
        return this.modules.ui;
    }
}

// Глобальная инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', async () => {
    app = new PointCounterApp();
    await app.init();
});

// Экспорт для доступа из консоли (для отладки)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointCounterApp;
}