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
        this.playButtonArea = { x: 285, y: 415, width: 150, height: 50 };
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
        this.updateStartButtonPosition();
    }

    /**
     * Keeps the start button centered.
     * @returns {void}
     */
    updateStartButtonPosition() {
        if (!this.canvas) return;
        this.playButtonArea.x = (this.canvas.width - this.playButtonArea.width) / 2;
    }

    /**
     * Keeps compatibility with resize handling.
     * @returns {void}
     */
    updateIconPositions() {
        this.updateStartButtonPosition();
    }

    /**
     * Handles canvas clicks.
     * @param {MouseEvent} event The click event.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {{startGame:Function}} callbacks Click callbacks.
     * @returns {void}
     */
    handleCanvasClick(event, state, callbacks) {
        return;
    }

    /**
     * Updates the cursor on hover.
     * @param {MouseEvent} event The move event.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @returns {void}
     */
    handleCanvasMouseMove(event, state) {
        this.canvas.style.cursor = 'default';
    }

    /**
     * Resets the cursor.
     * @returns {void}
     */
    resetCanvasCursor() {
        if (this.canvas) this.canvas.style.cursor = 'default';
    }

    /**
     * Checks if the start button is active.
     * @param {{gameStarted:boolean,gameOver:boolean}} state The current game state.
     * @param {{x:number,y:number}} p The pointer position.
     * @returns {boolean}
     */
    canStartGame(state, p) {
        return false;
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
        this.updateStartButtonPosition();

        this.renderImageScreen('./assets/img/9_intro_outro_screens/start/startscreen_1.png', () => {
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
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            const s = this.getResultImageSize(img);
            this.drawResultBackdrop();
            this.ctx.drawImage(img, s.x, s.y, s.width, s.height);
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
        return;
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