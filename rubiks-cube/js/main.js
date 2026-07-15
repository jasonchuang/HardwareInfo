/** 主程式:建立方塊、掛上拖曳控制、綁定按鈕與狀態列。 */
(function () {
  'use strict';

  var cubeEl = document.getElementById('cube');
  var sceneEl = document.getElementById('scene');
  var scrambleBtn = document.getElementById('scrambleBtn');
  var solveBtn = document.getElementById('solveBtn');
  var statusEl = document.getElementById('status');

  function updateUI() {
    var busy = cube.isBusy();
    scrambleBtn.disabled = busy;
    solveBtn.disabled = busy || cube.historyLength() === 0;
    statusEl.textContent = busy
      ? '轉動中…(剩餘 ' + cube.pendingCount() + ' 步)'
      : (cube.historyLength() ? '已轉 ' + cube.historyLength() + ' 步,按 Solve 還原' : '已還原');
  }

  var cube = RubikCube(cubeEl, { onChange: updateUI });

  attachControls(sceneEl, cubeEl, cube);

  scrambleBtn.addEventListener('click', cube.scramble);
  solveBtn.addEventListener('click', cube.solve);

  updateUI();
})();
