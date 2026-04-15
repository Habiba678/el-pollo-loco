/**
 * Shows the different status bars in the game.
 */
class StatusBar extends DrawableObject {
    mainSet = [];
    value = 100;
    barMode = 'health';

    healthSprites = [
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        './assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
    ];

    bossSprites = [
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        './assets/img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    bottleSprites = [
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png'
    ];

    coinSprites = [
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png'
    ];

    /**
     * Creates one status bar.
     * @param {string} type Type of bar.
     * @param {number} x Horizontal position.
     * @param {number} y Vertical position.
     */
    constructor(type = 'health', x = 40, y = 0) {
        super();
        this.width = 200;
        this.height = 60;
        this.x = x;
        this.y = y;
        this.setupBar(type);
    }

    /**
     * Picks the right image set.
     * @param {string} type Chosen bar type.
     * @returns {void}
     */
    setupBar(type) {
        this.barMode = type;

        if (type === 'boss') {
            this.mainSet = this.bossSprites;
            this.loadImages(this.mainSet);
            this.updateValue(100);
        } else if (type === 'bottle') {
            this.mainSet = this.bottleSprites;
            this.loadImages(this.mainSet);
            this.updateFillReverse(0);
        } else if (type === 'coins') {
            this.mainSet = this.coinSprites;
            this.loadImages(this.mainSet);
            this.updateFillReverse(0);
        } else {
            this.mainSet = this.healthSprites;
            this.loadImages(this.mainSet);
            this.updateValue(100);
        }
    }

    /**
     * Updates a normal bar.
     * @param {number} value Current value.
     * @returns {void}
     */
    updateValue(value) {
        this.value = value;
        const path = this.mainSet[this.pickStandardIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Updates a reverse bar.
     * @param {number} value Current value.
     * @returns {void}
     */
    updateFillReverse(value) {
        this.value = value;
        const path = this.mainSet[this.pickReverseIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Sets the value for normal bars.
     * @param {number} percentage Current value.
     * @returns {void}
     */
    setPercentage(percentage) {
        this.updateValue(percentage);
    }

    /**
     * Sets the value for bottle and coin bars.
     * @param {number} percentage Current value.
     * @returns {void}
     */
    setBottlePercentage(percentage) {
        this.updateFillReverse(percentage);
    }

    /**
     * Gets the image index for normal bars.
     * @returns {number} The matching image index.
     */
    pickStandardIndex() {
        if (this.value >= 100) return 5;
        if (this.value >= 80) return 4;
        if (this.value >= 60) return 3;
        if (this.value >= 40) return 2;
        if (this.value >= 20) return 1;
        return 0;
    }

    /**
     * Gets the image index for reverse bars.
     * @returns {number} The matching image index.
     */
    pickReverseIndex() {
        if (this.value === 0) return 5;
        if (this.value <= 20) return 4;
        if (this.value <= 40) return 3;
        if (this.value <= 60) return 2;
        if (this.value <= 80) return 1;
        return 0;
    }
}