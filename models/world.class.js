/**
 * Keeps the main game objects together.
 */
class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    gameAudio;
    camera_x = 0;
    gameOver = false;
    gameLoop = null;
    endbossManager;

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
     * Creates the game world.
     * @param {HTMLCanvasElement} canvas The game canvas.
     * @param {Keyboard} keyboard The shared keyboard state.
     * @param {SoundManager} gameAudio The sound manager.
     */
    constructor(canvas, keyboard, gameAudio) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.gameAudio = gameAudio;
        this.endbossManager = new EndbossManager(this);
        this.setWorld();
        this.draw();
        this.run();
    }

    /**
     * Connects world references.
     * @returns {void}
     */
    setWorld() {
        this.character.world = this;

        this.level.enemies.forEach((enemy) => {
            if (enemy instanceof Endboss) {
                enemy.world = this;
                this.statusBarEndboss.setPercentage(enemy.lifePoints);
            }
        });
    }

    /**
     * Starts the main game loop.
     * @returns {void}
     */
    run() {
        this.gameLoop = setInterval(() => {
            if (this.gameOver) {
                clearInterval(this.gameLoop);
                return;
            }

            this.endbossManager.update();
            this.endbossManager.handleBossCollision();
            this.checkCollisions();
            this.checkThrowObjects();
            this.checkThrowableObjectCollisions();
            this.removeMarkedThrowableObjects();
            this.statusBarHealth.setPercentage(this.character.energy);

            if (this.character.energy <= 0) {
                this.finishGame(showGameOverScreen, 250);
            }
        }, 1000 / 60);
    }

    /**
     * Throws a bottle if possible.
     * @returns {void}
     */
    checkThrowObjects() {
        if (this.gameOver || !this.keyboard.D || this.bottlesCollected <= 0) {
            return;
        }

        const throwX = this.character.otherDirection
            ? this.character.x + 20
            : this.character.x + 70;

        const throwY = this.character.y + 140;

        const bottle = new ThrowableObject(
            throwX,
            throwY,
            this.character.otherDirection,
            () => this.gameAudio && this.gameAudio.playBottleBreak()
        );

        this.throwableObjects.push(bottle);
        this.bottlesCollected--;
        this.statusBarBottle.setBottlePercentage(Math.min(this.bottlesCollected * 20, 100));
        this.keyboard.D = false;
    }

    /**
     * Checks enemy and item collisions.
     * @returns {void}
     */
    checkCollisions() {
        this.level.enemies.forEach((enemy, index) => {
            if (!this.character.isColliding(enemy) || enemy instanceof Endboss) {
                return;
            }

            if (this.isChickenHitFromAbove(enemy)) {
                this.removeEnemyAfterJumpHit(enemy, index);
                return;
            }

            if (!this.character.isHurt()) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);
                this.playSound('playCharacterHit');
            }
        });

        this.checkBottleCollection();
        this.checkCoinCollection();
    }

    /**
     * Handles thrown bottle hits.
     * @returns {void}
     */
    checkThrowableObjectCollisions() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const throwable = this.throwableObjects[i];
            if (throwable.markedForRemoval || throwable.broken) continue;

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];
                if (!throwable.isColliding(enemy)) continue;

                throwable.breakBottle(false);

                if (enemy instanceof Endboss) {
                    this.endbossManager.handleBossHit();
                    this.playSound('playBottleBreak');
                    break;
                }

                this.removeEnemyAfterBottleHit(enemy, j);
                break;
            }
        }
    }

    /**
     * Removes broken bottles.
     * @returns {void}
     */
    removeMarkedThrowableObjects() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const throwable = this.throwableObjects[i];
            if (!throwable.markedForRemoval) continue;

            throwable.dispose();
            this.throwableObjects.splice(i, 1);
        }
    }

    /**
     * Checks if a chicken was hit from above.
     * @param {MovableObject} enemy The enemy to check.
     * @returns {boolean} True if the hit counts.
     */
    isChickenHitFromAbove(enemy) {
        const characterBottom = this.character.y + this.character.height - (this.character.offset?.bottom || 0);
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const isFalling = this.character.speedY < 0;
        const hitTolerance = enemy instanceof ChickenSmall ? 95 : 55;
        return isFalling && characterBottom <= enemyTop + hitTolerance;
    }

    /**
     * Collects bottles.
     * @returns {void}
     */
    checkBottleCollection() {
        for (let i = this.bottle.length - 1; i >= 0; i--) {
            if (!this.character.isColliding(this.bottle[i])) continue;

            this.bottle.splice(i, 1);
            this.bottlesCollected++;
            this.statusBarBottle.setBottlePercentage(Math.min(this.bottlesCollected * 20, 100));
            this.playSound('playBottleCollect');
        }
    }

    /**
     * Collects coins.
     * @returns {void}
     */
    checkCoinCollection() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (!this.character.isColliding(this.coins[i])) continue;

            this.coins.splice(i, 1);
            this.coinsCollected++;

            const percentage = this.totalCoins > 0
                ? Math.min((this.coinsCollected / this.totalCoins) * 100, 100)
                : 0;

            this.statusBarCoins.setBottlePercentage(percentage);
            this.playSound('playCoinCollect');
        }
    }

    /**
     * Draws the whole world.
     * @returns {void}
     */
    draw() {
        if (this.gameOver) {
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addObjectsToMap(this.bottle);
        this.addObjectsToMap(this.coins);
        this.addToMap(this.character);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarBottle);
        this.addToMap(this.statusBarCoins);
        this.addToMap(this.statusBarEndboss);

        requestAnimationFrame(() => this.draw());
    }

    /**
     * Draws a list of objects.
     * @param {Array} objects The objects to draw.
     * @returns {void}
     */
    addObjectsToMap(objects) {
        objects.forEach((object) => this.addToMap(object));
    }

    /**
     * Draws one object.
     * @param {MovableObject} mo The object to draw.
     * @returns {void}
     */
    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    /**
     * Flips one image before drawing.
     * @param {MovableObject} mo The object to flip.
     * @returns {void}
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores the image after drawing.
     * @param {MovableObject} mo The object to restore.
     * @returns {void}
     */
    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    /**
     * Removes an enemy after a jump hit.
     * @param {MovableObject} enemy The enemy to remove.
     * @param {number} index The enemy index.
     * @returns {void}
     */
    removeEnemyAfterJumpHit(enemy, index) {
        if (typeof enemy.die === 'function') {
            enemy.die();
        }

        this.character.speedY = 24;
        this.playSound('playEnemyKill');

        setTimeout(() => {
            this.level.enemies.splice(index, 1);
        }, 250);
    }

    /**
     * Removes an enemy after a bottle hit.
     * @param {MovableObject} enemy The enemy to remove.
     * @param {number} index The enemy index.
     * @returns {void}
     */
    removeEnemyAfterBottleHit(enemy, index) {
        if (typeof enemy.die === 'function') {
            enemy.die();
        }

        this.playSound('playEnemyKill');
        this.playSound('playBottleBreak');

        setTimeout(() => {
            this.level.enemies.splice(index, 1);
        }, 250);
    }

    /**
     * Plays a sound if audio is available.
     * @param {string} method The sound method name.
     * @returns {void}
     */
    playSound(method) {
        if (this.gameAudio && typeof this.gameAudio[method] === 'function') {
            this.gameAudio[method]();
        }
    }

    /**
     * Ends the game after a short delay.
     * @param {Function} callback The screen callback.
     * @param {number} delay The delay in milliseconds.
     * @returns {void}
     */
    finishGame(callback, delay = 250) {
        this.gameOver = true;

        setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
        }, delay);
    }
}