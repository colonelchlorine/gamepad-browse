import { Button } from "./utils";
import RollingAverage from "./rollingAverage";

const EMA_THRESHOLD = 0.05;

export default class ControllerState {
	private buttonsPressed: { [id: number]: GamepadButton} = {};
	private baseAxes: number[] = [];
	private _axes: number[] = [0, 0, 0, 0];
	private rollingAxes = [new RollingAverage(), new RollingAverage(), new RollingAverage(), new RollingAverage()];

	resetAxes(axes: number[]) {
		this.baseAxes = axes;
	}

	get axes() {
		return this._axes;
	}

	set axes(axes: number[]) {
		let newBase: number[] = [];
		axes.forEach((ax, i) => {
			this.rollingAxes[i].add(ax);

			// Reset the base if average is almost zero
			let diff = Math.abs(ax - this.rollingAxes[i].average);
			if (i == 3) {
				console.log(`Controller: ${ax}. Avg: ${this.rollingAxes[i].average}`);
			}
			newBase[i] = diff < EMA_THRESHOLD ? ax : this.baseAxes[i];
		});
		this.baseAxes = newBase;

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
			;delete this.buttonsPressed[type];
		}
	}
}