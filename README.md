# Gamepad Browse

Run
=====
npm install .

TODO
=====
- Switch tabs with the top left/right bumper buttons
    -Fix bug where it needs debounce
- Navigate & highlight anchor tags with the bottom left/right bumpers
- Click "A" to fire onclick event on those anchors
- Govern mouse control to make it easier to click on things that aren't really anchors? Use the left stick for that.
    -Can't control mouse. Built a DOM element to act as a cursor. Looks more like Android round dot. Works well
    -Need to add some more code to reset the axes at some point. It sometimes gets stuck at number higher than threshold (0.5)
     and then keeps drifting off. This happens with scrolling and cursor sometimes.

Nice to have
---
- Start button does f6 and goes to omni bar?
- Hold trigger (which one?) and click to open new tab?
- Open onscreen keyboard somehow?
- Horizontal scroll (not that important rly)