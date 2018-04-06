import ControllerState from "./controllerState";
import { Button, MessageRequestAction, debounce, click } from "./utils";

export default class GamepadBrowse {
	private state: ControllerState;
	private view: HTMLElement;
	private cursorEl: HTMLElement;
	private cursorTimeout: number;
	private padIndex: number;
	private frame: number;
	private disabled: boolean = false;
	private AXES_THRESHOLD = 0.1;
	private SCROLL_EXPONENT = 6;
	private CURSOR_EXPONENT = 4;
	
	constructor(view: HTMLElement) {
		let debugView = document.createElement("div");
		debugView.style.position = "fixed";
		debugView.style.left = "0px";
		debugView.style.bottom = "0px";
		debugView.style.width = "100%";
		debugView.style.height = "30px";
		debugView.style.background = "lightgreen";
		debugView.style.color = "white";

		let cursor = document.createElement("div");
		cursor.style.background = "#000000";
		cursor.style.width = "20px";
		cursor.style.height = "20px";
		cursor.style.borderRadius = "10px";
		cursor.style.top = ((window.innerHeight / 2) - 10) + "px";
		cursor.style.left = ((window.innerWidth / 2) - 10) + "px";
		cursor.style.display = "none";
		cursor.style.zIndex = "9999";
		cursor.style.position = "fixed";
		cursor.style.opacity = "0.5";

		document.body.appendChild(debugView);
		document.body.appendChild(cursor);
		
		this.view = debugView;
		this.cursorEl = cursor;
		this.state = new ControllerState();
		window.addEventListener("gamepadconnected", (e: GamepadEvent) => this.connect(e));
		window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => this.disconnect(e));
	}

	connect(e) {
		this.padIndex = e.gamepad.index;
		console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
		window.cancelAnimationFrame(this.frame);
		this.state.resetAxes(this.pad.axes)
		this.gameLoop();
	}

	disconnect(e) {
		window.cancelAnimationFrame(this.frame);
		this.padIndex = null;
	}

	gameLoop() {
		let done = () => this.frame = window.requestAnimationFrame(() => this.gameLoop());

		if (this.disabled) {
			done();
			return;
		}

		// Check for active buttons
		for (let i = 0, j = this.pad.buttons.length; i < j; i++) {
			let btn = this.pad.buttons[i];
			if (this.isPressed(btn)) {
				this.state.press(btn, Button[Button[i]]);
			} else {
				this.state.release(Button[Button[i]]);
			}
		}

		// Update the axes in the state
		this.state.axes = this.pad.axes;

		// Update UI
		this.updateWindowState();

		done();
	}

	get pad(): Gamepad {
		return navigator.getGamepads()[this.padIndex];
	}

	isPressed(button: GamepadButton) {
		return button.pressed || (<any>button).touched || <any>button == 1;
	}

	updateWindowState() {
		let btns = this.state.getButtonsPressed();

		if (this.view) {
			this.view.innerHTML = `Buttons pressed: ${Object.keys(btns).map(key => Button[key] + " " + btns[key].value).join(",")}; Axes: ${this.state.axes.join(",")}`;
		}

		// Start scrolling?
		let yRightStick = this.state.axes[3];
		if (Math.abs(yRightStick) > this.AXES_THRESHOLD) {
			let posNeg = (this.state.axes[3] > 0 ? 1 : -1),
				adjustment = Math.pow(yRightStick + posNeg, this.SCROLL_EXPONENT);
			window.scroll(window.scrollX, window.scrollY + (posNeg * adjustment));
		}

		// Aiming
		let xLeftStick = this.state.axes[0],
			yLeftStick = this.state.axes[1];
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
	}

	private changeHistory = debounce((direction) => window.history.go(direction), 1000);
	
	private focusTab = debounce((btns: Button) => {
		return chrome.runtime.sendMessage({ action: MessageRequestAction.TabSwitch, data: { move: btns[Button.ShoulderTopRight] ? "next" : "prev" } }, function (response) {
			console.log("???", response);
		});
	}, 1000);
}