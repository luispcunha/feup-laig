class Segment {
    constructor(keyframeBefore, keyframeAfter) {
        this.keyframeBefore = keyframeBefore;
        this.keyframeAfter = keyframeAfter;
    }

    computeAnimMatrix(totalTime) {
        let animationMatrix = mat4.create();
        const currentTime = totalTime - this.keyframeBefore.t;
        const progress = currentTime / (this.keyframeAfter.t - this.keyframeBefore.t);


        const translate = KFTransformation.computeLinearInterpolation(this.keyframeBefore.translate, this.keyframeAfter.translate, progress);
        animationMatrix = mat4.translate(animationMatrix, animationMatrix, translate);

        const rotate = KFTransformation.computeLinearInterpolation(this.keyframeBefore.rotate, this.keyframeAfter.rotate, progress);
        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, rotate[0]);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, rotate[1]);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, rotate[2]);

        const scale = KFTransformation.computeScaleGeoProg(this.keyframeBefore.scale, this.keyframeAfter.scale, this.keyframeBefore.t, this.keyframeAfter.t, currentTime);
        animationMatrix = mat4.scale(animationMatrix, animationMatrix, scale);

        return animationMatrix;
    }
}