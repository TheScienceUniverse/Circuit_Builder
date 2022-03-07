const media_directory = '..';

var mouse_x = null, mouse_y = null;
var mouse_dx = null, mouse_dy = null;
var selected_component_tool = null;
var selected_component = null;
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
	set_circuit_listeners ();
}

function set_circuit_listeners () {
	let circuit = document .getElementById ("circuit");
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

	circuit .addEventListener ("dragover", (event) => {
		event .preventDefault ();

		mouse_x = event .clientX;
		mouse_y = event .clientY;
	});

	circuit .addEventListener ("drop", (event) => {
		event .preventDefault ();

		if (selected_component_tool .classList [0] == "component-tool") {
			mouse_x = event .clientX;
			mouse_y = event .clientY;
	
			var new_component = document .createElementNS ("http://www.w3.org/2000/svg", "g");
			new_component .setAttribute ("class", "component");
			new_component .setAttribute ("draggable", "true");
			new_component .innerHTML = get_component_svg_data (selected_component_tool .getAttribute ("alt"));

			moveComponent (new_component, [mouse_x - 223 - mouse_dx, mouse_y - 3 - mouse_dy]);
			set_componet_events (new_component, [mouse_x - 223 - mouse_dx, mouse_y - 3 - mouse_dy]);
			event .target .appendChild (new_component);
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

function set_componet_events (component, initial_position) {
	var dragging = false;
	var connecting = false;
	// var initial_drag_position;
	let circuit = document .getElementById ("circuit");
	// let current_position = initial_position;
	let old_position = initial_position;
	var connection = null;
	var connections = document .getElementById ("connections");

	component .addEventListener ("mousedown", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;
		// initial_drag_position = [mouse_x, mouse_y];
		old_position = [mouse_x, mouse_y];

		connection = document .createElementNS ("http://www.w3.org/2000/svg", "line");
		connection .setAttribute ("class", "connection");
		connection .setAttribute ("stroke", "black");
		connection .setAttribute ("stroke-width", "1");

		if (event .target .classList .contains ("connector")) {
			connecting = true;
			dragging = false;

			connection .setAttribute ("x1", event .target .getAttribute ("cx"));
			connection .setAttribute ("y1", event .target .getAttribute ("cy"));

			connections .appendChild (connection);
		} else {
			connecting = false;
			dragging = true;
		}
	});

	circuit .addEventListener ("mousemove", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (connecting) {
			connection .setAttribute ("x2", "" + (mouse_x - 223));
			connection .setAttribute ("y2", "" + (mouse_y - 2));
		}

		if (dragging) {
			moveComponent (component, [mouse_x - old_position [0], mouse_y - old_position [1]]);
			old_position = [mouse_x, mouse_y];
		}
	});

	circuit .addEventListener ("mouseup", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (connecting) {
			if (event .target .classList .contains ("connector")) {
				connection .setAttribute ("x2", event .target .getAttribute ("cx"));
				connection .setAttribute ("y2", event .target .getAttribute ("cy"));
			} else {
				connections .removeChild (connections .lastChild);
			}
		}

		if (dragging) {
			moveComponent (component, [mouse_x - old_position [0], mouse_y - old_position [1]]);
			old_position = [mouse_x, mouse_y];
		}

		//initial_position = current_position;
		connecting = false;
		dragging = false;

		//component .style .stroke = "blue";
		for (i = 0; i < component .children .length; i++) {
		//	component .children [i] .setAttribute ("stroke", "blue");
			//console .log (component .children [i]);
		}
	});
}

function moveComponent (component, offset) {
	for (i = 0; i < component .children .length; i++) {
		let c = component .children [i];

		if (c .localName == "line") {
			c .setAttribute ("x1", "" + (parseInt (c .getAttribute ("x1")) + offset [0]));
			c .setAttribute ("y1", "" + (parseInt (c .getAttribute ("y1")) + offset [1]));
			c .setAttribute ("x2", "" + (parseInt (c .getAttribute ("x2")) + offset [0]));
			c .setAttribute ("y2", "" + (parseInt (c .getAttribute ("y2")) + offset [1]));
		} else if (c .localName == "rect") {
			c .setAttribute ("x", "" + (parseInt (c .getAttribute ("x")) + offset [0]));
			c .setAttribute ("y", "" + (parseInt (c .getAttribute ("y")) + offset [1]));
		} else if (c .localName == "circle") {
			c .setAttribute ("cx", "" + (parseInt (c .getAttribute ("cx")) + offset [0]));
			c .setAttribute ("cy", "" + (parseInt (c .getAttribute ("cy")) + offset [1]));
		} else if (c .localName == "path") {
			let path = c .getAttribute ("d") .split (" ");

			let x = parseInt (path [1] .split (",") [0]);
			let y = parseInt (path [1] .split (",") [1]);
			
			path [1] = "" + (x + offset [0]) + "," + (y + offset [1]);
			
			c .setAttribute ("d", path .join (" "));
		} else if (c .localName == "polygon" || c .localName == "polyline") {
			let path = c .getAttribute ("points") .split (" ");
			let x,y;

			for (var p = 0; p < path .length; p++) {
				x = parseInt (path [p] .split (",") [0]);
				y = parseInt (path [p] .split (",") [1]);

				path [p] = "" + (x + offset [0]) + "," + (y + offset [1]);
			}

			c .setAttribute ("points", path .join (" "));
		}
	}
}

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
		, "data" : '<circle class="connector positive" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="45" y2="50" stroke="black" stroke-width="2"/><line x1="45" y1="20" x2="45" y2="80" stroke="black" stroke-width="2"/><line x1="55" y1="35" x2="55" y2="65" stroke="black" stroke-width="2"/><line x1="55" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector negative" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "ac_power"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><circle cx="50" cy="50" r="30" stroke="black" stroke-width="2" fill="white"/><path d="M 30,50 q 10,-20 20,0 t 20,0" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "ground"
		, "data" : '<circle class="connector" cx="50" cy="3" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="50" y1="5" x2="50" y2="50" stroke="black" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="black" stroke-width="2"/><line x1="25" y1="60" x2="75" y2="60" stroke="black" stroke-width="2"/><line x1="35" y1="70" x2="65" y2="70" stroke="black" stroke-width="2"/><line x1="45" y1="80" x2="55" y2="80" stroke="black" stroke-width="2"/><line x1="49" y1="90" x2="51" y2="90" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "resistor"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><polyline points="20,50 25,40 35,60 45,40 55,60 65,40 75,60 80,50" fill="none" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "capacitor"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="40" y2="50" stroke="black" stroke-width="2"/><line x1="40" y1="20" x2="40" y2="80" stroke="black" stroke-width="2"/><rect x="41" y="20" width="18" height="60" fill="white" stroke="none"/><line x1="60" y1="20" x2="60" y2="80" stroke="black" stroke-width="2"/><line x1="60" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "inductor"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="16" y2="50" stroke="black" stroke-width="2"/><path d="M 15,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 40,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 30,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 55,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 45,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 70,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 60,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><line x1="84" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "switch"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="30.5" y2="50" stroke="black" stroke-width="2"/><line x1="30" y1="50" x2="65" y2="25" stroke="black" stroke-width="2"/><line x1="70" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "fuse"
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><rect x="20" y="40" width="60" height="20" fill="white" stroke="black" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="black" stroke-width="0.5"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_buffer_gate"
		, "data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_not_gate"
		, "data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/><line x1="5" y1="50" x2="20.5" y2="50" stroke="black" stroke-width="2"/><polygon points="20.5,25 70.5,50 20.5,75" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/>'
	}, {
		"name" : "binary_or_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nor_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="25" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="25" y2="62.5" stroke="black" stroke-width="2"/><path d="M 12.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_and_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="22.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="22.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 l 30,0 a 25,25 0 0 1 0,50 l -30,0 z" stroke="black" stroke-width="2" fill="white"/><line x1="77.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nand_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="17.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="17.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 l 30,0 a 25,25 0 0 1 0,50 l -30,0 z" stroke="black" stroke-width="2" fill="white"/><circle cx="77.5" cy="50" r="5" stroke="black" stroke-width="2" fill="white" /><line x1="82.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xor_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="35" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="35" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><path d="M 17,27.5 a 20,25 0 0 1 0,45" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xnor_gate"
		, "data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><path d="M 12.5,27.5 a 20,25 0 0 1 0,45" stroke="black" stroke-width="2" fill="none"/><circle cx="80" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="85" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "zener_diode"
		, "data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><polyline points="65,20 75,25 75,75 85,80" fill="none" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}
];