/**
 * 魔術方塊狀態、DOM 建立與轉層動畫。
 * 27 個小方塊各以整數位置向量 pos 與方向矩陣 orient 追蹤,
 * 每轉一層就把 90° 旋轉矩陣套進邏輯狀態,不會累積浮點誤差。
 */
function RubikCube(cubeEl, options) {
  'use strict';

  var STEP = 104;          // 每個小方塊的間距 (px)
  var HALF = 48;           // 面片位移 = 小方塊尺寸的一半
  var MOVE_MS = 220;       // 單步轉動時間
  var SOLVE_MS = 130;      // 還原時每步較快
  var SCRAMBLE_COUNT = 20; // 打亂步數

  var onChange = (options && options.onChange) || function () {};

  var AXIS_CSS = { x: 'rotateX', y: 'rotateY', z: 'rotateZ' };
  var AXIS_IDX = { x: 0, y: 1, z: 2 };
  var AXES = ['x', 'y', 'z'];

  // 面的顏色依「初始位置」決定;方向矩陣會把貼紙一起帶著轉。
  var FACES = [
    { cls: 'R', axis: 0, sign:  1, css: 'rotateY(90deg)'  },
    { cls: 'L', axis: 0, sign: -1, css: 'rotateY(-90deg)' },
    { cls: 'D', axis: 1, sign:  1, css: 'rotateX(-90deg)' },
    { cls: 'U', axis: 1, sign: -1, css: 'rotateX(90deg)'  },
    { cls: 'F', axis: 2, sign:  1, css: ''                },
    { cls: 'B', axis: 2, sign: -1, css: 'rotateY(180deg)' }
  ];

  var cubies = [];
  var faceInfo = new WeakMap(); // face 元素 → { cubie, local(局部法向量) }
  var queue = [];               // 待執行的轉動 {axis, layer, dir, record, ms}
  var animating = false;
  var history = [];             // 已套用且未還原的轉動

  for (var x = -1; x <= 1; x++)
    for (var y = -1; y <= 1; y++)
      for (var z = -1; z <= 1; z++) {
        var el = document.createElement('div');
        el.className = 'cubie';
        var pos = [x, y, z];
        var cubie = { el: el, pos: pos, orient: RMath.identity(), stickers: [] };
        FACES.forEach(function (f) {
          var outer = pos[f.axis] === f.sign;
          var face = document.createElement('div');
          face.className = 'face' + (outer ? ' ' + f.cls : '');
          face.style.transform = f.css + ' translateZ(' + HALF + 'px)';
          var local = [0, 0, 0];
          local[f.axis] = f.sign;
          faceInfo.set(face, { cubie: cubie, local: local });
          if (outer) cubie.stickers.push({ local: local, color: f.cls });
          el.appendChild(face);
        });
        cubeEl.appendChild(el);
        cubies.push(cubie);
      }

  function cubieTransform(c, prefix) {
    var m = c.orient;
    var t = 'translate3d(' + (c.pos[0]*STEP) + 'px,' + (c.pos[1]*STEP) + 'px,' + (c.pos[2]*STEP) + 'px)';
    var r = 'matrix3d(' +
      m[0] + ',' + m[3] + ',' + m[6] + ',0,' +
      m[1] + ',' + m[4] + ',' + m[7] + ',0,' +
      m[2] + ',' + m[5] + ',' + m[8] + ',0,' +
      '0,0,0,1)';
    return (prefix || '') + ' ' + t + ' ' + r;
  }

  function render() {
    cubies.forEach(function (c) { c.el.style.transform = cubieTransform(c); });
  }

  // 檢查是否已還原:每個朝向上的所有貼紙顏色一致
  function isSolved() {
    var colorByDir = {};
    for (var i = 0; i < cubies.length; i++) {
      var c = cubies[i];
      for (var j = 0; j < c.stickers.length; j++) {
        var s = c.stickers[j];
        var key = RMath.matVec(c.orient, s.local).join(',');
        if (!(key in colorByDir)) colorByDir[key] = s.color;
        else if (colorByDir[key] !== s.color) return false;
      }
    }
    return true;
  }

  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }

  function runQueue() {
    if (animating) return;
    var move = queue.shift();
    if (!move) {
      if (history.length && isSolved()) history = [];
      onChange();
      return;
    }
    animating = true;
    onChange();

    var idx = AXIS_IDX[move.axis];
    var affected = cubies.filter(function (c) { return c.pos[idx] === move.layer; });
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / move.ms);
      var angle = easeInOut(t) * 90 * move.dir;
      var prefix = AXIS_CSS[move.axis] + '(' + angle + 'deg)';
      affected.forEach(function (c) {
        c.el.style.transform = cubieTransform(c, prefix);
      });
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        var R = RMath.rotMatrix(move.axis, move.dir);
        affected.forEach(function (c) {
          c.pos = RMath.matVec(R, c.pos);
          c.orient = RMath.matMul(R, c.orient);
          c.el.style.transform = cubieTransform(c);
        });
        if (move.record) history.push(move);
        animating = false;
        runQueue();
      }
    }
    requestAnimationFrame(frame);
  }

  function enqueue(move) {
    queue.push(move);
    runQueue();
  }

  function scramble() {
    var prevAxis = null, prevLayer = null;
    for (var i = 0; i < SCRAMBLE_COUNT; i++) {
      var axis, layer;
      do {
        axis = AXES[Math.floor(Math.random() * 3)];
        layer = Math.floor(Math.random() * 3) - 1;
      } while (axis === prevAxis && layer === prevLayer);
      prevAxis = axis; prevLayer = layer;
      enqueue({
        axis: axis,
        layer: layer,
        dir: Math.random() < 0.5 ? 1 : -1,
        record: true,
        ms: MOVE_MS
      });
    }
  }

  function solve() {
    if (!history.length) return;
    var moves = history.slice().reverse();
    history = [];
    moves.forEach(function (m) {
      enqueue({ axis: m.axis, layer: m.layer, dir: -m.dir, record: false, ms: SOLVE_MS });
    });
  }

  render();

  return {
    enqueue: enqueue,
    scramble: scramble,
    solve: solve,
    faceAt: function (el) { return faceInfo.get(el); },
    isBusy: function () { return animating || queue.length > 0; },
    pendingCount: function () { return queue.length + (animating ? 1 : 0); },
    historyLength: function () { return history.length; },
    moveMs: MOVE_MS
  };
}
