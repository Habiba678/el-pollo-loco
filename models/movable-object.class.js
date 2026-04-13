/**
 * Extends drawable objects with movement, gravity, collision
 * and state handling for health and animations.
 */
class MovableObject extends DrawableObject {
    x = 760;
    y = 200;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    groundLevel = 180;

    /**
     * Starts the gravity loop and updates vertical movement.
     * @returns {void}
     */
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;

                if (this.y >= this.groundLevel && this.speedY <= 0) {
                    this.y = this.groundLevel;
                    this.speedY = 0;
                }
            }
        }, 1000 / 25);
    }

    /**
     * Checks whether the object is above the ground line.
     * Throwable objects are always treated as airborne.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < this.groundLevel;
        }
    }

    /**
     * Checks collision against another movable object using offsets if available.
     * @param {MovableObject} mo Object to compare with.
     * @returns {boolean}
     */
    isColliding(mo) {
        const aLeft = this.x + (this.offset?.left || 0);
        const aRight = this.x + this.width - (this.offset?.right || 0);
        const aTop = this.y + (this.offset?.top || 0);
        const aBottom = this.y + this.height - (this.offset?.bottom || 0);

        const bLeft = mo.x + (mo.offset?.left || 0);
        const bRight = mo.x + mo.width - (mo.offset?.right || 0);
        const bTop = mo.y + (mo.offset?.top || 0);
        const bBottom = mo.y + mo.height - (mo.offset?.bottom || 0);

        return aRight > bLeft && aBottom > bTop && aLeft < bRight && aTop < bBottom;
    }

    /**
     * Reduces energy and stores the time of the last hit.
     * @returns {void}
     */
    hit() {
        this.energy -= 5;

        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Checks whether the object is currently in its hurt phase.
     * @returns {boolean}
     */
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    /**
     * Checks whether the object has no remaining energy.
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Plays the next image from a frame list.
     * @param {string[]} images Animation frame paths.
     * @returns {void}
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Plays frames for idle sequences.
     * @param {string[]} images Idle frame paths.
     * @returns {void}
     */
    playAnimationIdel(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Moves the object to the right according to its speed value.
     * @returns {void}
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left according to its speed value.
     * @returns {void}
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Starts a jump with optional jump strength.
     * @param {number} jumpStrength Upward force for the jump.
     * @returns {void}
     */
    jump(jumpStrength = 30) {
        if (this.isAboveGround()) {
            return;
        }

        this.speedY = jumpStrength;
    }

    /**
     * Lets AI-driven objects jump randomly by chance.
     * @param {number} chance Probability between 0 and 1.
     * @param {number} jumpStrength Upward force for the jump.
     * @returns {void}
     */
    tryRandomJump(chance, jumpStrength = 10) {
        if (!this.isAboveGround() && Math.random() < chance) {
            this.jump(jumpStrength);
        }
    }
}