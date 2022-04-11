// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let translate = new Matrix(4, 4);
    Mat4x4Translate(translate, scene.prp.x, scene.prp.y, scene.prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let rotate = new Matrix(4, 4);
    let n = normalize(scene.prp - scene.srp);
    let u = normalize(scene.vup.cross(n));
    let v = n.cross(u);
    Mat4x4Rotate(rotate, u, v, n);
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
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let translate2 = new Matrix(4, 4);
    Mat4x4Translate(translate2, scene.prp.x, scene.prp.y, scene.prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let rotate2 = new Matrix(4, 4);
    let n = normalize(scene.prp - scene.srp);
    let u = normalize(scene.vup.cross(n));
    let v = n.cross(u);
    Mat4x4Rotate(rotate2, u, v, n);
    // 3. shear such that CW is on the z-axis
    let shear2 = new Matrix(4, 4);
    let dopx = (LEFT) + (RIGHT) / 2;
    let dopy = (BOTTOM) + (TOP) / 2;
    let dopz = NEAR;
    let shx = (dopx * -1) / dopz;
    let shy = (dopy * -1) / dopz;
    Mat4x4ShearXY(shear2, shx, shy);
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let scale2 = new Matrix(4, 4);
    let sx = (2 * NEAR) / ((RIGHT - LEFT) * FAR);
    let sy = (2 * NEAR) / ((TOP - BOTTOM) * FAR);
    let sz = (1 / FAR);
    Mat4x4Scale(scale2, sx, sy, sz);
    // ...
    let transform2 = Matrix.multiply(translate2, rotate2, shear2, scale2);
    return transform2;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    mpar.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, 0, 1]];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mpar.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, -1, 0]];
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

function Mat4x4Rotate(mat4x4, u, v, n) {
    mat4x4.values = [[u[0], u[1], u[2], 0],
                     [v[0], v[1], v[2], 0],
                     [n[0], n[1], n[2], 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, Math.cos(theta), (Math.sin(theta))*(-1), 0],
                     [0, Math.sin(theta), Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), 0, Math.sin(theta), 0],
                     [0, 1, 0, 0],
                     [(Math.sin(theta))*(-1), 0, Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), (Math.sin(theta))*(-1), 0, 0],
                     [Math.sin(theta), Math.cos(theta), 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
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
