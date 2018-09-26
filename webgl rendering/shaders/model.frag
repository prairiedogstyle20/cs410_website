#version 300 es

precision mediump float;

out vec4 FragColor;

uniform vec3 lightpos;
uniform sampler2D diffuse;

in vec3 normal;
in vec3 fragpos;
in vec2 textcoord;

void main(){
    

    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(lightpos - fragpos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 Diffuse = texture(diffuse,textcoord).rgb;

    FragColor = vec4((vec3(.2)*Diffuse)+diff*(Diffuse),1);
}