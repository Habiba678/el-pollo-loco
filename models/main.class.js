/**
 * Draws the menu and result screens on the canvas.
 */
class GameScreen {
    /**
     * Creates the screen renderer.
     */
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.playButtonArea = { x: 285, y: 412, width: 150, height: 52 };
        this.expandIconArea = { x: 0, y: 0, width: 42, height: 42 };
        this.audioIconArea = { x: 0, y: 0, width: 42, height: 42 };
    }

    /**
     * Saves the canvas and context.
     * @param {HTMLCanvasElement} canvas The game canvas.
     * @param {CanvasRenderingContext2D} ctx The canvas context.
     * @returns {void}
     */
    setCanvas(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.updateIconPositions();
    }

    /**
     * Updates the top-right icon positions.
     * @returns {void}
     */
    updateIconPositions() {
        if (!this.canvas) return;

        const topMargin = 26;
        const rightMargin = 26;
        const gap = 12;
        const size = 42;

        this.expandIconArea.x = this.canvas.width - rightMargin - size;
        this.expandIconArea.y = topMargin;

        this.audioIconArea.x = this.expandIconArea.x - gap - size;
        this.audioIconArea.y = topMargin;
    }

    /**
     * Handles canvas clicks.
     * @param {MouseEvent} event The click event.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {Object} callbacks The click callbacks.
     * @returns {void}
     */
    handleCanvasClick(event, state, callbacks) {
        const p = this.getCanvasClickPosition(event);

        if (this.canToggleAudio(state, p)) {
            callbacks.toggleMusic();
            return;
        }

        if (this.canToggleFullscreen(state, p)) {
            callbacks.toggleFullscreen();
            return;
        }

        if (this.canStartGame(state, p)) {
            callbacks.startGame();
        }
    }

    /**
     * Updates the mouse cursor on hover.
     * @param {MouseEvent} event The move event.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @returns {void}
     */
    handleCanvasMouseMove(event, state) {
        const p = this.getCanvasClickPosition(event);
        this.canvas.style.cursor = this.isHoveringInteractiveElement(p, state) ? 'pointer' : 'default';
    }

    /**
     * Resets the canvas cursor.
     * @returns {void}
     */
    resetCanvasCursor() {
        if (this.canvas) this.canvas.style.cursor = 'default';
    }

    /**
     * Checks if the audio icon can be clicked.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {{x:number,y:number}} p The pointer position.
     * @returns {boolean}
     */
    canToggleAudio(state, p) {
        return (state.gameOver || !state.gameStarted) &&
            this.isInsideRect(p, this.getHitArea(this.audioIconArea, 10, 10));
    }

    /**
     * Checks if the fullscreen icon can be clicked.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {{x:number,y:number}} p The pointer position.
     * @returns {boolean}
     */
    canToggleFullscreen(state, p) {
        return !state.gameStarted && !state.gameOver &&
            this.isInsideRect(p, this.getHitArea(this.expandIconArea, 10, 10));
    }

    /**
     * Checks if the start button can be clicked.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {{x:number,y:number}} p The pointer position.
     * @returns {boolean}
     */
    canStartGame(state, p) {
        return !state.gameStarted && !state.gameOver &&
            this.isInsideRect(p, this.getHitArea(this.playButtonArea, 14, 10));
    }

    /**
     * Checks if the pointer is over an active element.
     * @param {{x:number,y:number}} p The pointer position.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @returns {boolean}
     */
    isHoveringInteractiveElement(p, state) {
        return this.canStartGame(state, p) ||
            this.canToggleAudio(state, p) ||
            this.canToggleFullscreen(state, p);
    }

    /**
     * Converts mouse coordinates into canvas coordinates.
     * @param {MouseEvent} event The mouse event.
     * @returns {{x:number,y:number}}
     */
    getCanvasClickPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    /**
     * Expands a hit area for easier clicking.
     * @param {{x:number,y:number,width:number,height:number}} rect The base rectangle.
     * @param {number} paddingX Extra space on the x axis.
     * @param {number} paddingY Extra space on the y axis.
     * @returns {{x:number,y:number,width:number,height:number}}
     */
    getHitArea(rect, paddingX = 10, paddingY = 10) {
        return {
            x: rect.x - paddingX,
            y: rect.y - paddingY,
            width: rect.width + paddingX * 2,
            height: rect.height + paddingY * 2
        };
    }

    /**
     * Checks if a point is inside a rectangle.
     * @param {{x:number,y:number}} p The point.
     * @param {{x:number,y:number,width:number,height:number}} rect The rectangle.
     * @returns {boolean}
     */
    isInsideRect(p, rect) {
        return p.x >= rect.x &&
            p.x <= rect.x + rect.width &&
            p.y >= rect.y &&
            p.y <= rect.y + rect.height;
    }

    /**
     * Draws the start screen.
     * @param {boolean} musicMuted The current audio state.
     * @param {Function} [onLoaded] Optional callback after drawing.
     * @returns {void}
     */
    showStartScreen(musicMuted, onLoaded) {
        this.updateIconPositions();

        this.renderImageScreen('./assets/img/9_intro_outro_screens/start/startscreen_1.png', () => {
            this.drawStartButton();
            this.drawFullscreenIcon();
            this.drawSpeakerIcon(musicMuted);
            if (typeof onLoaded === 'function') onLoaded();
        });
    }

    /**
     * Draws a result screen.
     * @param {string} imageSrc The result image path.
     * @param {boolean} musicMuted The current audio state.
     * @param {Function} [onLoaded] Optional callback after drawing.
     * @returns {void}
     */
    showResultScreen(imageSrc, musicMuted, onLoaded) {
        this.updateIconPositions();

        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            const s = this.getResultImageSize(img);
            this.drawResultBackdrop();
            this.ctx.drawImage(img, s.x, s.y, s.width, s.height);
            this.drawSpeakerIcon(musicMuted);
            if (typeof onLoaded === 'function') onLoaded();
        };
    }

    /**
     * Calculates the size and position of the result image.
     * @param {HTMLImageElement} img The result image.
     * @returns {{x:number,y:number,width:number,height:number}}
     */
    getResultImageSize(img) {
        const scale = Math.min(
            (this.canvas.width * 0.78) / img.width,
            (this.canvas.height * 0.78) / img.height
        );

        const width = img.width * scale;
        const height = img.height * scale;

        return {
            width,
            height,
            x: (this.canvas.width - width) / 2,
            y: (this.canvas.height - height) / 2
        };
    }

    /**
     * Draws the dark backdrop for result screens.
     * @returns {void}
     */
    drawResultBackdrop() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Loads and draws one screen image.
     * @param {string} imageSrc The image path.
     * @param {Function} afterDraw The callback after drawing.
     * @returns {void}
     */
    renderImageScreen(imageSrc, afterDraw) {
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            afterDraw();
        };
    }

    /**
     * Draws the start button.
     * @returns {void}
     */
    drawStartButton() {
        const b = this.playButtonArea;

        this.ctx.fillStyle = 'rgba(198, 112, 104, 0.88)';
        this.drawRoundedRect(b.x, b.y, b.width, b.height, 8);

        this.ctx.fillStyle = '#fff8f2';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Start', b.x + b.width / 2, b.y + b.height / 2);
    }

    /**
     * Draws the speaker icon.
     * @param {boolean} musicMuted The current audio state.
     * @returns {void}
     */
    drawSpeakerIcon(musicMuted) {
        const { x, y, width, height } = this.audioIconArea;
        const centerY = y + height / 2;

        this.ctx.save();
        this.ctx.fillStyle = '#E0F2F7';
        this.drawRoundedRect(x, y, width, height, 6);
        this.drawSpeakerBody(x, centerY);
        musicMuted ? this.drawMutedSlash(x, y, width, height) : this.drawSoundWaves(x, width, centerY);
        this.ctx.restore();
    }

    /**
     * Draws the main speaker shape.
     * @param {number} x The left position.
     * @param {number} centerY The vertical center.
     * @returns {void}
     */
    drawSpeakerBody(x, centerY) {
        const left = x + 8;

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(left, centerY - 6, 7, 12);

        this.ctx.beginPath();
        this.ctx.moveTo(left + 7, centerY - 6);
        this.ctx.lineTo(left + 15, centerY - 10);
        this.ctx.lineTo(left + 15, centerY + 10);
        this.ctx.lineTo(left + 7, centerY + 6);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draws the mute slash.
     * @param {number} x The left position.
     * @param {number} y The top position.
     * @param {number} width The icon width.
     * @param {number} height The icon height.
     * @returns {void}
     */
    drawMutedSlash(x, y, width, height) {
        this.ctx.strokeStyle = '#d21f2b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 9, y + height - 9);
        this.ctx.lineTo(x + width - 9, y + 9);
        this.ctx.stroke();
    }

    /**
     * Draws the sound waves.
     * @param {number} x The left position.
     * @param {number} width The icon width.
     * @param {number} centerY The vertical center.
     * @returns {void}
     */
    drawSoundWaves(x, width, centerY) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(x + width - 12, centerY, 4, -0.7, 0.7);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(x + width - 10, centerY, 7, -0.7, 0.7);
        this.ctx.stroke();
    }

    /**
     * Redraws the speaker icon.
     * @param {boolean} musicMuted The current audio state.
     * @returns {void}
     */
    refreshSpeakerIcon(musicMuted) {
        if (this.ctx) this.drawSpeakerIcon(musicMuted);
    }

    /**
     * Draws the fullscreen icon.
     * @returns {void}
     */
    drawFullscreenIcon() {
        const { x, y, width, height } = this.expandIconArea;
        const p = 10;
        const l = 7;

        this.ctx.save();
        this.drawFullscreenIconBackground();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        this.drawCorner(x + p + l, y + p, x + p, y + p, x + p, y + p + l);
        this.drawCorner(x + width - p - l, y + p, x + width - p, y + p, x + width - p, y + p + l);
        this.drawCorner(x + p + l, y + height - p, x + p, y + height - p, x + p, y + height - p - l);
        this.drawCorner(x + width - p - l, y + height - p, x + width - p, y + height - p, x + width - p, y + height - p - l);

        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Draws one fullscreen corner.
     * @param {number} startX The start x position.
     * @param {number} startY The start y position.
     * @param {number} midX The middle x position.
     * @param {number} midY The middle y position.
     * @param {number} endX The end x position.
     * @param {number} endY The end y position.
     * @returns {void}
     */
    drawCorner(startX, startY, midX, midY, endX, endY) {
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(midX, midY);
        this.ctx.lineTo(endX, endY);
    }

    /**
     * Draws the fullscreen icon background.
     * @returns {void}
     */
    drawFullscreenIconBackground() {
        const { x, y, width, height } = this.expandIconArea;
        this.ctx.fillStyle = '#E0F2F7';
        this.drawRoundedRect(x, y, width, height, 6);
    }

    /**
     * Draws a rounded rectangle.
     * @param {number} x The left position.
     * @param {number} y The top position.
     * @param {number} width The rectangle width.
     * @param {number} height The rectangle height.
     * @param {number} radius The corner radius.
     * @returns {void}
     */
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