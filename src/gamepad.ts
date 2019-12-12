// A content script that will run on the actual page
import GamepadBrowse from "./gamepadBrowse";
window.addEventListener("DOMContentLoaded", () => new GamepadBrowse());