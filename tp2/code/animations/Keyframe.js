class Keyframe {
    constructor(t, scale, rotate, translate) {
        if (!arguments.length) {
            this.t = 0;
            this.scale = new KFTransformation(1, 1, 1);
            this.rotate = new KFTransformation(0, 0, 0);
            this.translate = new KFTransformation(0, 0, 0);
        } else {
            this.t = t * 1000;
            this.scale = scale;
            this.rotate = rotate;
            this.translate = translate;
        }
    }

    static computeAnimMatrix(keyframe1, keyframe2, progress) {
        let animationMatrix = mat4.create();
        
        const translate = KFTransformation.interpolate(keyframe1.translate, keyframe2.translate, progress);
        animationMatrix = mat4.translate(animationMatrix, animationMatrix, translate);
        
        const rotate = KFTransformation.interpolate(keyframe1.rotate, keyframe2.rotate, progress);
        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, rotate[0] * Math.PI / 180);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, rotate[1] * Math.PI / 180);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, rotate[2] * Math.PI / 180);
        
        return animationMatrix;
    }
}