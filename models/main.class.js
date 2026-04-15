class GameScreen {
    /** Creates the screen renderer. */
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.playButtonArea = { x: 320, y: 415, width: 150, height: 50 };
        this.expandIconArea = { x: 0, y: 0, width: 42, height: 42 };
        this.audioIconArea = { x: 0, y: 0, width: 42, height: 42 };
    }

    /** @param {HTMLCanvasElement} canvas @param {CanvasRenderingContext2D} ctx */
    setCanvas(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.updateIconPositions();
    }

    /** Updates top-right icon positions. */
    updateIconPositions() {
        if (!this.canvas) return;
        this.expandIconArea.x = this.canvas.width - 60;
        this.expandIconArea.y = 18;
        this.audioIconArea.x = this.expandIconArea.x - 54;
        this.audioIconArea.y = 18;
    }

    /** @param {MouseEvent} event @param {{gameStarted:boolean,gameOver:boolean}} state @param {Object} callbacks */
    handleCanvasClick(event, state, callbacks) {
        const p = this.getCanvasClickPosition(event);
        if (this.canToggleAudio(state, p)) return callbacks.toggleMusic();
        if (this.canToggleFullscreen(state, p)) return callbacks.toggleFullscreen();
        if (this.canStartGame(state, p)) callbacks.startGame();
    }

    /** @param {MouseEvent} event @param {{gameStarted:boolean,gameOver:boolean}} state */
    handleCanvasMouseMove(event, state) {
        const p = this.getCanvasClickPosition(event);
        this.canvas.style.cursor = this.isHoveringInteractiveElement(p, state) ? 'pointer' : 'default';
    }

    /** Resets cursor style. */
    resetCanvasCursor() {
        if (this.canvas) this.canvas.style.cursor = 'default';
    }

    /** @param {{gameStarted:boolean,gameOver:boolean}} state @param {{x:number,y:number}} p @returns {boolean} */
    canToggleAudio(state, p) {
        return (state.gameOver || !state.gameStarted) && this.isInsideRect(p, this.audioIconArea);
    }

    /** @param {{gameStarted:boolean,gameOver:boolean}} state @param {{x:number,y:number}} p @returns {boolean} */
    canToggleFullscreen(state, p) {
        return !state.gameStarted && !state.gameOver && this.isInsideRect(p, this.expandIconArea);
    }

    /** @param {{gameStarted:boolean,gameOver:boolean}} state @param {{x:number,y:number}} p @returns {boolean} */
    canStartGame(state, p) {
        return !state.gameStarted && !state.gameOver && this.isInsideRect(p, this.playButtonArea);
    }

    /** @param {{x:number,y:number}} p @param {{gameStarted:boolean,gameOver:boolean}} state @returns {boolean} */
    isHoveringInteractiveElement(p, state) {
        return this.canStartGame(state, p) || this.canToggleAudio(state, p) || this.canToggleFullscreen(state, p);
    }

    /** @param {MouseEvent} event @returns {{x:number,y:number}} */
    getCanvasClickPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
    }

    /** @param {{x:number,y:number}} p @param {{x:number,y:number,width:number,height:number}} rect @returns {boolean} */
    isInsideRect(p, rect) {
        return p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height;
    }

    /** @param {boolean} musicMuted @param {Function} [onLoaded] */
    showStartScreen(musicMuted, onLoaded) {
        this.renderImageScreen('./assets/img/9_intro_outro_screens/start/startscreen_1.png', () => {
            this.drawStartButton();
            this.drawFullscreenIcon();
            this.drawSpeakerIcon(musicMuted);
            if (typeof onLoaded === 'function') onLoaded();
        });
    }

    /** @param {string} imageSrc @param {boolean} musicMuted @param {Function} [onLoaded] */
    showResultScreen(imageSrc, musicMuted, onLoaded) {
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

    /** @param {HTMLImageElement} img @returns {{x:number,y:number,width:number,height:number}} */
    getResultImageSize(img) {
        const scale = Math.min((this.canvas.width * 0.78) / img.width, (this.canvas.height * 0.78) / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        return { width, height, x: (this.canvas.width - width) / 2, y: (this.canvas.height - height) / 2 };
    }

    /** Draws result backdrop. */
    drawResultBackdrop() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /** @param {string} imageSrc @param {Function} afterDraw */
    renderImageScreen(imageSrc, afterDraw) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            afterDraw();
        };
    }

    /** Draws the start button. */
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

    /** @param {boolean} musicMuted */
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

    /** @param {number} x @param {number} centerY */
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

    /** @param {number} x @param {number} y @param {number} width @param {number} height */
    drawMutedSlash(x, y, width, height) {
        this.ctx.strokeStyle = '#d21f2b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 9, y + height - 9);
        this.ctx.lineTo(x + width - 9, y + 9);
        this.ctx.stroke();
    }

    /** @param {number} x @param {number} width @param {number} centerY */
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

    /** @param {boolean} musicMuted */
    refreshSpeakerIcon(musicMuted) {
        if (this.ctx) this.drawSpeakerIcon(musicMuted);
    }

    /** Draws fullscreen icon. */
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

    /** @param {number} startX @param {number} startY @param {number} midX @param {number} midY @param {number} endX @param {number} endY */
    drawCorner(startX, startY, midX, midY, endX, endY) {
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(midX, midY);
        this.ctx.lineTo(endX, endY);
    }

    /** Draws fullscreen icon background. */
    drawFullscreenIconBackground() {
        const { x, y, width, height } = this.expandIconArea;
        this.ctx.fillStyle = '#E0F2F7';
        this.drawRoundedRect(x, y, width, height, 6);
    }

    /** @param {number} x @param {number} y @param {number} width @param {number} height @param {number} radius */
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