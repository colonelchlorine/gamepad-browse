import Controller from "./controller";
import { Button, MessageRequestAction, debounce, click } from "./utils";
import { toggleDebug, log } from "./log";
import ControllerManager from "./controllerManager";

export default class GamepadBrowse {
	private view: HTMLElement;
	private controllerView: ControllerManager;
	private bodyEl: HTMLElement = document.getElementsByTagName("body")[0];
	private htmlEl: HTMLElement = document.getElementsByTagName("html")[0];
	private padIndex: number;
	private frame: number;
	private disabled: boolean = false;

	constructor(view: HTMLElement) {
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
		this.controllerView = new ControllerManager(this.view, cursor);
		window.addEventListener("gamepadconnected", (e: GamepadEvent) => this.connect(e));
		window.addEventListener("gamepaddisconnected", (e: GamepadEvent) => this.disconnect(e));
	}

	connect(e) {
		this.padIndex = e.gamepad.index;
		log("Gamepad connected at index %d: %s. %d buttons, %d axes.", this.padIndex, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
		window.cancelAnimationFrame(this.frame);
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

		this.controllerView.run(this.pad);

		done();
	}

	get pad(): Gamepad {
		return navigator.getGamepads()[this.padIndex];
	}
}