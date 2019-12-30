/**
 * MyTile class
 */
class MyOctagonPiece extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, tile, player) {
        super(scene);
        this.tile = tile;
        this.type = type;
        this.player = player;
        this.components = {};
    }

    setComponentP1(component, player) {
        this.components[player] = component;
    }

    /**
     * Display board.
     */
    display() {
        this.components[this.player].display();
    }
}