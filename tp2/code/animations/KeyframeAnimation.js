class KeyframeAnimation extends Animation {
    constructor(scene, keyframes) {
        this.scene = scene;
        this.keyframes = keyframes;
        this.sumT = 0;
        this.segment = 0;
        this.currentAnimationMatrix;
    }

    update(t) {
        this.sumT += t;

        if (this.sumT > this.keyframes[this.segment].t) {
            this.sumT -= this.keyframes[this.segment].t;
            this.segment++;
        }

        const segmentExecProgress = this.sumT / this.keyframes[this.segment].t; 

        

        //TODO: update animation matrix
    }

    apply() {
        //TODO: apply animation matrix
        this.scene.multMatrix(this.currentAnimationMatrix);
    }
}