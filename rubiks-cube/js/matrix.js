/**
 * 3x3 整數矩陣與向量工具。
 * 座標系與 CSS 相同:x 向右、y 向下、z 朝向觀察者。
 */
var RMath = (function () {
  'use strict';

  function identity() { return [1,0,0, 0,1,0, 0,0,1]; }

  function matMul(a, b) {
    var r = new Array(9);
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        r[i*3+j] = a[i*3]*b[j] + a[i*3+1]*b[3+j] + a[i*3+2]*b[6+j];
    return r;
  }

  function matVec(m, v) {
    return [
      m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
      m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
    ];
  }

  // 與 CSS rotateX/rotateY/rotateZ(90deg * dir) 一致的整數矩陣
  function rotMatrix(axis, dir) {
    if (axis === 'x') return [1,0,0, 0,0,-dir, 0,dir,0];
    if (axis === 'y') return [0,0,dir, 0,1,0, -dir,0,0];
    return [0,-dir,0, dir,0,0, 0,0,1]; // z
  }

  function cross(a, b) {
    return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
  }

  return { identity: identity, matMul: matMul, matVec: matVec, rotMatrix: rotMatrix, cross: cross };
})();
