/**
 * Handles touch controls and screen orientation for mobile devices.
 */
class MobilScreen {
    /**
     * Stores the shared keyboard object and the reset callback.
     *
     * @param {Kayboard} kayboard Shared keyboard state.
     * @param {Function} onResetKeyboard Callback for clearing active inputs.
     */
    constructor(kayboard, onResetKeyboard) {
      this.inputState = kayboard;
      this.resetInputState = onResetKeyboard;
    }
  
    /**
     * Prepares the mobile control setup.
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
     * Connects all available mobile control buttons.
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
     * Connects one control button with one keyboard flag.
     *
     * @param {string} buttonId Id of the target button.
     * @param {"LEFT"|"RIGHT"|"SPACE"|"D"} key Assigned key flag.
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
     * Builds the handlers needed for one mobile input.
     *
     * @param {"LEFT"|"RIGHT"|"SPACE"|"D"} key Assigned key flag.
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
     * Uses pointer events for modern mobile and tablet devices.
     *
     * @param {HTMLElement} button Target button element.
     * @param {(event: Event) => void} pressStart Handler for press start.
     * @param {(event: Event) => void} pressEnd Handler for press end.
     * @returns {void}
     */
    attachPointerEvents(button, pressStart, pressEnd) {
      button.addEventListener("pointerdown", pressStart);
      button.addEventListener("pointerup", pressEnd);
      button.addEventListener("pointercancel", pressEnd);
      button.addEventListener("pointerleave", pressEnd);
    }
  
    /**
     * Uses touch and mouse events as a fallback solution.
     *
     * @param {HTMLElement} button Target button element.
     * @param {(event: Event) => void} pressStart Handler for press start.
     * @param {(event: Event) => void} pressEnd Handler for press end.
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
     * Blocks unwanted browser interactions on control buttons.
     *
     * @param {HTMLElement} button Target button element.
     * @param {(event: Event) => void} suppressDefault Handler for blocked events.
     * @returns {void}
     */
    attachBlockEvents(button, suppressDefault) {
      button.addEventListener("contextmenu", suppressDefault);
      button.addEventListener("selectstart", suppressDefault);
      button.addEventListener("dragstart", suppressDefault);
    }
  
    /**
     * Updates the rotate-device overlay depending on orientation.
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
     * Checks whether the current device mainly uses touch input.
     *
     * @returns {boolean}
     */
    isTouchDevice() {
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0
      );
    }
  
    /**
     * Switches fullscreen mode for the game container.
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
     * Opens fullscreen mode for the game container.
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