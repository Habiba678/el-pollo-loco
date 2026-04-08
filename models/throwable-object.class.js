class ThrowableObject extends MovableObject {

    constructor(x, y) {
        super().loadImage('./assets/img/7_statusbars/icons/icon_salsa_bottle.png');
        this.x = x;
        this.y = y;
        this.height = 60;
        this.width = 50;
        this.trow();
    }


    trow() {
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 25);
    }
}