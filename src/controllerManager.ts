import Controller from "./controller";
import { IGameLoopRunner } from "./global";
import { Button, MessageRequestAction, debounce, click } from "./utils";
import { toggleDebug } from "./log";

/**
 * Use a controller to interact with the UI
 */
export default class ControllerManager implements IGameLoopRunner {
	private readonly controller: Controller;
	private readonly view: HTMLElement;
	private cursorEl: HTMLElement;
	private cursorTimeout: number;
	private AXES_THRESHOLD = 0.1;
	private SCROLL_EXPONENT = 6;
	private CURSOR_EXPONENT = 4;

	constructor(view, cursorEl) {
		this.view = view;
		this.cursorEl = cursorEl;
		this.controller = new Controller();
	}

	run(pad: Gamepad) {
		// Update buttons and axes
		this.controller.buttons = pad.buttons;
			this.controller.axes = pad.axes;

		let btns = this.controller.getButtonsPressed();
			
			if (this.view) {
				this.view.innerHTML = `Buttons pressed: ${Object.keys(btns).map(key => Button[key] + " " + btns[key].value).join(",")}; Axes: ${this.controller.axes.join(",")}`;
			}

			// Start scrolling?
			let yRightStick = this.controller.axes[3];
			if (Math.abs(yRightStick) > this.AXES_THRESHOLD) {
				let posNeg = (this.controller.axes[3] > 0 ? 1 : -1),
					adjustment = Math.pow(yRightStick + posNeg, this.SCROLL_EXPONENT);
				window.scroll(window.scrollX, window.scrollY + (posNeg * adjustment));
			}

			// Aiming
			let xLeftStick = this.controller.axes[0],
				yLeftStick = this.controller.axes[1];
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
			if (btns[Button.Button1]) {
				let x = parseFloat(this.cursorEl.style.left.replace("px", "")) + 10,
					y = parseFloat(this.cursorEl.style.top.replace("px", "")) + 10;	
				
				this.cursorEl.style.display = "none";
				
				click(x, y);

				this.cursorEl.style.display = "inline-block";
			}

			// Xbox "B" button for going back. Pause controller input for a sec
			if (btns[Button.Button2] || btns[Button.DPadLeft]) {
				this.changeHistory(-1);
				return;
			}

			if (btns[Button.DPadRight]) {
				this.changeHistory(1);
				return;
			}

			if (btns[Button.ShoulderTopRight] || btns[Button.ShoulderTopLeft]) {
				this.focusTab(btns);
				return;
			}

			// TODO: Use Select / Start option to bring up
			// A "Menu" which gives options on what you'd like to do
			// "Restart", "Toggle debug", etc, etc

			if (btns[Button.Select]) {
				toggleDebug();
			}

			if (btns[Button.Start]) {
				chrome.runtime.sendMessage({ action: MessageRequestAction.Reload }, () => {
					window.location.reload();
				});
			}
	}

	private changeHistory = debounce((direction) => window.history.go(direction), 1000);
	
	private focusTab = debounce((btns: Button) => {
		return chrome.runtime.sendMessage({ action: MessageRequestAction.TabSwitch, data: { move: btns[Button.ShoulderTopRight] ? "next" : "prev" } }, function (response) {
			console.log("???", response);
		});
	}, 1000);

}