/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Input Manager (Keyboard & Touch Controls)
 */

export const input = {
  keys: {},
  pressed: {},
  touchControlsVisible: false,

  init() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.pressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.initTouch();
  },

  update() {
    // Clear single-frame press buffer
    this.pressed = {};
  },

  isDown(code) {
    if (code === 'UP') return this.keys['ArrowUp'] || this.keys['KeyW'];
    if (code === 'DOWN') return this.keys['ArrowDown'] || this.keys['KeyS'];
    if (code === 'LEFT') return this.keys['ArrowLeft'] || this.keys['KeyA'];
    if (code === 'RIGHT') return this.keys['ArrowRight'] || this.keys['KeyD'];
    if (code === 'ACTION' || code === 'SPACE') return this.keys['Space'];
    if (code === 'ENTER') return this.keys['Enter'];
    if (code === 'ESC') return this.keys['Escape'];
    return !!this.keys[code];
  },

  isPressed(code) {
    if (code === 'UP') return this.pressed['ArrowUp'] || this.pressed['KeyW'];
    if (code === 'DOWN') return this.pressed['ArrowDown'] || this.pressed['KeyS'];
    if (code === 'LEFT') return this.pressed['ArrowLeft'] || this.pressed['KeyA'];
    if (code === 'RIGHT') return this.pressed['ArrowRight'] || this.pressed['KeyD'];
    if (code === 'ACTION' || code === 'SPACE') return this.pressed['Space'];
    if (code === 'ENTER') return this.pressed['Enter'];
    if (code === 'ESC') return this.pressed['Escape'];
    return !!this.pressed[code];
  },

  simulateKey(code, isDown) {
    if (isDown) {
      if (!this.keys[code]) this.pressed[code] = true;
      this.keys[code] = true;
    } else {
      this.keys[code] = false;
    }
  },

  initTouch() {
    // Detect mobile touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.touchControlsVisible = true;
      const touchOverlay = document.getElementById('touch-controls');
      if (touchOverlay) touchOverlay.style.display = 'flex';
    }

    const bindButton = (id, keyCode) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const handleDown = (e) => {
        e.preventDefault();
        this.simulateKey(keyCode, true);
        btn.classList.add('active');
      };
      const handleUp = (e) => {
        e.preventDefault();
        this.simulateKey(keyCode, false);
        btn.classList.remove('active');
      };
      btn.addEventListener('touchstart', handleDown, { passive: false });
      btn.addEventListener('touchend', handleUp, { passive: false });
      btn.addEventListener('mousedown', handleDown);
      btn.addEventListener('mouseup', handleUp);
      btn.addEventListener('mouseleave', handleUp);
    };

    bindButton('touch-up', 'ArrowUp');
    bindButton('touch-down', 'ArrowDown');
    bindButton('touch-left', 'ArrowLeft');
    bindButton('touch-right', 'ArrowRight');
    bindButton('touch-a', 'Space');
    bindButton('touch-b', 'Enter');
  }
};
