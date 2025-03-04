let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - re  peatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    //window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log(scene);
    //translate: new Matrix(4,4)
    //mat4x4Identity();
    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line
    if(scene.view.type == "perspective") {
        let transformed = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);

        console.log("transformed:");
        console.log(transformed);

        let verts_processed = [];
        //console.log(scene.models.vertices);
        for(let i = 0; i < scene.models[0].vertices.length; i++) {
            let verts = new Matrix(4, 1);
            verts.values = [[scene.models[0].vertices[i].x], [scene.models[0].vertices[i].y], [scene.models[0].vertices[i].z], [scene.models[0].vertices[i].w]];
            /*
            console.log("verts, nper, matrix: ");
            console.log(verts);
            console.log(nper);
            console.log(scene.models[0].matrix);
            */
            //DON'T SWITCH THIS MULTIPLICATION ORDER; THIS WILL NOT WORK IN ANY OTHER MATRIX ORDER
            //(and also I'll be mad cuz it took me a lot of trial and error to figure out the matrix order)
            verts_processed[i] = Matrix.multiply([transformed, scene.models[0].matrix, verts]);
        }
        for(let i = 0; i < verts_processed.length; i++) {
            verts_processed[i] = verts_processed[i].data;
        }

        console.log("verts_processed:");
        console.log(verts_processed);

        let z_min = -(scene.view.clip[4] / scene.view.clip[5]);
        let vert_count = 1;
        let verts_clipped = [];
        for(let i = 0; i < scene.models[0].edges.length; i++) {
            let edge1 = scene.models[0].edges[i][0];
            let vert1 = verts_processed[edge1];
            //console.log("vert1:");
            //console.log(vert1);
            for(let j = 1; j < scene.models[0].edges[i].length; j++) {
                let edge2 = scene.models[0].edges[i][j];
                let vert2 = verts_processed[edge2];
                //console.log("vert2:");
                //console.log(vert2);

                let line = { pt0: {x:vert1[0][0], y:vert1[1][0], z:vert1[2][0]},
                             pt1: {x:vert2[0][0], y:vert2[1][0], z:vert2[2][0]}};
                console.log("line pre:");
                console.log(line);
                line = clipLinePerspective(line, z_min);
                console.log("line post:");
                console.log(line);
                if(line != null) {
                    console.log("line != null");
                    //let vert_count = 0;
                    verts_clipped[vert_count-1] = new Matrix(4,1);
                    verts_clipped[vert_count-1].values = [[line.pt0.x], [line.pt0.y], [line.pt0.z], [1]];
                    //console.log("aye");
                    //console.log(verts_clipped[vert_count-1]);
                    verts_clipped[vert_count] = new Matrix(4,1);
                    verts_clipped[vert_count].values = [[line.pt1.x], [line.pt1.y], [line.pt1.z], [1]];
                    vert_count++;
                }
            }
        }
        //need to define line
        /*
        let verts = scene.models[0].vertices;
        console.log("Verts:");
        console.log(verts);
        let z_min = -(scene.view.clip[4] / scene.view.clip[5]);
        let pt0 = {x: verts[0].x,
                   y: verts[0].y,
                   z: verts[0].z};
        let pt1 = {x: 0,
                   y: 0,
                   z: 0};
        let line = (pt0, pt1);
        for(let i = 1; i < verts.length; i++) {
            pt0 = {x: verts[i-1].x,
                   y: verts[i-1].y,
                   z: verts[i-1].z};
            pt1 = {x: verts[i].x,
                   y: verts[i].y,
                   z: verts[i].z};
            
            console.log("pt0:");
            console.log(pt0);
            console.log("pt1:");
            console.log(pt1);
            console.log("verts[i-1].x:");
            console.log(verts[i-1].x);
            console.log("verts[i].x:");
            console.log(verts[i].x);
            
            line = {pt0, pt1};
            console.log("line pre:");
            console.log(line);
            line = clipLinePerspective(line, z_min);
            console.log("line post:");
            console.log(line);
            if(line != null) {
                verts[i-1].x = line.pt0.x;
                verts[i-1].y = line.pt0.y;
                verts[i-1].z = line.pt0.z;
                verts[i].x = line.pt1.x;
                verts[i].y = line.pt1.y;
                verts[i].z = line.pt1.z;

                //console.log("line.pt0.x:");
                //console.log(line.pt0.x);
            }
        }

        let veccy1 = null;
        let veccy2 = null;
        for(let i = 1; i < verts.length; i++) {
            veccy1 = (verts[i-1]);
            //console.log("veccy1 pre:");
            //console.log(veccy1);
            veccy1 = nper.mult(veccy1);
            //console.log("veccy1 post:");
            //console.log(veccy1);
            console.log(veccy1.data[0][0]); //x
            console.log(veccy1.data[1][0]); //y
            console.log(veccy1.data[2][0]); //z
            console.log(veccy1.data[3][0]); //w

            veccy2 = (verts[i]);
            veccy2 = nper.mult(veccy2);

            if(veccy1 != null && veccy2 != null) {
                drawLine((veccy1.data[0][0]/veccy1.data[3][0]), (veccy1.data[1][0]/veccy1.data[3][0]), (veccy2.data[0][0]/veccy2.data[3][0]), (veccy2.data[1][0]/veccy2.data[3][0]));
            }
            */
        
        
    } else if(scene.view.type == 'parallel') {
        mat4x4Parallel(scene.prp, scene.srp, scene.vup, scene.clip);

        //need to define line and z_min
        let z_min = 0; //going off of back: z = 0 and assuming it's supposed to differ from perspective. Might be wrong but idk.
        clipLineParallel(line, z_min);
    } else {
        //TODO: throw error
        console.log("ERROR: invalid scene type");
    }
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    //console.log("outcodePerspective().vertex:");
    //console.log(vertex);

    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);

    //trivial reject
    if((out0 & out1) != 0) {
        return null;
    }
    
    
    let leftT = ((-1 * p0.x) + p0.z) / (Math.abs(p0.x - p1.x) - Math.abs(p0.z - p1.z));
    let rightT = (p0.x + p0.z) / (-1 * (Math.abs(p0.x - p1.x)) - Math.abs(p0.z - p1.z));
    let bottomT = ((p0.y * -1) + p0.z) / (Math.abs(p0.y - p1.y) - Math.abs(p0.z - p1.z));
    let topT = (p0.y + p0.z) / ((-1 * Math.abs(p0.y - p1.y)) - Math.abs(p0.z - p1.z));
    let nearT = (p0.z - z_min) / (-1 * (Math.abs(p0.z - p1.z)));
    let farT = ((-1 * p0.z) - 1) / (Math.abs(p0.z - p1.z));

    //x = (1-t) · x0 + t · x1
    //y = (1-t) · y0 + t · y1
    //z = (1-t) · z0 + t · z1

    //LEFT
    if(out0 >= 32) {
        p0 = {x: (1-leftT) * p0.x + leftT * p1.x,
              y: (1-leftT) * p0.y + leftT * p1.y,
              z: (1-leftT) * p0.z + leftT * p1.z};
        out0 -= 32;
    } else if(out1 >= 32) {
        p1 = {x: (1-leftT) * p0.x + leftT * p1.x,
              y: (1-leftT) * p0.y + leftT * p1.y,
              z: (1-leftT) * p0.z + leftT * p1.z};
        out1 -= 32;
    }
    //RIGHT
    if(out0 >= 16) {
        p0 = {x: (1-rightT) * p0.x + rightT * p1.x,
              y: (1-rightT) * p0.y + rightT * p1.y,
              z: (1-rightT) * p0.z + rightT * p1.z};
        out0 -= 32;
    } else if(out1 >= 16) {
        p1 = {x: (1-rightT) * p0.x + rightT * p1.x,
              y: (1-rightT) * p0.y + rightT * p1.y,
              z: (1-rightT) * p0.z + rightT * p1.z};
        out1 -= 32;
    }
    //BOTTOM
    if(out0 >= 8) {
        p0 = {x: (1-bottomT) * p0.x + bottomT * p1.x,
              y: (1-bottomT) * p0.y + bottomT * p1.y,
              z: (1-bottomT) * p0.z + bottomT * p1.z};
        out0 -= 8;
    } else if(out1 >= 8) {
        p1 = {x: (1-bottomT) * p0.x + bottomT * p1.x,
              y: (1-bottomT) * p0.y + bottomT * p1.y,
              z: (1-bottomT) * p0.z + bottomT * p1.z};
        out0 -= 8;
    }
    //TOP
    if(out0 >= 4) {
        p0 = {x: (1-topT) * p0.x + topT * p1.x,
              y: (1-topT) * p0.y + topT * p1.y,
              z: (1-topT) * p0.z + topT * p1.z};
        out0 -= 4;
    } else if(out1 >= 4) {
        p1 = {x: (1-topT) * p0.x + topT * p1.x,
              y: (1-topT) * p0.y + topT * p1.y,
              z: (1-topT) * p0.z + topT * p1.z};
        out1 -= 4;
    }
    //FAR
    if(out0 >= 2) {
        p0 = {x: (1-farT) * p0.x + farT * p1.x,
              y: (1-farT) * p0.y + farT * p1.y,
              z: (1-farT) * p0.z + farT * p1.z};
              out0 -= 2;
    } else if(out1 >= 2) {
        p1 = {x: (1-farT) * p0.x + farT * p1.x,
              y: (1-farT) * p0.y + farT * p1.y,
              z: (1-farT) * p0.z + farT * p1.z};
              out1 -= 2;
    }
    //NEAR
    if(out0 >= 1) {
        p0 = {x: (1-nearT) * p0.x + nearT * p1.x,
              y: (1-nearT) * p0.y + nearT * p1.y,
              z: (1-nearT) * p0.z + nearT * p1.z};
    } else if(out1 >= 2) {
        p1 = {x: (1-nearT) * p0.x + nearT * p1.x,
              y: (1-nearT) * p0.y + nearT * p1.y,
              z: (1-nearT) * p0.z + nearT * p1.z};
        }

    result = {p0, p1};

    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    console.log("clipping\nx: " + p0.x + " y: " + p0.y + " z: " + p0.z + "\nx: " + p1.x + " y: " + p1.y + " z: " + p1.z);
    console.log("out0: " + out0 + " out1: " + out1);
    // TODO: implement clipping here!

    //trivial accept
    if(out0 == 0 && out1 == 0) {
        console.log("clipLinePerspective: Trivial Accept");
        result = {pt0: p0, pt1: p1};
        return result;
    } 
    //trivial reject
    else if((out0 & out1) != 0) {
        console.log("clipLinePerspective: Trivial Reject");
        return result;
    }

    let leftT = ((-1 * p0.x) + p0.z) / (Math.abs(p0.x - p1.x) - Math.abs(p0.z - p1.z));
    let rightT = (p0.x + p0.z) / (-1 * (Math.abs(p0.x - p1.x)) - Math.abs(p0.z - p1.z));
    let bottomT = ((p0.y * -1) + p0.z) / (Math.abs(p0.y - p1.y) - Math.abs(p0.z - p1.z));
    let topT = (p0.y + p0.z) / ((-1 * Math.abs(p0.y - p1.y)) - Math.abs(p0.z - p1.z));
    let nearT = (p0.z - z_min) / (-1 * (Math.abs(p0.z - p1.z)));
    let farT = ((-1 * p0.z) - 1) / (Math.abs(p0.z - p1.z));

    console.log("leftT: " + leftT + " rightT: " + rightT + " bottomT: " + bottomT + " topT: " + topT + " nearT: " + nearT + " farT: " + farT);

    //x = (1-t) · x0 + t · x1
    //y = (1-t) · y0 + t · y1
    //z = (1-t) · z0 + t · z1

    //LEFT
    if(out0 >= 32) {
        p0 = {x: (1-leftT) * p0.x + leftT * p1.x,
              y: (1-leftT) * p0.y + leftT * p1.y,
              z: (1-leftT) * p0.z + leftT * p1.z};
        out0 -= 32;
    } else if(out1 >= 32) {
        p1 = {x: (1-leftT) * p0.x + leftT * p1.x,
              y: (1-leftT) * p0.y + leftT * p1.y,
              z: (1-leftT) * p0.z + leftT * p1.z};
        out1 -= 32;
    }
    //RIGHT
    if(out0 >= 16) {
        p0 = {x: (1-rightT) * p0.x + rightT * p1.x,
              y: (1-rightT) * p0.y + rightT * p1.y,
              z: (1-rightT) * p0.z + rightT * p1.z};
        out0 -= 32;
    } else if(out1 >= 16) {
        p1 = {x: (1-rightT) * p0.x + rightT * p1.x,
              y: (1-rightT) * p0.y + rightT * p1.y,
              z: (1-rightT) * p0.z + rightT * p1.z};
        out1 -= 32;
    }
    //BOTTOM
    if(out0 >= 8) {
        p0 = {x: (1-bottomT) * p0.x + bottomT * p1.x,
              y: (1-bottomT) * p0.y + bottomT * p1.y,
              z: (1-bottomT) * p0.z + bottomT * p1.z};
        out0 -= 8;
    } else if(out1 >= 8) {
        p1 = {x: (1-bottomT) * p0.x + bottomT * p1.x,
              y: (1-bottomT) * p0.y + bottomT * p1.y,
              z: (1-bottomT) * p0.z + bottomT * p1.z};
        out0 -= 8;
    }
    //TOP
    if(out0 >= 4) {
        p0 = {x: (1-topT) * p0.x + topT * p1.x,
              y: (1-topT) * p0.y + topT * p1.y,
              z: (1-topT) * p0.z + topT * p1.z};
        out0 -= 4;
    } else if(out1 >= 4) {
        p1 = {x: (1-topT) * p0.x + topT * p1.x,
              y: (1-topT) * p0.y + topT * p1.y,
              z: (1-topT) * p0.z + topT * p1.z};
        out1 -= 4;
    }
    //FAR
    if(out0 >= 2) {
        p0 = {x: (1-farT) * p0.x + farT * p1.x,
              y: (1-farT) * p0.y + farT * p1.y,
              z: (1-farT) * p0.z + farT * p1.z};
              out0 -= 2;
    } else if(out1 >= 2) {
        p1 = {x: (1-farT) * p0.x + farT * p1.x,
              y: (1-farT) * p0.y + farT * p1.y,
              z: (1-farT) * p0.z + farT * p1.z};
              out1 -= 2;
    }
    //NEAR
    if(out0 >= 1) {
        p0 = {x: (1-nearT) * p0.x + nearT * p1.x,
              y: (1-nearT) * p0.y + nearT * p1.y,
              z: (1-nearT) * p0.z + nearT * p1.z};
    } else if(out1 >= 2) {
        p1 = {x: (1-nearT) * p0.x + nearT * p1.x,
              y: (1-nearT) * p0.y + nearT * p1.y,
              z: (1-nearT) * p0.z + nearT * p1.z};
        }

    // result
    result = {pt0: p0, pt1: p1};
    console.log("departing clipLinePerspective.\nResult:");
    console.log(result);
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {

    console.log("Drawing line...");
    console.log("x1: " + x1 + " x2: " + x2 + " y1: " + y1 + " y2: " + y2);
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
