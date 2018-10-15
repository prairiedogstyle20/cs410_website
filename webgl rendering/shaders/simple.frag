#version 300 es

precision mediump float;

out vec4 FragColor;

in vec3 fragcolor;

void main(){
    FragColor = vec4(fragcolor,1);
}