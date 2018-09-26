function getFile(filename) {
    var source = "";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filename, false);
    xmlhttp.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            source = xmlhttp.responseText;
            console.log(filename + " loaded with \n" + source);
        } else console.log("GET " + filename + " failed with " + this.status);
    };
    xmlhttp.send();
    return source;
}
var shaderFactory = {
    shaders: [],
    getShader: function(gl, file, id) {
        var str = getFile(file);
        var shader = gl.createShader(id);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    loadProgram: function(gl, fs, vs) {
        var shaderProgram;
        console.log("loading shaders: " + fs + " and " + vs);
        var fragmentShader = this.getShader(gl, fs, gl.FRAGMENT_SHADER);
        var vertexShader = this.getShader(gl, vs, gl.VERTEX_SHADER);
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        return shaderProgram;
    },
    addShader: function(gl, name, fs, vs) {
        this.shaders[name] = this.loadProgram(gl, fs, vs);
    }

};

var context = {
    canvas: null,
    gl: null,
    init: function() {
        console.log("initializing canvas");
        this.canvas = document.getElementById("canvas");
        this.initGL();
    },
    initGL: function() {
        console.log("getting webGL context")
        try {
            this.gl = canvas.getContext("webgl2");
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
            //this.gl.viewport(0, 0, canvas.width, canvas.height);
            console.log(this.gl.getParameter(this.gl.VIEWPORT));
        } catch (e) {
            console.log("webgl context fail with:" + e)
        }

        this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
    }


};

function buildVBO(gl, buffer, elementSize) {
    var vbo = { id: null };
    vbo.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo.id);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
    vbo.itemSize = elementSize;
    vbo.numItems = buffer.length / elementSize;
    vbo.attributePointer = function(vpa) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
        gl.vertexAttribPointer(vpa, this.itemSize, gl.FLOAT, false, 0, 0);
    };
    return vbo;
}

function loadTexture(gl, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function getTexture(gl, file) {
    var gltext = gl.createTexture();
    gltext.image = new Image();
    gltext.image.src = "";
    gltext.image.onload = function() {
        loadTexture(gl, gltext);
    };
    gltext.image.src = file; //
    return gltext;
}


function buildMesh(gl, program, vertices, normals, uvs = {}, image = "") {
    var mesh = { vao: null, verts: null, norms: null, uvs: null };
    mesh.program = program;
    mesh.vao = gl.createVertexArray();
    gl.bindVertexArray(mesh.vao);

    mesh.verts = buildVBO(gl, vertices.data, vertices.size);
    mesh.norms = buildVBO(gl, normals.data, normals.size);
    program.vertAttribute = gl.getAttribLocation(program, vertices.name);
    program.normAttribute = gl.getAttribLocation(program, normals.name);
    gl.enableVertexAttribArray(program.vertAttribute);
    gl.enableVertexAttribArray(program.normAttribute);

    if (image !== "") {
        mesh.uvs = buildVBO(gl, uvs.data, uvs.size);
        mesh.diffuse = getTexture(gl, image);
        program.uvAttribute = gl.getAttribLocation(program, uvs.name);
        gl.enableVertexAttribArray(program.uvAttribute);
    } else {
        mesh.uvs = [];
        mesh.diffuse = "";
    }


    mesh.draw = function(gl, method) {
        gl.bindVertexArray(this.vao);
        if (this.diffuse !== "") {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
            gl.uniform1i(gl.getUniformLocation(this.program, "diffuse"), 0);
            this.uvs.attributePointer(this.program.uvAttribute);
        }
        this.verts.attributePointer(this.program.vertAttribute);
        this.norms.attributePointer(this.program.normAttribute);
        gl.drawArrays(method, 0, this.verts.numItems);
    };
    mesh.bindProgram = function() {
        gl.useProgram(this.program);
    };
    return mesh;
};



var mesh, axis;

function initBuffers(gl) {
    getTexture(gl);
    var obj = ParseWavefrontObj(getFile("webgl rendering/assets/Dragon.obj"));
    mesh = buildMesh(gl, shaderFactory.shaders["model"], {
        name: "vertpos",
        data: obj.verts,
        size: 3
    }, {
        name: "vertnorm",
        data: obj.normals,
        size: 3
    }, {
        name: "vertuv",
        data: obj.UVs,
        size: 2
    }, "webgl rendering/assets/dragon_UV.png");
    axis = buildMesh(gl, shaderFactory.shaders["simple"], {
        name: "vertpos",
        data: [
            0, 0, 0,
            1, 0, 0,
            0, 0, 0,
            0, 1, 0,
            0, 0, 0,
            0, 0, 1
        ],
        size: 3
    }, {
        name: "vertcolor",
        data: [
            1, 0, 0,
            1, 0, 0,
            0, 1, 0,
            0, 1, 0,
            0, 0, 1,
            0, 0, 1,
        ],
        size: 3
    });
}


var count = 0;

function drawScene(context) {
    var gl = context.gl;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mesh.bindProgram();
    var model = mat4.create();
    mat4.translate(model, model, [0, -1, 0]);
    mat4.rotate(model, model, count, [0, 1, 0]);
    mat4.scale(model, model, [.5, .5, .5]);
    var projection = mat4.create();
    mat4.perspective(projection, 45. * (Math.PI / 180.), gl.viewportWidth / gl.viewportHeight, .1, 10);
    var view = mat4.create();
    mat4.lookAt(view, [1, 1, 3], [0, 0, 0], [0, 1, 0]);

    gl.uniformMatrix4fv(gl.getUniformLocation(mesh.program, "model"), false, model);
    gl.uniformMatrix4fv(gl.getUniformLocation(mesh.program, "projection"), false, projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(mesh.program, "view"), false, view);

    gl.uniform3f(gl.getUniformLocation(mesh.program, "lightpos"), -1, 0, 1);

    mesh.draw(gl, gl.TRIANGLES);

    axis.bindProgram();
    gl.uniformMatrix4fv(gl.getUniformLocation(axis.program, "projection"), false, projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(axis.program, "view"), false, view);
    axis.draw(gl, gl.LINES);

    count += .01;
}
var program;

function webGLStart() {
    context.init();
    var gl = context.gl;
    shaderFactory.addShader(gl, "model", "webgl rendering/shaders/model.frag", "webgl rendering/shaders/model.vert");
    shaderFactory.addShader(gl, "simple", "webgl rendering/shaders/simple.frag", "webgl rendering/shaders/simple.vert");
    initBuffers(gl);


    drawScene(context);
    setInterval(drawScene, 10, context);
}