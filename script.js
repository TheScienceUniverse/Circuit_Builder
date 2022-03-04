const media_directory = '..';

var mouse_x = null, mouse_y = null;
var mouse_dx = null, mouse_dy = null;
var selected_component_tool = null;
var component_position = null;

class Component {
	constructor (position_X, position_Y, height, width, rotation, component_image, input_points, output_points) {
		this .position_X = position_X;
		this .position_Y = position_Y;
		this .height = height;
		this .width = width;
		this .rotation = rotation;
		this .component_image = component_image;
		this .input_points = input_points;
		this .output_points = output_points;
	}
}

function init () {
	set_overlay_events ();
	set_circuit_window_listeners ();
}

function set_circuit_window_listeners () {
	let circuit_window = document .getElementById ("circuit-window");
	var component_tool_list = document .getElementsByClassName ("component-tool");

	for (i = 0; i < component_tool_list .length; i++) {
		component_tool_list [i] .addEventListener ("dragstart", (event) => {
			if (event .target .classList [0] == "component-tool") {
				selected_component_tool = event .target;
			}
			
			mouse_dx = event .offsetX;
			mouse_dy = event .offsetY;
		});
	}

	for (i = 0; i < component_tool_list .length; i++) {
		component_tool_list [i] .addEventListener ("drag", (event) => {
			mouse_x = event .clientX;
			mouse_y = event .clientY;
		});
	}

	circuit_window .addEventListener ("dragover", (event) => {
		event .preventDefault ();

		mouse_x = event .clientX;
		mouse_y = event .clientY;
	});

	circuit_window .addEventListener ("drop", (event) => {
		event .preventDefault ();

		if (selected_component_tool .classList [0] == "component-tool") {
			mouse_x = event .clientX;
			mouse_y = event .clientY;
	
			var new_component = document .createElementNS ("http://www.w3.org/2000/svg", "svg");
			new_component .setAttributeNS ("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			
			new_component .setAttribute ("viewBox", "0 0 100 100");
			
			if (selected_component_tool .getAttribute ("alt") == "inductor") {
				new_component .setAttribute ("viewBox", "0 0 170 100");
			}
			
			new_component .setAttribute ("class", "component");
			new_component .innerHTML = get_component_svg_data (selected_component_tool .getAttribute ("alt"));
			new_component .style .left = (mouse_x - 223 - mouse_dx) + "px";
			new_component .style .top = (mouse_y - mouse_dy - 3) + "px";

			event .target .appendChild (new_component);
	
			set_componet_events (new_component);
			selected_component_tool = null;
		}
	});
}

function set_overlay_events () {
	let view_coordinates_overlay = document .getElementById ("circuit-overlay") .children [1];

	document .addEventListener ("mousemove", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;
		view_coordinates_overlay .innerHTML = mouse_x + ", " + mouse_y;
	});
	
	document .addEventListener ("drag", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;
		view_coordinates_overlay .innerHTML = mouse_x + ", " + mouse_y;
	});
}

function set_componet_events (component) {
	let dragging = false;

	component .addEventListener ("mousedown", (event) => {
		//event .preventDefault ();
		position = [event .clientX, event .offsetX, event .clientY, event .offsetY];
		//console .log (position);
		dragging = true;
		console .log (dragging);
	});

	component .addEventListener ("mousemove", (event) => {
		position = [event .clientX, event .offsetX, event .clientY, event .offsetY];
		//console .log (event .clientX, event .clientY);
		console .log (dragging);
	});

	component .addEventListener ("mouseup", (event) => {
		//event .preventDefault ();
		position = [event .clientX, event .offsetX, event .clientY, event .offsetY];
		//console .log (position);
		dragging = false;
		//console .log (event .clientX, event .clientY);
		console .log (dragging);
	});
}
/*
function dragElement (elmnt) {
	var pos1, pos2;
	
	if (document.getElementById(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}
*/
function get_component_svg_data (component_name) {
	let data = null;

	for (var i = 0 ; i < component_svg_data .length; i++) {
		if (component_svg_data [i]["name"] == component_name) {
			data = component_svg_data [i] .data;
			break;
		}
	}

	return data;
}

