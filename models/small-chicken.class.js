/**
 * Represents the smaller chicken enemy with its own size,
 * walking cycle and a light random jump behavior.
 */
class ChickenSmall extends MovableObject {
    x;
    y = 400;
    groundLevel = 400;
    widht = 60;
    height = 40;
    offset = { top: 3, bottom: 3, left: 5, right: 5 };
    dead = false;
    speed = 0.1 + Math.random() * 0.45;

    walkSprites = [
        './assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    deadSprite = './assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    /**
     * Loads the image set, places the enemy in the level
     * and starts movement plus animation updates.
     */
    constructor() {
        super().loadImage('./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.walkSprites);
        this.loadImages([this.deadSprite]);
        this.x = 560 + Math.random() * 560;
        this.applyGravity();
        this.animation();
    }

    /**
     * Runs the movement loop and the walking animation loop.
     *
     * @returns {void}
     */
    animation() {
        setInterval(() => {
            if (!this.dead) {
                this.moveLeft();
                this.tryRandomJump(0.006, 10);
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.walkSprites);
            }
        }, 200);
    }

    /**
     * Switches the enemy to its defeated state.
     *
     * @returns {void}
     */
    die() {
        this.dead = true;
        this.speed = 0;
        this.img = this.imageCache[this.deadSprite];
    }
}