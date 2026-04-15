/**
 * Controls touch input and screen rotation on mobile devices.
 */
class MobilScreen {
    /**
     * Saves the keyboard state and reset function.
     *
     * @param {Keyboard} keyboard Shared keyboard state.
     * @param {Function} onResetKeyboard Resets active inputs.
     */
    constructor(keyboard, onResetKeyboard) {
        this.inputState = keyboard;
        this.resetInputState = onResetKeyboard;
    }
  
    /**
     * Starts the mobile setup.
     *
     * @returns {void}
     */
    init() {
        const touchMode = this.isTouchDevice();
        document.body.classList.toggle("touch-device", touchMode);
  
        if (!touchMode) {
            return;
        }
  
        this.connectControlButtons();
        window.addEventListener("blur", this.resetInputState);
        window.addEventListener("orientationchange", () => this.checkOrientation());
    }
  
    /**
     * Connects all mobile buttons.
     *
     * @returns {void}
     */
    connectControlButtons() {
        this.connectSingleButton("btn-left", "LEFT");
        this.connectSingleButton("btn-right", "RIGHT");
        this.connectSingleButton("btn-jump", "SPACE");
        this.connectSingleButton("btn-throw", "D");
    }
  
    /**
     * Connects one button to one input key.
     *
     * @param {string} buttonId Id of the button.
     * @param {"LEFT"|"RIGHT"|"SPACE"|"D"} key Connected key.
     * @returns {void}
     */
    connectSingleButton(buttonId, key) {
        const targetButton = document.getElementById(buttonId);
  
        if (!targetButton) {
            return;
        }
  
        const { pressStart, pressEnd, suppressDefault } = this.createInputHandlers(key);
        const applyEvents = window.PointerEvent ? this.attachPointerEvents : this.attachFallbackEvents;
  
        applyEvents.call(this, targetButton, pressStart, pressEnd);
        this.attachBlockEvents(targetButton, suppressDefault);
    }
  
    /**
     * Creates the handlers for one input key.
     *
     * @param {"LEFT"|"RIGHT"|"SPACE"|"D"} key Connected key.
     * @returns {{pressStart: Function, pressEnd: Function, suppressDefault: Function}}
     */
    createInputHandlers(key) {
        const pressStart = (event) => {
            event.preventDefault();
            this.inputState[key] = true;
        };
  
        const pressEnd = (event) => {
            event.preventDefault();
            this.inputState[key] = false;
        };
  
        const suppressDefault = (event) => event.preventDefault();
  
        return { pressStart, pressEnd, suppressDefault };
    }
  
    /**
     * Uses pointer events on modern devices.
     *
     * @param {HTMLElement} button Target button.
     * @param {(event: Event) => void} pressStart Runs on press start.
     * @param {(event: Event) => void} pressEnd Runs on press end.
     * @returns {void}
     */
    attachPointerEvents(button, pressStart, pressEnd) {
        button.addEventListener("pointerdown", pressStart);
        button.addEventListener("pointerup", pressEnd);
        button.addEventListener("pointercancel", pressEnd);
        button.addEventListener("pointerleave", pressEnd);
    }
  
    /**
     * Uses touch and mouse events as fallback.
     *
     * @param {HTMLElement} button Target button.
     * @param {(event: Event) => void} pressStart Runs on press start.
     * @param {(event: Event) => void} pressEnd Runs on press end.
     * @returns {void}
     */
    attachFallbackEvents(button, pressStart, pressEnd) {
        button.addEventListener("touchstart", pressStart, { passive: false });
        button.addEventListener("touchend", pressEnd, { passive: false });
        button.addEventListener("touchcancel", pressEnd, { passive: false });
        button.addEventListener("mousedown", pressStart);
        button.addEventListener("mouseup", pressEnd);
        button.addEventListener("mouseleave", pressEnd);
    }
  
    /**
     * Blocks default browser actions on buttons.
     *
     * @param {HTMLElement} button Target button.
     * @param {(event: Event) => void} suppressDefault Blocks the event.
     * @returns {void}
     */
    attachBlockEvents(button, suppressDefault) {
        button.addEventListener("contextmenu", suppressDefault);
        button.addEventListener("selectstart", suppressDefault);
        button.addEventListener("dragstart", suppressDefault);
    }
  
    /**
     * Shows or hides the rotate overlay.
     *
     * @returns {void}
     */
    checkOrientation() {
        const overlayElement = document.getElementById("orientationOverlay");
        const touchMode = this.isTouchDevice();
        const landscapeMode = window.matchMedia("(orientation: landscape)").matches;
  
        if (!overlayElement) {
            return;
        }
  
        overlayElement.style.display = touchMode && !landscapeMode ? "flex" : "none";
    }
  
    /**
     * Checks if the device uses touch input.
     *
     * @returns {boolean}
     */
    isTouchDevice() {
        return true;
    }
  
    /**
     * Switches fullscreen mode.
     *
     * @returns {void}
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.openFullscreen();
            return;
        }
  
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
  
    /**
     * Opens fullscreen for the game container.
     *
     * @returns {void}
     */
    openFullscreen() {
        const gameWrapper = document.getElementById("gameContainer");
  
        if (!gameWrapper) {
            return;
        }
  
        if (document.fullscreenElement) {
            return;
        }
  
        let fullscreenRequest;
  
        if (gameWrapper.requestFullscreen) {
            fullscreenRequest = gameWrapper.requestFullscreen();
        } else if (gameWrapper.webkitRequestFullscreen) {
            fullscreenRequest = gameWrapper.webkitRequestFullscreen();
        } else if (gameWrapper.msRequestFullscreen) {
            fullscreenRequest = gameWrapper.msRequestFullscreen();
        }
  
        if (fullscreenRequest && typeof fullscreenRequest.catch === "function") {
            fullscreenRequest.catch(() => {});
        }
    }
  }