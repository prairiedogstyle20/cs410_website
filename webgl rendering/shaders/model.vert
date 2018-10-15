#version 300 es
  in vec3 vertpos;
  in vec3 vertnorm;
  in vec2 vertuv;
  
  out vec3 normal;
  out vec3 fragpos;
  out vec2 textcoord;

  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;

    void main(void) {
        normal=mat3(transpose(inverse(model))) *vertnorm;
        gl_Position = projection*view*model*vec4(vertpos, 1.0);
        fragpos=vec3(model*vec4(vertpos,1.));
        textcoord=vertuv;
    }