function ParseWavefrontObj(objdata) {
    var verts = [];
    var normals = [];
    var UVs = [];
    var indexed = { verts: [], normals: [], UVs: [] };
    var lines = objdata.split("\n");

    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].trimRight().split(" ");
        if (parts.length > 0) {
            switch (parts[0]) {
                case 'v':
                    verts.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                    break;
                case 'vn':
                    normals.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                    break;
                case 'vt':
                    UVs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
                    break;
                case 'f':
                    var f1 = parts[1].split('/');
                    var f2 = parts[2].split('/');
                    var f3 = parts[3].split('/');
                    indexed.verts = indexed.verts.concat(verts[parseInt(f1[0]) - 1]);
                    indexed.verts = indexed.verts.concat(verts[parseInt(f2[0]) - 1]);
                    indexed.verts = indexed.verts.concat(verts[parseInt(f3[0]) - 1]);

                    indexed.UVs = indexed.UVs.concat(UVs[parseInt(f1[1]) - 1]);
                    indexed.UVs = indexed.UVs.concat(UVs[parseInt(f2[1]) - 1]);
                    indexed.UVs = indexed.UVs.concat(UVs[parseInt(f3[1]) - 1]);

                    indexed.normals = indexed.normals.concat(normals[parseInt(f1[2]) - 1]);
                    indexed.normals = indexed.normals.concat(normals[parseInt(f2[2]) - 1]);
                    indexed.normals = indexed.normals.concat(normals[parseInt(f3[2]) - 1]);
                    break;
            }
        }

    }
    console.log(verts.length);
    console.log(UVs.length);
    console.log(normals.length);
    return indexed;
}