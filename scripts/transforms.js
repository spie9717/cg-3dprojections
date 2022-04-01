// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let translate = new Matrix(4, 4);
    Mat4x4Translate(translate, scene.prp.x, scene.prp.y, scene.prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    
    //need to normalize n and u
    /*
    let n = scene.prp - scene.srp;
    let u = scene.vup * n;
    let v = n * u;
    */ 

    // 3. shear such that CW is on the z-axis
    let shear = new Matrix(4, 4);
    let dopx = (LEFT) + (RIGHT) / 2;
    let dopy = (BOTTOM) + (TOP) / 2;
    let dopz = NEAR;
    let shx = (dopx * -1) / dopz;
    let shy = (dopy * -1) / dopz;
    Mat4x4ShearXY(shear, shx, shy);
    // 4. translate near clipping plane to origin
    let tpar = new Matrix(4, 4);
    Mat4x4TranslateNear(tpar, NEAR);
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let scale = new Matrix(4, 4);
    let sx = 2 / (RIGHT - LEFT);
    let sy = 2 / (TOP - BOTTOM);
    let sz = 1 / FAR;
    Mat4x4Scale(scale, sx, sy, sz);
    //...
    let transform = Matrix.multiply(translate, rotate, shear, tpar, scale);
    // return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    // mpar.values = ...;
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    // mper.values = ...;
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, -tx],
                     [0, 1, 0, -ty],
                     [0, 0, 1, -tz],
                     [0, 0, 0, 1]];
}

function Mat4x4TranslateNear(mat4x4, near) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, near],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
