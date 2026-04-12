/**
 * Controls menu screens and canvas overlays for the game.
 */
class GameScreen {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.fullscreenGraphic = null;

        this.playButtonArea = { x: 320, y: 415, width: 150, height: 50 };

        this.expandIconArea = { x: 0, y: 0, width: 42, height: 42 };
        this.audioIconArea = { x: 0, y: 0, width: 42, height: 42 };
    }

    setCanvas(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.updateIconPositions();
    }

    updateIconPositions() {
        if (!this.canvas) {
            return;
        }

        this.expandIconArea.x = this.canvas.width - this.expandIconArea.width - 18;
        this.expandIconArea.y = 36;
        this.audioIconArea.x = this.expandIconArea.x - this.audioIconArea.width - 12;
        this.audioIconArea.y = this.expandIconArea.y;
    }

    handleCanvasClick(event, state, callbacks) {
        const pointer = this.getCanvasClickPosition(event);

        if ((state.gameOver || (!state.gameStarted && !state.gameOver)) && this.isInsideRect(pointer, this.audioIconArea)) {
            callbacks.toggleMusic();
            return;
        }

        if (!state.gameStarted && !state.gameOver && this.isInsideRect(pointer, this.expandIconArea)) {
            callbacks.toggleFullscreen();
            return;
        }

        if (!state.gameStarted && !state.gameOver && this.isInsideRect(pointer, this.playButtonArea)) {
            callbacks.startGame();
        }
    }

    handleCanvasMouseMove(event, state) {
        const pointer = this.getCanvasClickPosition(event);
        const hoverActive = this.isHoveringInteractiveElement(pointer, state);
        this.canvas.style.cursor = hoverActive ? "pointer" : "default";
    }

    resetCanvasCursor() {
        if (!this.canvas) {
            return;
        }

        this.canvas.style.cursor = "default";
    }

    isHoveringInteractiveElement(position, state) {
        const startScene = !state.gameStarted && !state.gameOver;
        const resultScene = state.gameOver;

        if (startScene && this.isInsideRect(position, this.playButtonArea)) {
            return true;
        }

        if ((startScene || resultScene) && this.isInsideRect(position, this.audioIconArea)) {
            return true;
        }

        if (startScene && this.isInsideRect(position, this.expandIconArea)) {
            return true;
        }

        return false;
    }

    getCanvasClickPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    isInsideRect(position, rect) {
        return (
            position.x >= rect.x &&
            position.x <= rect.x + rect.width &&
            position.y >= rect.y &&
            position.y <= rect.y + rect.height
        );
    }

    showStartScreen(musicMuted, onLoaded) {
        this.renderImageScreen("./assets/img/9_intro_outro_screens/start/startscreen_1.png", () => {
            this.drawStartButton();
            this.drawFullscreenIcon();
            this.drawSpeakerIcon(musicMuted);

            if (typeof onLoaded === "function") {
                onLoaded();
            }
        });
    }

    showResultScreen(imageSrc, musicMuted, onLoaded) {
        const screenImage = new Image();
        screenImage.src = imageSrc;

        screenImage.onload = () => {
            this.ctx.save();
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            const targetWidth = this.canvas.width * 0.78;
            const targetHeight = this.canvas.height * 0.78;

            const scale = Math.min(
                targetWidth / screenImage.width,
                targetHeight / screenImage.height
            );

            const drawWidth = screenImage.width * scale;
            const drawHeight = screenImage.height * scale;

            const drawX = (this.canvas.width - drawWidth) / 2;
            const drawY = (this.canvas.height - drawHeight) / 2;

            this.ctx.drawImage(screenImage, drawX, drawY, drawWidth, drawHeight);

            if (typeof onLoaded === "function") {
                onLoaded();
            }
        };
    }

    renderImageScreen(imageSrc, afterDraw) {
        const screenImage = new Image();
        screenImage.src = imageSrc;

        screenImage.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(screenImage, 0, 0, this.canvas.width, this.canvas.height);
            afterDraw();
        };
    }

    drawStartButton() {
        this.ctx.fillStyle = "rgba(198, 112, 104, 0.88)";
        this.drawRoundedRect(
            this.playButtonArea.x,
            this.playButtonArea.y,
            this.playButtonArea.width,
            this.playButtonArea.height,
            8
        );

        this.ctx.fillStyle = "#fff8f2";
        this.ctx.font = "18px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
            "Start",
            this.playButtonArea.x + this.playButtonArea.width / 2,
            this.playButtonArea.y + this.playButtonArea.height / 2
        );
    }

    drawSpeakerIcon(musicMuted) {
        const { x, y, width, height } = this.audioIconArea;
        const centerY = y + height / 2;

        this.ctx.save();
        this.ctx.fillStyle = "#E0F2F7";
        this.drawRoundedRect(x, y, width, height, 6);
        this.drawSpeakerBody(x, centerY);
        this.drawSpeakerState(x, y, width, height, centerY, musicMuted);
        this.ctx.restore();
    }

    drawSpeakerBody(x, centerY) {
        const bodyLeft = x + 8;
        const bodyWidth = 7;
        const bodyHeight = 12;

        this.ctx.fillStyle = "#7c7b7b";
        this.ctx.fillRect(bodyLeft, centerY - bodyHeight / 2, bodyWidth, bodyHeight);

        this.ctx.beginPath();
        this.ctx.moveTo(bodyLeft + bodyWidth, centerY - 6);
        this.ctx.lineTo(bodyLeft + bodyWidth + 8, centerY - 10);
        this.ctx.lineTo(bodyLeft + bodyWidth + 8, centerY + 10);
        this.ctx.lineTo(bodyLeft + bodyWidth, centerY + 6);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpeakerState(x, y, width, height, centerY, musicMuted) {
        if (musicMuted) {
            this.drawMutedSlash(x, y, width, height);
            return;
        }

        this.drawSoundWaves(x, width, centerY);
    }

    drawMutedSlash(x, y, width, height) {
        this.ctx.strokeStyle = "#d21f2b";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 9, y + height - 9);
        this.ctx.lineTo(x + width - 9, y + 9);
        this.ctx.stroke();
    }

    drawSoundWaves(x, width, centerY) {
        this.ctx.strokeStyle = "#2222228c";
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(x + width - 12, centerY, 4, -0.7, 0.7);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(x + width - 10, centerY, 7, -0.7, 0.7);
        this.ctx.stroke();
    }

    refreshSpeakerIcon(musicMuted) {
        if (!this.ctx) {
            return;
        }

        this.drawSpeakerIcon(musicMuted);
    }

    drawFullscreenIcon() {
        const { x, y, width, height } = this.expandIconArea;
        const padding = 10;
        const lineLength = 7;

        this.ctx.save();
        this.drawFullscreenIconBackground();

        this.ctx.strokeStyle = "#7c7b7b";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        this.ctx.moveTo(x + padding + lineLength, y + padding);
        this.ctx.lineTo(x + padding, y + padding);
        this.ctx.lineTo(x + padding, y + padding + lineLength);

        this.ctx.moveTo(x + width - padding - lineLength, y + padding);
        this.ctx.lineTo(x + width - padding, y + padding);
        this.ctx.lineTo(x + width - padding, y + padding + lineLength);

        this.ctx.moveTo(x + padding + lineLength, y + height - padding);
        this.ctx.lineTo(x + padding, y + height - padding);
        this.ctx.lineTo(x + padding, y + height - padding - lineLength);

        this.ctx.moveTo(x + width - padding - lineLength, y + height - padding);
        this.ctx.lineTo(x + width - padding, y + height - padding);
        this.ctx.lineTo(x + width - padding, y + height - padding - lineLength);

        this.ctx.stroke();
        this.ctx.restore();
    }

    drawFullscreenIconBackground() {
        const { x, y, width, height } = this.expandIconArea;
        const radius = 6;

        this.ctx.fillStyle = "#E0F2F7";
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}