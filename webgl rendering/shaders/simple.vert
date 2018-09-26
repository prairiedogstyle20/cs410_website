#version 300 es
  in vec3 vertpos;
  in vec3 vertcolor;
  
  out vec3 fragcolor;

  uniform mat4 view;
  uniform mat4 projection;

    void main(void) {
        gl_Position = projection*view*vec4(vertpos, 1.0);
        fragcolor=vertcolor;
    }