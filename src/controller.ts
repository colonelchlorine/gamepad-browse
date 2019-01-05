import { Button } from "./utils";
import RollingAverage from "./rollingAverage";
import { log } from "./log";

enum Axes {
	LEFT_X = 1,
	LEFT_Y = 2,
	RIGHT_X = 2,
	RIGHT_Y = 3
}

const BUTTON_DELAY = 500;

export default class ControllerState {
	private _buttons = [];
	private _buttonTimers: number[] = [];
	private buttonsPressed: { [id: number]: GamepadButton} = {};
	private offset: number[] = null;
	private _axes: number[] = [0, 0, 0, 0];

	get axes() {
		return this._axes;
	}

	set axes(axes: number[]) {
		// Start with a 'reset'
		if (this.offset === null) {
			this.offset = axes;
		}

		// Adjust new value based on offset
		this._axes = axes.map((val, i) => val - this.offset[i]);
	}

	get buttons() {
		return this._buttons;
	}

	set buttons(buttons: GamepadButton[]) {
		// Check for active buttons
		buttons.forEach((btn, i) => {
			if (this.isPressed(btn)) {
				this.press(btn, Button[Button[i]]);
			} else {
				this.release(Button[Button[i]]);
			}
		});
	}

	isPressed(b: GamepadButton) { return b.pressed || (<any>b).touched || <any>b == 1; };

	getButtonsPressed() {
		return this.buttonsPressed;
	}

	press(btn: GamepadButton, type: Button) {
		if (this._buttonTimers[type]) return;
		
		this._buttonTimers[type] = setTimeout(() => {}, BUTTON_DELAY);
		this.buttonsPressed[type] = btn;
	}

	release(type: Button) {
		clearTimeout(this._buttonTimers[type]);
		if (this.buttonsPressed[type]) {
			delete this.buttonsPressed[type];
		}
	}
}