// assets/js/history-manager.js

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
    }

    init(app) {
        this.app = app;
        this.history = [];
        this.currentIndex = -1;
        return Promise.resolve();
    }

    recordAction(type, data) {
        // Удаляем все действия после текущего индекса (если мы не в конце истории)
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        const action = {
            type,
            data,
            timestamp: Date.now(),
            snapshot: this._createSnapshot()
        };

        this.history.push(action);
        this.currentIndex = this.history.length - 1;

        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    _createSnapshot() {
        return {
            points: this.app.getPointsManager().getPoints().map(point => ({
                ...point,
                element: null // Исключаем DOM-элемент из снапшота
            }))
        };
    }

    canUndo() {
        return this.currentIndex >= 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    undo() {
        if (!this.canUndo()) return false;

        const currentAction = this.history[this.currentIndex];
        this._revertAction(currentAction);
        this.currentIndex--;

        // Восстанавливаем состояние из предыдущего снапшота
        if (this.currentIndex >= 0) {
            this._restoreFromSnapshot(this.history[this.currentIndex].snapshot);
        } else {
            // Если откатились до начала, очищаем точки
            this.app.getPointsManager().clearPoints();
        }

        return true;
    }

    redo() {
        if (!this.canRedo()) return false;

        this.currentIndex++;
        const nextAction = this.history[this.currentIndex];
        this._applyAction(nextAction);

        return true;
    }

    _revertAction(action) {
        switch (action.type) {
            case 'add_point':
                this.app.getPointsManager().removePoint(action.data.point.id, false);
                break;

            case 'remove_point':
                this.app.getPointsManager().restorePoint(action.data.point, false);
                break;

            case 'move_point':
                this.app.getPointsManager().movePoint(
                    action.data.pointId,
                    action.data.oldPosition.x,
                    action.data.oldPosition.y,
                    false
                );
                break;

            case 'settings_change':
                this.app.getUIController().applySettings(action.data.oldSettings, false);
                break;
        }
    }

    _applyAction(action) {
        switch (action.type) {
            case 'add_point':
                this.app.getPointsManager().restorePoint(action.data.point, false);
                break;

            case 'remove_point':
                this.app.getPointsManager().removePoint(action.data.point.id, false);
                break;

            case 'move_point':
                this.app.getPointsManager().movePoint(
                    action.data.pointId,
                    action.data.newPosition.x,
                    action.data.newPosition.y,
                    false
                );
                break;

            case 'settings_change':
                this.app.getUIController().applySettings(action.data.newSettings, false);
                break;
        }
    }

    _restoreFromSnapshot(snapshot) {
        this.app.getPointsManager().restorePoints(snapshot.points, false);
    }

    recordSettingsChange(oldSettings, newSettings) {
        this.recordAction('settings_change', { oldSettings, newSettings });
    }

    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
    }

    getHistoryInfo() {
        return {
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            currentIndex: this.currentIndex,
            totalActions: this.history.length
        };
    }
}