import { Button } from "./utils";
import RollingAverage from "./rollingAverage";
import { log } from "./log";

const EMA_THRESHOLD = 0.00005;

enum Axes {
	LEFT_X = 1,
	LEFT_Y = 2,
	RIGHT_X = 2,
	RIGHT_Y = 3
}

export default class ControllerState {
	private buttonsPressed: { [id: number]: GamepadButton} = {};
	private offset: number[] = [];
	private _axes: number[] = [0, 0, 0, 0];
	private rollingAxes = [new RollingAverage(), new RollingAverage(), new RollingAverage(), new RollingAverage(0.5)];

	get axes() {
		return this._axes;
	}

	set axes(axes: number[]) {
		let newBase: number[] = [];
		axes.forEach((ax, i) => {
			this.rollingAxes[i].add(ax);

			// TODO: Problem here is the rolling averages == ax IF you're using
			// the stick in a relatively constant position. How can I determine
			// if it's "not" being used??

			// Reset the base if average is almost zero
			let diff = Math.abs(ax - this.rollingAxes[i].average);
			if (i == Axes.RIGHT_Y && diff !== 0) {
				log(`Controller: ${ax}. Avg: ${this.rollingAxes[i].average}`);
			}
			newBase[i] = diff === 0 ? ax : this.offset[i];
		});
		this.offset = newBase;

		// Adjust new value based on offset
		this._axes = axes.map((val, i) => val - this.offset[i]);
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