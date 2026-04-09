/**
 * Brings together the main game objects, status bars,
 * throwable items and collectible elements.
 */
class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    statusBarHealth = new StatusBar('health', 20, 20);
    statusBarBottle = new StatusBar('bottle', 20, 60);
    statusBarCoins = new StatusBar('coins', 20, 100);
    statusBarEndboss = new StatusBar('boss', 500, 20);

    throwableObjects = [];

    bottle = [
        new CollectebillObjekts(200, 350),
        new CollectebillObjekts(620, 350),
        new CollectebillObjekts(900, 350),
        new CollectebillObjekts(1200, 350),
        new CollectebillObjekts(1450, 350)
    ];

    coins = [
        new CollectebillObjekts(380, 280, 'coin'),
        new CollectebillObjekts(620, 240, 'coin'),
        new CollectebillObjekts(1080, 300, 'coin'),
        new CollectebillObjekts(1380, 250, 'coin'),
        new CollectebillObjekts(1450, 290, 'coin')
    ];

    bottlesCollected = 0;
    coinsCollected = 0;
    totalCoins = this.coins.length;

    /**
     * Sets up the world and starts drawing and update cycles.
     *
     * @param {HTMLCanvasElement} canvas Canvas element used for the game.
     * @param {Keyboard} keyboard Keyboard input state object.
     */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.run();
    }

    /**
     * Links the character to the current world instance.
     *
     * @returns {void}
     */
    setWorld() {
        this.character.world = this;
    }

    /**
     * Repeats collision checks, throw checks and bar updates.
     *
     * @returns {void}
     */
    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            this.statusBarHealth.setPercentage(this.character.energy);
        }, 200);
    }

    /**
     * Throws a bottle when the throw key is pressed
     * and at least one collected bottle is available.
     *
     * @returns {void}
     */
    checkThrowObjects() {
        if (this.keyboard.D && this.bottlesCollected > 0) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);
            this.bottlesCollected--;

            const percentage = Math.min(this.bottlesCollected * 20, 100);
            this.statusBarBottle.setBottlePercentage(percentage);

            this.keyboard.D = false;
        }
    }

    /**
     * Checks enemy contact and collectible pickups.
     *
     * @returns {void}
     */
    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
            }
        });

        this.checkBottleCollection();
        this.checkCoinCollection();
    }

    /**
     * Removes collected bottles from the world
     * and updates the bottle bar.
     *
     * @returns {void}
     */
    checkBottleCollection() {
        for (let i = this.bottle.length - 1; i >= 0; i--) {
            const bottle = this.bottle[i];

            if (this.character.isColliding(bottle)) {
                this.bottle.splice(i, 1);
                this.bottlesCollected++;

                const percentage = Math.min(this.bottlesCollected * 20, 100);
                this.statusBarBottle.setBottlePercentage(percentage);
            }
        }
    }

    /**
     * Removes collected coins from the world
     * and updates the coin bar.
     *
     * @returns {void}
     */
    checkCoinCollection() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];

            if (this.character.isColliding(coin)) {
                this.coins.splice(i, 1);
                this.coinsCollected++;

                const percentage = this.totalCoins > 0
                    ? Math.min((this.coinsCollected / this.totalCoins) * 100, 100)
                    : 0;

                this.statusBarCoins.setBottlePercentage(percentage);
            }
        }
    }

    /**
     * Draws the background, interface bars and moving game objects.
     *
     * @returns {void}
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0);

        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarBottle);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarEndboss);

        this.ctx.translate(this.camera_x, 0);

        this.addToMap(this.character);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addObjectsToMap(this.bottle);
        this.addObjectsToMap(this.coins);

        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    /**
     * Draws each object from a given list.
     *
     * @param {Array} objects List of drawable objects.
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    /**
     * Draws one object and mirrors it if needed.
     *
     * @param {MovableObject|DrawableObject} mo Object to render.
     * @returns {void}
     */
    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    /**
     * Flips an object horizontally before drawing.
     *
     * @param {MovableObject|DrawableObject} mo Object to flip.
     * @returns {void}
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores the normal drawing direction after mirroring.
     *
     * @param {MovableObject|DrawableObject} mo Object to restore.
     * @returns {void}
     */
    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}