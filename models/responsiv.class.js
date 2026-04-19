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

        this.bindFullscreenState();
        this.updateFullscreenClass();
        this.checkOrientation();

        if (!touchMode) {
            return;
        }

        this.connectControlButtons();
        window.addEventListener("blur", this.resetInputState);
        window.addEventListener("resize", () => this.checkOrientation());
        window.addEventListener("orientationchange", () => this.checkOrientation());
    }

    /**
     * Keeps CSS fullscreen class in sync.
     *
     * @returns {void}
     */
    bindFullscreenState() {
        ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((eventName) => {
            document.addEventListener(eventName, () => this.updateFullscreenClass());
        });
    }

    /**
     * Updates the fullscreen helper class.
     *
     * @returns {void}
     */
    updateFullscreenClass() {
        const gameWrapper = document.getElementById("gameContainer");
        const isFullscreen =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;

        if (!gameWrapper) {
            return;
        }

        gameWrapper.classList.toggle("is-fullscreen", !!isFullscreen);
        document.body.classList.toggle("is-fullscreen", !!isFullscreen);
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
        const targetButton = document.getElementById("btn-" + buttonId.replace("btn-", "")) || document.getElementById(buttonId);

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
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        );
    }

    /**
     * Switches fullscreen mode on or off.
     *
     * @returns {void}
     */
    toggleFullscreen() {
        const gameWrapper = document.getElementById("gameContainer");
        const isFullscreen =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;

        if (isFullscreen) {
            this.closeFullscreen();
            return;
        }

        this.openFullscreen(gameWrapper);
    }

    /**
     * Opens fullscreen for the game container.
     *
     * @param {HTMLElement|null} gameWrapper The game container.
     * @returns {void}
     */
    openFullscreen(gameWrapper) {
        if (!gameWrapper) {
            return;
        }

        let fullscreenRequest = null;

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

    /**
     * Closes fullscreen mode.
     *
     * @returns {void}
     */
    closeFullscreen() {
        let exitRequest = null;

        if (document.exitFullscreen) {
            exitRequest = document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            exitRequest = document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            exitRequest = document.msExitFullscreen();
        }

        if (exitRequest && typeof exitRequest.catch === "function") {
            exitRequest.catch(() => {});
        }
    }
}