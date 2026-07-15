/**
 * 拖曳互動:
 * - 按在貼紙上拖曳 → 轉動該層(依拖曳方向決定轉軸與正負)
 * - 按在背景拖曳 → 旋轉整體視角
 */
function attachControls(sceneEl, cubeEl, cube) {
  'use strict';

  var viewX = -28, viewY = -38;

  function renderView() {
    cubeEl.style.transform = 'rotateX(' + viewX + 'deg) rotateY(' + viewY + 'deg)';
  }

  // 世界向量 → 螢幕方向(套用與 .cube 相同的 rotateX(viewX) rotateY(viewY),忽略透視)
  function screenDir(v) {
    var ry = viewY * Math.PI / 180, rx = viewX * Math.PI / 180;
    var x = v[0] * Math.cos(ry) + v[2] * Math.sin(ry);
    var y = v[1];
    var z = -v[0] * Math.sin(ry) + v[2] * Math.cos(ry);
    return [x, y * Math.cos(rx) - z * Math.sin(rx)];
  }

  var drag = null; // {mode:'view'} 或 {mode:'turn', cubie, normal, startX, startY, done}
  var lastX = 0, lastY = 0;

  sceneEl.addEventListener('pointerdown', function (e) {
    var info = cube.faceAt(e.target);
    if (info && !cube.isBusy()) {
      drag = {
        mode: 'turn',
        cubie: info.cubie,
        normal: RMath.matVec(info.cubie.orient, info.local), // 目前的世界法向量
        startX: e.clientX, startY: e.clientY,
        done: false
      };
    } else {
      drag = { mode: 'view' };
      sceneEl.classList.add('dragging');
    }
    lastX = e.clientX; lastY = e.clientY;
    sceneEl.setPointerCapture(e.pointerId);
  });

  sceneEl.addEventListener('pointermove', function (e) {
    if (!drag) return;

    if (drag.mode === 'view') {
      viewY += (e.clientX - lastX) * 0.4;
      viewX -= (e.clientY - lastY) * 0.4;
      viewX = Math.max(-90, Math.min(90, viewX));
      lastX = e.clientX; lastY = e.clientY;
      renderView();
      return;
    }

    if (drag.done) return;
    var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (dx * dx + dy * dy < 15 * 15) return; // 拖曳距離門檻

    // 在貼紙平面上找出與拖曳方向最一致的切線方向 t
    var n = drag.normal;
    var nAxis = n[0] !== 0 ? 0 : (n[1] !== 0 ? 1 : 2);
    var best = null, bestScore = -Infinity;
    for (var axis = 0; axis < 3; axis++) {
      if (axis === nAxis) continue;
      for (var s = -1; s <= 1; s += 2) {
        var t = [0, 0, 0];
        t[axis] = s;
        var p = screenDir(t);
        var score = p[0] * dx + p[1] * dy;
        if (score > bestScore) { bestScore = score; best = t; }
      }
    }

    // 繞軸 a = n × t 轉 +90° 時,貼紙會朝 t 方向移動
    var a = RMath.cross(n, best);
    var aAxis = a[0] !== 0 ? 0 : (a[1] !== 0 ? 1 : 2);
    drag.done = true;
    cube.enqueue({
      axis: 'xyz'[aAxis],
      layer: drag.cubie.pos[aAxis],
      dir: a[aAxis],
      record: true,
      ms: cube.moveMs
    });
  });

  sceneEl.addEventListener('pointerup', function () {
    drag = null;
    sceneEl.classList.remove('dragging');
  });

  renderView();
}
