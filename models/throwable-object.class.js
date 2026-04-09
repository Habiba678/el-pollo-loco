/**
 * Bottle object used as a throwable item during gameplay.
 * After the impact, the object changes into a splash state.
 */
class ThrowableObject extends MovableObject {
    groundLevel = 360;
    broken = false;
    markedForRemoval = false;
    throwInterval = null;
    breakCallback = null;
    splashImage = './assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png';

    /**
     * Basic setup for a thrown bottle.
     *
     * @param {number} x Start x position.
     * @param {number} y Start y position.
     * @param {boolean} otherDirection Throw direction.
     * @param {Function|null} breakCallback Optional callback after impact.
     */
    constructor(x, y, otherDirection = false, breakCallback = null) {
        super().loadImage('./assets/img/6_salsa_bottle/salsa_bottle.png');
        this.loadImages([this.splashImage]);
        this.width = 50;
        this.height = 60;
        this.breakCallback = breakCallback;
        this.trow(x, y, otherDirection);
    }

    /**
     * Throw movement together with gravity.
     *
     * @param {number} x Start x position.
     * @param {number} y Start y position.
     * @param {boolean} otherDirection Throw direction.
     * @returns {void}
     */
    trow(x, y, otherDirection) {
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
     * Ground contact check for the projectile.
     *
     * @returns {boolean}
     */
    hasHitGround() {
        return this.y >= this.groundLevel && this.speedY <= 0;
    }

    /**
     * Switches the bottle into its splash state.
     *
     * @param {boolean} playSound Decides whether the callback should run.
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
     * Stops the running throw interval.
     *
     * @returns {void}
     */
    dispose() {
        if (this.throwInterval) {
            clearInterval(this.throwInterval);
            this.throwInterval = null;
        }
    }
}