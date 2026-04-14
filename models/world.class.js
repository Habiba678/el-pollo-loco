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

    setWorld() {
        this.character.world = this;

        this.level.enemies.forEach((enemy) => {
            if (enemy instanceof Endboss) {
                enemy.world = this;
                this.statusBarEndboss.setPercentage(enemy.lifePoints);
            }
        });
    }

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
                this.gameOver = true;

                setTimeout(() => {
                    if (typeof showGameOverScreen === 'function') {
                        showGameOverScreen();
                    }
                }, 250);
            }
        }, 1000 / 60);
    }

    checkThrowObjects() {
        if (this.gameOver) {
            return;
        }

        if (this.keyboard.D && this.bottlesCollected > 0) {
            const bottle = new ThrowableObject(
                this.character.x + 100,
                this.character.y + 100,
                this.character.otherDirection,
                () => {
                    if (this.gameAudio) {
                        this.gameAudio.playBottleBreak();
                    }
                }
            );

            this.throwableObjects.push(bottle);
            this.bottlesCollected--;

            const percentage = Math.min(this.bottlesCollected * 20, 100);
            this.statusBarBottle.setBottlePercentage(percentage);

            this.keyboard.D = false;
        }
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy, index) => {
            if (!this.character.isColliding(enemy)) {
                return;
            }

            if (enemy instanceof Endboss) {
                return;
            }

            if (this.isChickenHitFromAbove(enemy)) {
                if (typeof enemy.die === 'function') {
                    enemy.die();
                }

                this.character.speedY = 24;

                if (this.gameAudio) {
                    this.gameAudio.playEnemyKill();
                }

                setTimeout(() => {
                    this.level.enemies.splice(index, 1);
                }, 250);

                return;
            }

            if (!this.character.isHurt()) {
                this.character.hit();
                this.statusBarHealth.setPercentage(this.character.energy);

                if (this.gameAudio) {
                    this.gameAudio.playCharacterHit();
                }
            }
        });

        this.checkBottleCollection();
        this.checkCoinCollection();
    }

    checkThrowableObjectCollisions() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const throwable = this.throwableObjects[i];

            if (throwable.markedForRemoval || throwable.broken) {
                continue;
            }

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                if (!throwable.isColliding(enemy)) {
                    continue;
                }

                throwable.breakBottle(false);

                if (enemy instanceof Endboss) {
                    this.endbossManager.handleBossHit();

                    if (this.gameAudio) {
                        this.gameAudio.playBottleBreak();
                    }

                    break;
                }

                if (typeof enemy.die === 'function') {
                    enemy.die();
                }

                if (this.gameAudio) {
                    this.gameAudio.playEnemyKill();
                    this.gameAudio.playBottleBreak();
                }

                setTimeout(() => {
                    this.level.enemies.splice(j, 1);
                }, 250);

                break;
            }
        }
    }

    removeMarkedThrowableObjects() {
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const throwable = this.throwableObjects[i];

            if (!throwable.markedForRemoval) {
                continue;
            }

            throwable.dispose();
            this.throwableObjects.splice(i, 1);
        }
    }

    isChickenHitFromAbove(enemy) {
        const characterBottom = this.character.y + this.character.height - (this.character.offset?.bottom || 0);
        const enemyTop = enemy.y + (enemy.offset?.top || 0);

        const isFalling = this.character.speedY < 0;
        const hitTolerance = enemy instanceof ChickenSmall ? 95 : 55;
        const isAboveEnemy = characterBottom <= enemyTop + hitTolerance;

        return isFalling && isAboveEnemy;
    }

    checkBottleCollection() {
        for (let i = this.bottle.length - 1; i >= 0; i--) {
            const bottle = this.bottle[i];

            if (this.character.isColliding(bottle)) {
                this.bottle.splice(i, 1);
                this.bottlesCollected++;

                const percentage = Math.min(this.bottlesCollected * 20, 100);
                this.statusBarBottle.setBottlePercentage(percentage);

                if (this.gameAudio) {
                    this.gameAudio.playBottleCollect();
                }
            }
        }
    }

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

                if (this.gameAudio) {
                    this.gameAudio.playCoinCollect();
                }
            }
        }
    }

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

        requestAnimationFrame(() => {
            this.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}