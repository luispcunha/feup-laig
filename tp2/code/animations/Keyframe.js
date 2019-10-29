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

    getAnimationMatrix() {
        let animationMatrix = mat4.create();
        
        animationMatrix = mat4.translate(animationMatrix, animationMatrix, this.translate.getArray());
        
        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, this.rotate.x * Math.PI / 180);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, this.rotate.y * Math.PI / 180);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, this.rotate.z * Math.PI / 180);

        animationMatrix = mat4.scale(animationMatrix, animationMatrix, this.scale.getArray());
        
        return animationMatrix;
    }

    static computeAnimMatrix(keyframe1, keyframe2, currentTime) {
        let animationMatrix = mat4.create();
        let progress = currentTime / (keyframe2.t - keyframe1.t); 
            
        
        const translate = KFTransformation.computeLinearInterpolation(keyframe1.translate, keyframe2.translate, progress);
        animationMatrix = mat4.translate(animationMatrix, animationMatrix, translate);
        
        const rotate = KFTransformation.computeLinearInterpolation(keyframe1.rotate, keyframe2.rotate, progress);
        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, rotate[0] * Math.PI / 180);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, rotate[1] * Math.PI / 180);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, rotate[2] * Math.PI / 180);

        const scale = KFTransformation.computeScaleGeoProg(keyframe1.scale, keyframe2.scale, keyframe1.t, keyframe2.t, currentTime);
        animationMatrix = mat4.scale(animationMatrix, animationMatrix, scale);
        
        return animationMatrix;
    }
}