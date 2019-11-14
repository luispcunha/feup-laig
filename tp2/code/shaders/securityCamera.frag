#ifdef GL_ES
precision highp float;
#endif

varying vec2 theTexCoord;
uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, theTexCoord);
}
