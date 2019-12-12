import { IGameLoopRunner } from "./global";
import { Button, MessageRequestAction, debounce, click } from "./utils";
import { toggleDebug } from "./log";

const BUTTON_DELAY = 500;

/**
 * Use a controller to interact with the UI
 */
export default class ControllerManager implements IGameLoopRunner {
	private readonly view: HTMLElement;
	private cursorEl: HTMLElement;
	private cursorTimeout: number;
	private AXES_THRESHOLD = 0.1;
	private SCROLL_EXPONENT = 6;
	private CURSOR_EXPONENT = 4;
	private btnTimers: number[] = [];
	private btnsPressed: { [id: number]: GamepadButton} = {};
	private axesOffset: number[] = [];
	// [left x-axis, left y-axis, right x-axis, right y-axis]
	private axes: number[] = [0, 0, 0, 0];

	constructor(view: HTMLElement, cursorEl: HTMLElement) {
		this.view = view;
		this.cursorEl = cursorEl;
	}

	run(pad: Gamepad) {
		this.adjustButtonsPressed(pad);
		this.adjustAxes(pad);

		if (this.view) {
			this.view.innerHTML = `Buttons pressed: ${Object.keys(this.btnsPressed).map(key => Button[key] + " " + this.btnsPressed[key].value).join(",")}; Axes: ${this.axes.join(",")}; Offset: ${this.axesOffset.join(",")}`;
		} else {
			this.view.innerHTML = "Huh";
		}

		// Start scrolling?
		let yRightStick = this.axes[3];
		if (Math.abs(yRightStick) > this.AXES_THRESHOLD) {
			let posNeg = (this.axes[3] > 0 ? 1 : -1),
				adjustment = Math.pow(yRightStick + posNeg, this.SCROLL_EXPONENT);
			window.scroll(window.scrollX, window.scrollY + (posNeg * adjustment));
		}

		// Aiming
		let xLeftStick = this.axes[0],
			yLeftStick = this.axes[1];
		if (Math.abs(xLeftStick) > this.AXES_THRESHOLD || Math.abs(yLeftStick) > this.AXES_THRESHOLD) {
			// Display it
			clearTimeout(this.cursorTimeout);
			this.cursorTimeout = null;
			this.cursorEl.style.display = "inline-block";

			// Calculate new position
			let xPosNeg = (xLeftStick > 0 ? 1 : -1),
				yPosNeg = (yLeftStick > 0 ? 1 : -1),
				xAdjustment = Math.pow(xLeftStick + xPosNeg, this.CURSOR_EXPONENT),
				yAdjustment = Math.pow(yLeftStick + yPosNeg, this.CURSOR_EXPONENT);

			let newX = parseFloat(this.cursorEl.style.left.replace("px", "")) + (xPosNeg * xAdjustment);
			newX = Math.min(Math.max(0, newX), window.innerWidth);

			let newY = parseFloat(this.cursorEl.style.top.replace("px", "")) + (yPosNeg * yAdjustment);
			newY = Math.min(Math.max(0, newY), window.innerHeight);

			// Update position
			this.cursorEl.style.left = newX + "px";
			this.cursorEl.style.top = newY + "px";
		} else {
			// Set to be hidden after some time
			if (!this.cursorTimeout && this.cursorEl.style.display !== "none") {
				clearTimeout(this.cursorTimeout);
				this.cursorTimeout = setTimeout(() => this.cursorEl.style.display = "none", 3000);
			}
		}

		// Xbox "A" for "clicking"
		if (this.btnsPressed[Button.Button1]) {
			let x = parseFloat(this.cursorEl.style.left.replace("px", "")) + 10,
				y = parseFloat(this.cursorEl.style.top.replace("px", "")) + 10;	
			
			this.cursorEl.style.display = "none";
			
			click(x, y);

			this.cursorEl.style.display = "inline-block";
		}

		// Xbox "B" button for going back. Pause controller input for a sec
		if (this.btnsPressed[Button.Button2] || this.btnsPressed[Button.DPadLeft]) {
			this.changeHistory(-1);
			return;
		}

		if (this.btnsPressed[Button.DPadRight]) {
			this.changeHistory(1);
			return;
		}

		if (this.btnsPressed[Button.ShoulderTopRight] || this.btnsPressed[Button.ShoulderTopLeft]) {
			this.focusTab(this.btnsPressed);
			return;
		}

		// TODO: Use Select / Start option to bring up
		// A "Menu" which gives options on what you'd like to do
		// "Restart", "Toggle debug", etc, etc

		if (this.btnsPressed[Button.Select]) {
			toggleDebug();
		}

		if (this.btnsPressed[Button.Start]) {
			chrome.runtime.sendMessage({ action: MessageRequestAction.Reload }, () => {
				window.location.reload();
			});
		}
	}

	private pressButton(btn: GamepadButton, type: Button) {
		if (this.btnTimers[type]) return;
		
		this.btnTimers[type] = setTimeout(() => {}, BUTTON_DELAY);
		this.btnsPressed[type] = btn;
	}

	private releaseButton(type: Button) {
		clearTimeout(this.btnTimers[type]);
		if (this.btnsPressed[type]) {
			delete this.btnsPressed[type];
		}
	}

	private adjustButtonsPressed(pad: Gamepad) {
		pad.buttons.forEach((b, i) => {
			if (b.pressed || (<any>b).touched || <any>b == 1) {
				this.pressButton(b, Button[Button[i]]);
			} else {
				this.releaseButton(Button[Button[i]]);
			}
		});
	}

	private adjustAxes(pad: Gamepad) {
		let axes = pad.axes;

		// Start with a 'reset'
		// TODO: Ignore offsets for now b/c it's better with just a threshold.
		// Probably want to use some sort of feedback loop to adjust that offset
		if (this.axesOffset.length === 0) {
			this.axesOffset = [0,0,0,0];
		}

		// Adjust new value based on offset
		this.axes = axes.map((val, i) => val - this.axesOffset[i]);
	}

	private changeHistory = debounce((direction) => window.history.go(direction), 1000);
	
	private focusTab = debounce((btns: Button) => {
		return chrome.runtime.sendMessage({ action: MessageRequestAction.TabSwitch, data: { move: btns[Button.ShoulderTopRight] ? "next" : "prev" } }, function (response) {
			console.log("???", response);
		});
	}, 1000);

}