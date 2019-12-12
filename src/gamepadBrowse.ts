import { log } from "./log";
import ControllerManager from "./controllerManager";

export default class GamepadBrowse {
	private view: HTMLElement;
	private controllerManager: ControllerManager;
	private padIndex: number;
	private frame: number;
	private disabled: boolean = false;

	constructor() {
		let debugView = document.createElement("div");
		
		debugView.style.position = "fixed";
		debugView.style.left = "0px";
		debugView.style.bottom = "0px";
		debugView.style.width = "100%";
		debugView.style.height = "30px";
		debugView.style.background = "purple";
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
		this.controllerManager = new ControllerManager(this.view, cursor);
		window.addEventListener("gamepadconnected", (e: GamepadEvent) => this.connect(e));
		window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => this.disconnect(e));
	}

	connect(e: GamepadEvent) {
		this.padIndex = e.gamepad.index;
		log("Gamepad connected at index %d: %s. %d buttons, %d axes.", this.padIndex, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
		window.cancelAnimationFrame(this.frame);
		this.disabled = false;
		this.gameLoop();
	}

	disconnect(e: GamepadEvent) {
		window.cancelAnimationFrame(this.frame);
		this.disabled = true;
		this.padIndex = null;
	}

	gameLoop() {
		if (this.disabled) {
			return;
		}

		this.controllerManager.run(navigator.getGamepads()[this.padIndex]);

		this.frame = window.requestAnimationFrame(() => this.gameLoop());
	}
}