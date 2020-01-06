/**
 * MyAnimatedOctagonPiece class, that represents an octagon piece that can be animated
 */
class MyAnimatedOctagonPiece extends MyOctagonPiece {
    constructor(orchestrator, player) {
        super(orchestrator, player);
        this.animation = null;
    }

    /**
     * Adds animation to piece
     * @param {*} animation animation to add
     */
    addAnimation(animation) {
        this.animation = animation;
    }

    /**
     * Checks if the animation is over
     */
    isAnimOver() {
        return this.animation.isOver();
    }

    /**
     * Displays the piece, applying the animation, if there's one
     */
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();

        if (this.animation) {
            this.animation.apply();
        }

        super.display();

        scene.popMatrix();
    }
}