#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float timeFactor;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    const float exponent = 2.0;
 
    float gradientFactor = 1.0 - pow(sqrt(pow(vTextureCoord.x - 0.5, 2.0) + pow(vTextureCoord.y - 0.5, 2.0)), exponent) / pow(sqrt(0.5), exponent);

    if (mod((vTextureCoord.y - timeFactor) * 10.0, 2.0) > 1.0)
        color = vec4(color.rgb + 0.1, 1.0);

    gl_FragColor = vec4(color.rgb * gradientFactor, 1.0);
}
