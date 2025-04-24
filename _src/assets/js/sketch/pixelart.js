window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pixel-canvas');
    if (!canvas) return;
  
    // read config
    const src   = canvas.dataset.src;
    const SCALE = parseInt(canvas.dataset.scale, 10) || 4;
    const FPS   = parseInt(canvas.dataset.fps,   10) || 120; // higher FPS
    const STEP  = parseInt(canvas.dataset.step,  10) || 5;   // draw 5 pixels/tick
    const ORDER = canvas.dataset.order || 'row';
  
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const cw = img.width, ch = img.height;
      canvas.width  = cw * SCALE;
      canvas.height = ch * SCALE;
  
      // sample pixels offscreen
      const hidden = document.createElement('canvas');
      hidden.width  = cw; hidden.height = ch;
      const hctx = hidden.getContext('2d');
      hctx.drawImage(img, 0, 0);
      const data = hctx.getImageData(0, 0, cw, ch).data;
  
      // build coordinate list
      let coords = [];
      for (let y=0; y<ch; y++)
        for (let x=0; x<cw; x++)
          coords.push({x,y});
  
      if (ORDER==='column') {
        coords.sort((a,b)=>a.x-b.x||a.y-b.y);
      } else if (ORDER==='random') {
        for (let i=coords.length-1; i>0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [coords[i],coords[j]] = [coords[j],coords[i]];
        }
      }
  
      const interval = 1000 / FPS;
      let i = 0;
      function step() {
        // draw STEP pixels this tick
        for (let n=0; n<STEP && i<coords.length; n++, i++) {
          const {x,y} = coords[i];
          const idx = (y*cw + x)*4;
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]/255;
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);
        }
        if (i < coords.length) setTimeout(step, interval);
      }
      step();
    };
  });
  