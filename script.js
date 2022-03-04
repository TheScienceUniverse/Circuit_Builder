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
			new_component .setAttribute ("draggable", "true");
			new_component .innerHTML = get_component_svg_data (selected_component_tool .getAttribute ("alt"));
			new_component .style .left = (mouse_x - 223 - mouse_dx) + "px";
			new_component .style .top = (mouse_y - mouse_dy - 3) + "px";
			
			set_componet_events (new_component, [mouse_x - 223 - mouse_dx, mouse_y - mouse_dy]);
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
	var initial_drag_position;
	let circuit_window = document .getElementById ("circuit-window");
	let current_position = initial_position;

	component .addEventListener ("mousedown", (event) => {
		initial_drag_position = [event .clientX, event .clientY];
		console .log (event .target);
		dragging = true;
		mouse_x = event .clientX;
		mouse_y = event .clientY;
	});

	circuit_window .addEventListener ("mousemove", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (dragging) {
			current_position = [initial_position [0] +  mouse_x - initial_drag_position [0], initial_position [1] + mouse_y - initial_drag_position [1]];

			component .style .left = current_position [0] + "px";
			component .style .top = current_position [1] + "px";
		}
	});
	
	circuit_window .addEventListener ("mouseup", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (dragging) {
			current_position = [initial_position [0] +  mouse_x - initial_drag_position [0], initial_position [1] + mouse_y - initial_drag_position [1]];

			component .style .left = current_position [0] + "px";
			component .style .top = current_position [1] + "px";
		}

		initial_position = current_position;
		dragging = false;

		//component .style .stroke = "blue";
		for (i = 0; i < component .children .length; i++) {
			component .children [i] .setAttribute ("stroke", "blue");
			//console .log (component .children [i]);
		}
	});
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
		, "data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><circle cx="50" cy="50" r="30" stroke="black" stroke-width="2" fill="white"/><path d="M 30,50 Q 40,30 50,50 T 70,50" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "ground"
		,"data" : '<circle class="connector" cx="50" cy="3" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="50" y1="5" x2="50" y2="50" stroke="black" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="black" stroke-width="2"/><line x1="25" y1="60" x2="75" y2="60" stroke="black" stroke-width="2"/><line x1="35" y1="70" x2="65" y2="70" stroke="black" stroke-width="2"/><line x1="45" y1="80" x2="55" y2="80" stroke="black" stroke-width="2"/><line x1="49" y1="90" x2="51" y2="90" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "resistor"
		,"data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><polyline points="20,50 25,40 35,60 45,40 55,60 65,40 75,60 80,50" fill="none" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "capacitor"
		,"data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="40" y2="50" stroke="black" stroke-width="2"/><line x1="40" y1="20" x2="40" y2="80" stroke="black" stroke-width="2"/><rect x="41" y="20" width="18" height="60" fill="white" stroke="none"/><line x1="60" y1="20" x2="60" y2="80" stroke="black" stroke-width="2"/><line x1="60" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "inductor"
		,"data" : '<circle class="connector" cx="5" cy="50" r="4" stroke="black" stroke-width="1.5" fill="white"/><line x1="8.5" y1="50" x2="26.5" y2="50" stroke="black" stroke-width="3"/><path d="M 25,50 A 15 15 0 0 1 70 50" fill="none" stroke="black" stroke-width="3"/><path d="M 50,50 A 15 15 0 0 1 95 50" fill="none" stroke="black" stroke-width="3"/><path d="M 75,50 A 15 15 0 0 1 120 50" fill="none" stroke="black" stroke-width="3"/><path d="M 100,50 A 15 15 0 0 1 145 50" fill="none" stroke="black" stroke-width="3"/><path d="M 70,50 A 10 15 0 0 1 50 50" fill="none" stroke="black" stroke-width="3"/><path d="M 95,50 A 10 15 0 0 1 75 50" fill="none" stroke="black" stroke-width="3"/><path d="M 120,50 A 10 15 0 0 1 100 50" fill="none" stroke="black" stroke-width="3"/><line x1="143.5" y1="50" x2="161.5" y2="50" stroke="black" stroke-width="3"/><circle class="connector" cx="165" cy="50" r="4" stroke="black" stroke-width="1.5" fill="white"/>'
	}, {
		"name" : "switch"
		,"data" : '<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="30.5" y2="50" stroke="black" stroke-width="2"/><line x1="30" y1="50" x2="65" y2="25" stroke="black" stroke-width="2"/><line x1="70" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "fuse"
		,"data" : '	<circle class="connector" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><rect x="20" y="40" width="60" height="20" fill="white" stroke="black" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="black" stroke-width="0.5"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_buffer_gate"
		,"data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_not_gate"
		,"data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/><line x1="5" y1="50" x2="20.5" y2="50" stroke="black" stroke-width="2"/><polygon points="20.5,25 70.5,50 20.5,75" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/>'
	}, {
		"name" : "binary_or_gate"
		,"data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 A 75 55 -25 0 1 75 50 L 75,50 A 75 55 25 0 1 17.5 75 L 17.5,75 A 15 25 0 0 0 17.5 25" stroke="black" stroke-width="2" fill="white"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nor_gate"
		,"data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="25" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="25" y2="62.5" stroke="black" stroke-width="2"/><path d="M 12.5,25 A 75 55 -25 0 1 70 50 L 70,50 A 75 55 25 0 1 12.5 75 L 12.5,75 A 15 25 0 0 0 12.5 25" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_and_gate"
		,"data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="22.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="22.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 L 52.5,25 A 25 25 0 0 1 52.5 75 L 22.5,75 Z" stroke="black" stroke-width="2" fill="white"/><line x1="77.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nand_gate"
		,"data" : '	<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="17.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="17.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 L 47.5,25 A 25 25 0 0 1 47.5 75 L 17.5,75 Z" stroke="black" stroke-width="2" fill="white"/><circle cx="77.5" cy="50" r="5" stroke="black" stroke-width="2" fill="white" /><line x1="82.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xor_gate"
		,"data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="35" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="35" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 A 75 55 -25 0 1 80 50 L 80,50 A 75 55 25 0 1 22.5 75 L 22.5,75 A 15 25 0 0 0 22.5 25" stroke="black" stroke-width="2" fill="white"/><path d="M 17,27.5 A 20 25 0 0 1 17 72.5" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xnor_gate"
		,"data" : '<circle class="connector input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="connector input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 A 75 55 -25 0 1 75 50 L 75,50 A 75 55 25 0 1 17.5 75 L 17.5,75 A 15 25 0 0 0 17.5 25" stroke="black" stroke-width="2" fill="white"/><path d="M 12.5,27.5 A 20 25 0 0 1 12.5 72.5" stroke="black" stroke-width="2" fill="none"/><circle cx="80" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="85" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "zener_diode"
		,"data" : '<circle class="connector input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><polyline points="65,20 75,25 75,75 85,80" fill="none" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="connector output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}
];