class KeyframeAnimation extends Animation {
    constructor(scene, id, keyframes) {
        super(scene, id);
        this.keyframes = [new Keyframe()];
        this.keyframes.push(...keyframes);
        this.sumT = 0;
        this.segment = 1;
        this.animationMatrix = mat4.create();
        this.animationEnded = false;
    }

    update(t) {
        // TODO: add rotate and scale animations
        if (! this.animationEnded) {
            this.sumT += t;
            const segmentT = this.keyframes[this.segment].t - this.keyframes[this.segment - 1].t;

            if (this.sumT > segmentT) {
                this.sumT -= segmentT;
                this.segment++;
                
                if (this.segment == this.keyframes.length) {
                    this.animationMatrix = this.keyframes[this.segment - 1].getAnimationMatrix();
                    this.animationEnded = true;
                    return;
                }
            }
            
            this.animationMatrix = Keyframe.computeAnimMatrix(this.keyframes[this.segment - 1], this.keyframes[this.segment], this.sumT);
        }
    }

    apply() {
        this.scene.multMatrix(this.animationMatrix);
    }
}