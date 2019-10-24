class KeyframeAnimation extends Animation {
    constructor(scene, keyframes) {
        this.scene = scene;
        this.keyframes = keyframes;
        this.sumT = 0;
        this.segment = 0;
        this.currentAnimationMatrix;
    }

    update(t) {
        //TODO: update animation matrix

    }

    apply() {
        //TODO: apply animation matrix

    }
}