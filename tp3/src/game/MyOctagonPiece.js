/**
 * MyTile class
 */
class MyOctagonPiece extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, player, componentP1, componentP2) {
        super(scene);
        this.player = player;
        this.components = [];
        this.components[1] = componentP1;
        this.components[2] = componentP2;
    }

    addAnimation(animation) {
        this.animation = animation;
    }

    setComponent(component, player) {
        this.components[player] = component;
    }

    /**
     * Display board.
     */
    display() {
        if (this.animation)
            this.animation.apply();
        this.components[this.player].display();
    }
}