const component_svg_data = [
	{
		"name" : "dc_power"
		, "data" : '<line x1="45" y1="20" x2="45" y2="80" stroke="black" stroke-width="2"/><line x1="55" y1="35" x2="55" y2="65" stroke="black" stroke-width="2"/><line x1="0" y1="50" x2="45" y2="50" stroke="black" stroke-width="2"/><line x1="55" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "ac_power"
		, "data" : '<circle cx="50" cy="50" r="30" stroke="black" stroke-width="2" fill="white"/><path d="M 30,50 Q 40,30 50,50 T 70,50" stroke="black" stroke-width="2" fill="none"/><line x1="0" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "ground"
		,"data" : '<line x1="50" y1="0" x2="50" y2="50" stroke="black" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="black" stroke-width="2"/><line x1="25" y1="60" x2="75" y2="60" stroke="black" stroke-width="2"/><line x1="35" y1="70" x2="65" y2="70" stroke="black" stroke-width="2"/><line x1="45" y1="80" x2="55" y2="80" stroke="black" stroke-width="2"/><line x1="49" y1="90" x2="51" y2="90" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "resistor"
		,"data" : '<polyline points="20,50 25,40 35,60 45,40 55,60 65,40 75,60 80,50" fill="none" stroke="black" stroke-width="2"/><line x1="0" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "capacitor"
		,"data" : '<line x1="40" y1="20" x2="40" y2="80" stroke="black" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="80" stroke="black" stroke-width="2"/><line x1="0" y1="50" x2="40" y2="50" stroke="black" stroke-width="2"/><line x1="60" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/><rect x="41" y="20" width="18" height="60" fill="white" stroke="none"/>'
	}, {
		"name" : "inductor"
		,"data" : '<path d="M 25,50 A 15 15 0 0 1 70 50" fill="none" stroke="black" stroke-width="3"/><path d="M 50,50 A 15 15 0 0 1 95 50" fill="none" stroke="black" stroke-width="3"/><path d="M 75,50 A 15 15 0 0 1 120 50" fill="none" stroke="black" stroke-width="3"/><path d="M 100,50 A 15 15 0 0 1 145 50" fill="none" stroke="black" stroke-width="3"/><path d="M 70,50 A 10 15 0 0 1 50 50" fill="none" stroke="black" stroke-width="3"/><path d="M 95,50 A 10 15 0 0 1 75 50" fill="none" stroke="black" stroke-width="3"/><path d="M 120,50 A 10 15 0 0 1 100 50" fill="none" stroke="black" stroke-width="3"/><line x1="0" y1="50" x2="26.5" y2="50" stroke="black" stroke-width="3"/><line x1="143.5" y1="50" x2="170" y2="50" stroke="black" stroke-width="3"/>'
	}, {
		"name" : "switch"
		,"data" : '<line x1="0" y1="50" x2="30.5" y2="50" stroke="black" stroke-width="2"/><line x1="30" y1="50" x2="65" y2="25" stroke="black" stroke-width="2"/><line x1="70" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "fuse"
		,"data" : '<rect x="20" y="40" width="60" height="20" fill="white" stroke="black" stroke-width="2"/><line x1="0" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="black" stroke-width="0.5"/><line x1="80" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_buffer_gate"
		,"data" : '<polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><line x1="0" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_not_gate"
		,"data" : '<polygon points="20.5,25 70.5,50 20.5,75" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="50" x2="20.5" y2="50" stroke="black" stroke-width="2"/><line x1="80.5" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_or_gate"
		,"data" : '<path d="M 17.5,25 A 75 55 -25 0 1 75 50 L 75,50 A 75 55 25 0 1 17.5 75 L 17.5,75 A 15 25 0 0 0 17.5 25" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_nor_gate"
		,"data" : '<path d="M 12.5,25 A 75 55 -25 0 1 70 50 L 70,50 A 75 55 25 0 1 12.5 75 L 12.5,75 A 15 25 0 0 0 12.5 25" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="37.5" x2="25" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="25" y2="62.5" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_and_gate"
		,"data" : '<path d="M 22.5,25 L 52.5,25 A 25 25 0 0 1 52.5 75 L 22.5,75 Z" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="37.5" x2="22.5" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="22.5" y2="62.5" stroke="black" stroke-width="2"/><line x1="77.5" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_nand_gate"
		,"data" : '<path d="M 17.5,25 L 47.5,25 A 25 25 0 0 1 47.5 75 L 17.5,75 Z" stroke="black" stroke-width="2" fill="white"/><circle cx="77.5" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="37.5" x2="17.5" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="17.5" y2="62.5" stroke="black" stroke-width="2"/><line x1="82.5" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_xor_gate"
		,"data" : '<path d="M 22.5,25 A 75 55 -25 0 1 80 50 L 80,50 A 75 55 25 0 1 22.5 75 L 22.5,75 A 15 25 0 0 0 22.5 25" stroke="black" stroke-width="2" fill="white"/><path d="M 17,27.5 A 20 25 0 0 1 17 72.5" stroke="black" stroke-width="2" fill="none"/><line x1="0" y1="37.5" x2="35" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="35" y2="62.5" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "binary_xnor_gate"
		,"data" : '<path d="M 17.5,25 A 75 55 -25 0 1 75 50 L 75,50 A 75 55 25 0 1 17.5 75 L 17.5,75 A 15 25 0 0 0 17.5 25" stroke="black" stroke-width="2" fill="white"/><path d="M 12.5,27.5 A 20 25 0 0 1 12.5 72.5" stroke="black" stroke-width="2" fill="none"/><circle cx="80" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="0" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><line x1="0" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><line x1="85" y1="50" x2="100" y2="50" stroke="black" stroke-width="2"/>'
	}
];