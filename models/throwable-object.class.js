/**
 * A bottle the character can throw.
 */
class ThrowableObject extends MovableObject {
    groundLevel = 360;
    broken = false;
    markedForRemoval = false;
    throwInterval = null;
    breakCallback = null;
    splashImage = './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png';

    /**
     * Creates a thrown bottle.
     * @param {number} x Start x position.
     * @param {number} y Start y position.
     * @param {boolean} otherDirection Throw direction.
     * @param {Function|null} breakCallback Runs after the bottle breaks.
     */
    constructor(x, y, otherDirection = false, breakCallback = null) {
        super().loadImage('./assets/img/6_salsa_bottle/salsa_bottle.png');
        this.loadImages([this.splashImage]);
        this.width = 50;
        this.height = 60;
        this.breakCallback = breakCallback;
        this.throw(x, y, otherDirection);
    }

    /**
     * Starts the throw movement.
     * @param {number} x Start x position.
     * @param {number} y Start y position.
     * @param {boolean} otherDirection Throw direction.
     * @returns {void}
     */
    throw(x, y, otherDirection) {
        this.x = x;
        this.y = y;
        this.speedY = 30;
        this.otherDirection = otherDirection;
        this.applyGravity();

        this.throwInterval = setInterval(() => {
            if (this.broken) {
                return;
            }

            this.x += this.otherDirection ? -10 : 10;

            if (this.hasHitGround()) {
                this.breakBottle();
            }
        }, 1000 / 50);
    }

    /**
     * Checks if the bottle hit the ground.
     * @returns {boolean} True if the bottle touched the ground.
     */
    hasHitGround() {
        return this.y >= this.groundLevel && this.speedY <= 0;
    }

    /**
     * Breaks the bottle and shows the splash image.
     * @param {boolean} playSound Decides if the callback should run.
     * @returns {void}
     */
    breakBottle(playSound = true) {
        if (this.broken) {
            return;
        }

        this.broken = true;
        this.speedY = 0;
        this.y = this.groundLevel;
        this.img = this.imageCache[this.splashImage];

        if (playSound && typeof this.breakCallback === 'function') {
            this.breakCallback();
        }

        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }

        setTimeout(() => {
            this.markedForRemoval = true;
        }, 180);
    }

    /**
     * Stops the throw interval.
     * @returns {void}
     */
    dispose() {
        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }
    }
}