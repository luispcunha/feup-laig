/**
 * MyTile class
 */
class MyOctagonPiece {
    /**
     * @constructor
     */
    constructor(orchestrator, player, componentP1, componentP2) {
        this.orchestrator = orchestrator;
        this.player = player;
        this.components = [];
        this.components[1] = componentP1;
        this.components[2] = componentP2;
    }

    setComponent(component, player) {
        this.components[player] = component;
    }

    /**
     * Display board.
     */
    display() {
        this.components[this.player].display();
    }
}