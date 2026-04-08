/**
 * Represents a standard chicken enemy that moves across the level
 * and switches to a defeated state when it gets hit.
 */
class Chicken extends MovableObject {
    x;
    y = 350;
    width = 120;
    height = 80;
    offset = { top: 5, bottom: 5, left: 10, right: 10 };
    dead = false;
    speed = 0.1 + Math.random() * 0.45;

    walkFrames = [
        "./assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "./assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "./assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ];

    deadFrame = "./assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png";

    /**
     * Loads the required images, places the enemy in the level
     * and starts its movement and animation loops.
     */
    constructor() {
        super().loadImage("./assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.walkFrames);
        this.loadImages([this.deadFrame]);
        this.x = 1000 + Math.random() * 500;
        this.applyGravity();
        this.animation();
    }

    /**
     * Runs the enemy movement and frame animation while it is alive.
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
                this.playAnimation(this.walkFrames);
            }
        }, 200);
    }

    /**
     * Stops the enemy and switches its image to the defeat frame.
     * @returns {void}
     */
    die() {
        this.dead = true;
        this.speed = 0;
        this.img = this.imageCache[this.deadFrame];
    }
}