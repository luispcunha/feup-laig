class KeyframeAnimation extends Animation {
    constructor(scene, id, keyframes) {
        super(scene, id);
        this.keyframes = [new Keyframe()];
        this.keyframes.push(...keyframes);
        this.generateSegments();
        this.sumT = 0;
        this.animationMatrix = mat4.create();
        this.animationEnded = false;
    }

    generateSegments() {
        this.segments = [];
        for (let i = 1; i < this.keyframes.length; i++)
            this.segments.push(new Segment(this.keyframes[i - 1], this.keyframes[i]));
    }

    getCurrentSegment() {
        for (const segment of this.segments) {
            if (this.sumT >= segment.keyframeBefore.t && this.sumT < segment.keyframeAfter.t)
                return segment;
        }

        return null;
    }

    update(t) {
        if (! this.animationEnded) {
            this.sumT += t;

            const currentSegment = this.getCurrentSegment();

            if (currentSegment == null) {
                this.animationMatrix = this.keyframes[this.keyframes.length - 1].getAnimationMatrix();
                this.animationEnded = true;
                return;
            }

            this.animationMatrix = currentSegment.computeAnimMatrix(this.sumT);
        }
    }

    apply() {
        this.scene.multMatrix(this.animationMatrix);
    }
}