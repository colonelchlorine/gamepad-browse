import { Button } from "./utils";

export default class ControllerState {
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