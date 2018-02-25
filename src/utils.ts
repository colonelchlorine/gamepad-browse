export function debounce(method: Function, delay: Number) {
	let timeout;
	return (...args) => {
		let callIt = !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(() => timeout = null, delay);

		if (callIt) {
			method.apply(this, args);
		}
	}
}

export function click(x,y){
    var ev = document.createEvent("MouseEvent");
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        x, y, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

export enum Button {
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