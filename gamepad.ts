// A content script that will run on the actual page

class GamepadBrowse {
	private state: ControllerState;
	private view: HTMLElement;	
	private padIndex: number;
	private frame: number;
	private disabled: boolean = false;
	private AXES_THRESHOLD = 0.1;
	private SCROLL_EXPONENT = 6;

	constructor(view: HTMLElement) {
		let debugView = document.createElement("div");
		debugView.style.position = "fixed";
		debugView.style.left = "0px";
		debugView.style.bottom = "0px";
		debugView.style.width = "100%";
		debugView.style.height = "30px";
		debugView.style.background = "lightgreen";
		debugView.style.color = "white";

		document.body.appendChild(debugView);
		
		this.view = debugView;
		this.state = new ControllerState();
		window.addEventListener("gamepadconnected", (e: GamepadEvent) => this.connect(e));
		window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => this.connect(e));
	}

	connect(e) {
		this.padIndex = e.gamepad.index;
		console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
		window.cancelAnimationFrame(this.frame);
		this.state.resetAxes(this.pad.axes)
		this.gameLoop();
	}

	disconnect() {
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
		let yStick = this.state.axes[3];
		if (Math.abs(yStick) > this.AXES_THRESHOLD) {
			let posNeg = (this.state.axes[3] > 0 ? 1 : -1),
				adjustment = Math.pow(yStick + posNeg, this.SCROLL_EXPONENT);
			window.scroll(window.scrollX, window.scrollY + (posNeg * adjustment));
		}

		// Xbox "B" button for going back. Pause controller input for a sec
		if (btns[Button.Button2] || btns[Button.DPadLeft]) {
			this.disabled = true;
			window.history.go(-1);
			setTimeout(() => this.disabled = false, 1000);
			return;
		}

		if (btns[Button.DPadRight]) {
			this.disabled = true;
			window.history.go(1);
			setTimeout(() => this.disabled = false, 1000);
			return;
		}
	}
}

class ControllerState {
	private buttonsPressed: { [id: number]: GamepadButton} = {};
	private baseAxes: number[] = [];
	private _axes: number[] = [0, 0, 0, 0];

	resetAxes(axes: number[]) {
		this.baseAxes = axes;
	}

	get axes() {
		return this._axes;
	}

	set axes(axes: number[]) {
		this._axes = axes.map((val, i) => val - this.baseAxes[i]);
	}

	getButtonsPressed() {
		return this.buttonsPressed;
	}

	press(btn: GamepadButton, type: Button) {
		this.buttonsPressed[type] = btn;
	}

	release(type: Button) {
		if (this.buttonsPressed[type]) {
			delete this.buttonsPressed[type];
		}
	}
}

enum Button {
	Button1 = 0,
	Button2 = 1,
	Button3 = 2,
	Button4 = 3,
	ShoulderTopLeft = 4,
	ShoulderTopRight = 5,
	ShoulderBottomLeft = 6,
	ShoulderBottomRight = 7,
	Select = 8,
	Start = 9,
	StickButtonLeft = 10,
	StickButtonRight = 11,
	DPadUp = 12,
	DPadDown = 13,
	DPadLeft = 14,
	DPadRight = 15,
	Vendor = 16
}

window.addEventListener("DOMContentLoaded", () => new GamepadBrowse(document.getElementById("game")));