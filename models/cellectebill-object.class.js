/**
 * Represents an item that can be collected in the level,
 * such as a coin or a bottle.
 */
class CollectebillObjekts extends MovableObject {
    itemKind = 'bottle';

    /**
     * Creates a collectible object at a given position.
     *
     * @param {number} x Horizontal position in the level.
     * @param {number} y Vertical position in the level.
     * @param {'bottle'|'coin'} itemKind Type of collectible item.
     */
    constructor(x, y, itemKind = 'bottle') {
        super();
        this.x = x;
        this.y = y;
        this.itemKind = itemKind;
        this.applyItemSetup();
    }

    /**
     * Applies the correct image, size and hitbox values
     * depending on the selected item type.
     *
     * @returns {void}
     */
    applyItemSetup() {
        if (this.itemKind === 'coin') {
            this.loadImage('./assets/img/8_coin/coin_1.png');
            this.widht = 95;
            this.height = 95;
            this.offset = { top: 35, bottom: 35, left: 35, right: 35 };
            return;
        }

        this.loadImage('./assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png');
        this.widht = 60;
        this.height = 80;
        this.offset = { top: 10, bottom: 5, left: 10, right: 10 };
    }
}