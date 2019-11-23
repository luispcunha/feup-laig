#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float timeFactor;

void main() {
    vec2 textureCoord = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);
    vec4 color = texture2D(uSampler, textureCoord);

    color.r = (color.r * 0.393) + (color.g * 0.769) + (color.b * 0.189);
    color.g = (color.r * 0.349) + (color.g * 0.686) + (color.b * 0.168);
    color.b = (color.r * 0.272) + (color.g * 0.534) + (color.b * 0.131);


    const float maxDistance = sqrt(pow(0.5, 2.0) + pow(0.5, 2.0));
    float distance = sqrt(pow(textureCoord.x - 0.5, 2.0) + pow(textureCoord.y - 0.5, 2.0));

    float gradientFactor = 1.0 - distance / maxDistance;

    if (mod((textureCoord.y - timeFactor) * 15.0, 1.5) > 1.0)
        color = vec4(color.rgb + 0.08, 1.0);

    gl_FragColor = vec4(color.rgb * gradientFactor, 1.0);
}
