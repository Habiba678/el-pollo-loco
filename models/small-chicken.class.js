/**
 * Represents a small chicken enemy.
 */
class ChickenSmall extends MovableObject {
    x;
    y = 385;
    groundLevel = 385;
    width = 70;
    height = 55;
    offset = { top: 2, bottom: 2, left: 4, right: 4 };
    dead = false;
    speed = 0.25 + Math.random() * 0.35;

    walkSprites = [
        './assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    deadSprite = './assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    /**
     * Creates a small chicken and loads its images.
     */
    constructor() {
        super().loadImage('./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.walkSprites);
        this.loadImages([this.deadSprite]);
        this.x = 560 + Math.random() * 560;
        this.animation();
    }

    /**
     * Starts movement and walk animation.
     * @returns {void}
     */
    animation() {
        setInterval(() => {
            if (!this.dead) {
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.walkSprites);
            }
        }, 200);
    }

    /**
     * Marks the chicken as dead.
     * @returns {void}
     */
    die() {
        this.dead = true;
        this.speed = 0;
        this.img = this.imageCache[this.deadSprite];
    }
}