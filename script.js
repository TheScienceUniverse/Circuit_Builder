/*-------------------- Constants and Variables and Structures --------------------*/

const media_directory = '..';

var mouse_x = null, mouse_y = null;
var mouse_dx = null, mouse_dy = null;
var selected_component_tool = null;
var selected_component = null;
var component_position = null;

var component_count = 0;
var node_count = 0;
var connection_count = 0;

class Component {
	constructor (type, base_X, base_Y, width, height, rotation) {
		this .id = "component_" + ++ component_count;
		this .type = type;

		this .base_X = base_X;
		this .base_Y = base_Y;

		this .width = width;
		this .height = height;
		this .rotation = rotation;

		this .nodes = [];
	}
}

class Node {
	constructor (type, position_X, position_Y, component_id) {
		this .id = "node_" + ++ node_count;
		this .type = type;

		this .position_X = position_X;
		this .position_Y = position_Y;

		this .component_id = component_id;
		this .linked_with = [];
	}
}

class Connection {
	constructor (node_1_id, component_1_id, node_2_id, component_2_id) {
		this .id = "connection_" + ++ connection_count;

		this .node_1_id = node_1_id;
		this .component_1_id = component_1_id;

		this .node_2_id = node_2_id;
		this .component_2_id = component_2_id;

		this .connector_colour = "black";
	}
}

var component = null;
var component_image = null;
var node = null;
var connection = null;

var component_list = [];
var node_list = [];
var connection_list = [];


/*------------------------------ Functionalities ------------------------------*/

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

			component = new Component ();
			component .type = selected_component_tool .getAttribute ("alt");
			component .width = 100;
			component .height = 100;
			component .rotation = 0;
			component .base_X = mouse_x - 223 - mouse_dx;
			component .base_Y = mouse_y - 3 - mouse_dy;

			component_image = document .createElementNS ("http://www.w3.org/2000/svg", "g");
			component_image .setAttribute ("id", component .id);
			component_image .setAttribute ("class", "component");
			component_image .setAttribute ("draggable", "true");
			component_image .innerHTML = get_component_svg_data (component .type);

			for (var i = 0; i < component_image .children .length; i++) {
				if (component_image .children [i] .classList .contains ("node")) {
					node = new Node (
						component_image .children [i] .classList [2]
						, parseInt (component_image .children [i] .getAttribute ("cx"))
						, parseInt (component_image .children [i] .getAttribute ("cy"))
						, component .id
					);

					node_list .push (node);
					component .nodes .push (node .id);
					component_image .children [i] .setAttribute ("id", node .id);
				}
			}

			moveComponent (component_image, [component .base_X, component .base_Y]);
			set_componet_events (component_image, [component .base_X, component .base_Y]);

			component_list .push (component);
			event .target .appendChild (component_image);

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

function set_componet_events (component_image, initial_position) {
	var dragging = false;
	var connecting = false;
	// var initial_drag_position;
	let circuit = document .getElementById ("circuit");
	// let current_position = initial_position;
	let old_position = initial_position;
	var connection_line = null;
	var connection_lines = document .getElementById ("connections");

	component_image .addEventListener ("mousedown", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;
		// initial_drag_position = [mouse_x, mouse_y];
		old_position = [mouse_x, mouse_y];

		if (event .target .classList .contains ("node")) {
			connecting = true;
			dragging = false;

			connection = new Connection ();
			connection .component_1_id = component_image .getAttribute ("id");
			connection .node_1_id = event .target .getAttribute ("id");
			//console .log (component_image);

			connection_line = document .createElementNS ("http://www.w3.org/2000/svg", "line");
			connection_line .setAttribute ("class", "connection");
			connection_line .setAttribute ("stroke", generate_random_hex_colour ());
			connection_line .setAttribute ("stroke-width", "1");
			connection_line .setAttribute ("x1", event .target .getAttribute ("cx"));
			connection_line .setAttribute ("y1", event .target .getAttribute ("cy"));
			connection_line .setAttribute ("x2", event .target .getAttribute ("cx"));
			connection_line .setAttribute ("y2", event .target .getAttribute ("cy"));

			connection_lines .appendChild (connection_line);
		} else {
			connecting = false;
			dragging = true;
		}
	});

	circuit .addEventListener ("mousemove", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (connecting) {
			connection_line .setAttribute ("x2", "" + (mouse_x - 223));
			connection_line .setAttribute ("y2", "" + (mouse_y - 2));
		}

		if (dragging) {
			moveComponent (component_image, [mouse_x - old_position [0], mouse_y - old_position [1]]);
			moveConnections (component_image .getAttribute ("id"), [mouse_x - old_position [0], mouse_y - old_position [1]]);
			
			old_position = [mouse_x, mouse_y];
		}
	});

	circuit .addEventListener ("mouseup", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (connecting) {
			if (event .target .classList .contains ("node")) {
				node = get_node_by_id (event .target .getAttribute ("id"));
				connection .node_2_id = node .id;
				connection .component_2_id = node .component_id;

				connection_line .setAttribute ("id", connection .id);
				connection_line .setAttribute ("x2", event .target .getAttribute ("cx"));
				connection_line .setAttribute ("y2", event .target .getAttribute ("cy"));

				connection_list .push (connection);
			} else {
				connection_lines .removeChild (connection_lines .lastChild);
			}
		}

		if (dragging) {
			moveComponent (component_image, [mouse_x - old_position [0], mouse_y - old_position [1]]);
			moveConnections (component_image .getAttribute ("id"), [mouse_x - old_position [0], mouse_y - old_position [1]]);
			old_position = [mouse_x, mouse_y];
		}

		//initial_position = current_position;
		connecting = false;
		dragging = false;

		//component .style .stroke = "blue";
		for (i = 0; i < component_image .children .length; i++) {
		//	component .children [i] .setAttribute ("stroke", "blue");
			//console .log (component .children [i]);
		}
	});
}

function moveComponent (component_image, offset) {
	for (i = 0; i < component_image .children .length; i++) {
		let c = component_image .children [i];

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

function moveConnections (component_id, offset) {
	var links = get_links_by_id (component_id);
	var connection_line;

	for (var i = 0; i < links .length; i++) {
		connection_line = document .getElementById (links [i][0]);

		if (links [i][1] == 1) {
			connection_line .setAttribute ("x1", "" + (parseInt (connection_line .getAttribute ("x1")) + offset [0]));
			connection_line .setAttribute ("y1", "" + (parseInt (connection_line .getAttribute ("y1")) + offset [1]));
		} else {
			connection_line .setAttribute ("x2", "" + (parseInt (connection_line .getAttribute ("x2")) + offset [0]));
			connection_line .setAttribute ("y2", "" + (parseInt (connection_line .getAttribute ("y2")) + offset [1]));
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

function get_component_by_id (component_id) {
	var component;

	for (var i = 0; i < component_list .length; i++) {
		if (component_list [i] .id == component_id) {
			component = component_list [i];
			break;
		}
	}

	return component;
}

function get_node_by_id (node_id) {
	var node;

	for (var i = 0; i < node_list .length; i++) {
		if (node_list [i] .id == node_id) {
			node = node_list [i];
			break;
		}
	}

	return node;
}

function get_links_by_id (component_id) {
	var links = [];

	for (var i = 0; i < connection_list .length; i++) {
		if (connection_list [i] .component_1_id == component_id) {
			links .push ([connection_list [i] .id, 1]);
		} else if (connection_list [i] .component_2_id == component_id) {
			links .push ([connection_list [i] .id, 2]);
		}
	}

	return links;
}

function generate_random_hex_colour () {
	var colour = "#";
	var x = 6;

	while (x--) {
		colour += colour_hex_palatte [Math .floor (Math .random () * 16)];
	}

	return colour;
}

const colour_hex_palatte = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

const component_svg_data = [
	{
		"name" : "dc_power"
		, "data" : '<circle class="node positive" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="45" y2="50" stroke="black" stroke-width="2"/><line x1="45" y1="20" x2="45" y2="80" stroke="black" stroke-width="2"/><line x1="55" y1="35" x2="55" y2="65" stroke="black" stroke-width="2"/><line x1="55" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node negative" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "ac_power"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><circle cx="50" cy="50" r="30" stroke="black" stroke-width="2" fill="white"/><path d="M 30,50 q 10,-20 20,0 t 20,0" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "ground"
		, "data" : '<circle class="node input" cx="50" cy="3" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="50" y1="5" x2="50" y2="50" stroke="black" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="black" stroke-width="2"/><line x1="25" y1="60" x2="75" y2="60" stroke="black" stroke-width="2"/><line x1="35" y1="70" x2="65" y2="70" stroke="black" stroke-width="2"/><line x1="45" y1="80" x2="55" y2="80" stroke="black" stroke-width="2"/><line x1="49" y1="90" x2="51" y2="90" stroke="black" stroke-width="2"/>'
	}, {
		"name" : "resistor"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><polyline points="20,50 25,40 35,60 45,40 55,60 65,40 75,60 80,50" fill="none" stroke="black" stroke-width="2"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "capacitor"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="40" y2="50" stroke="black" stroke-width="2"/><line x1="40" y1="20" x2="40" y2="80" stroke="black" stroke-width="2"/><rect x="41" y="20" width="18" height="60" fill="white" stroke="none"/><line x1="60" y1="20" x2="60" y2="80" stroke="black" stroke-width="2"/><line x1="60" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "inductor"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="16" y2="50" stroke="black" stroke-width="2"/><path d="M 15,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 40,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 30,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 55,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 45,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><path d="M 70,50 a 5,10 0 0 1 -10,0" fill="none" stroke="black" stroke-width="2"/><path d="M 60,50 a 10,12.5 0 0 1 25,0" fill="none" stroke="black" stroke-width="2"/><line x1="84" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "switch"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="30.5" y2="50" stroke="black" stroke-width="2"/><line x1="30" y1="50" x2="65" y2="25" stroke="black" stroke-width="2"/><line x1="70" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "fuse"
		, "data" : '<circle class="node both" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20" y2="50" stroke="black" stroke-width="2"/><rect x="20" y="40" width="60" height="20" fill="white" stroke="black" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="black" stroke-width="0.5"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node both" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_buffer_gate"
		, "data" : '<circle class="node input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_not_gate"
		, "data" : '<circle class="node input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/><line x1="5" y1="50" x2="20.5" y2="50" stroke="black" stroke-width="2"/><polygon points="20.5,25 70.5,50 20.5,75" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="none"/>'
	}, {
		"name" : "binary_or_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nor_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="25" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="25" y2="62.5" stroke="black" stroke-width="2"/><path d="M 12.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_and_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="22.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="22.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 l 30,0 a 25,25 0 0 1 0,50 l -30,0 z" stroke="black" stroke-width="2" fill="white"/><line x1="77.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_nand_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="17.5" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="17.5" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 l 30,0 a 25,25 0 0 1 0,50 l -30,0 z" stroke="black" stroke-width="2" fill="white"/><circle cx="77.5" cy="50" r="5" stroke="black" stroke-width="2" fill="white" /><line x1="82.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xor_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="35" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="35" y2="62.5" stroke="black" stroke-width="2"/><path d="M 22.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><path d="M 17,27.5 a 20,25 0 0 1 0,45" stroke="black" stroke-width="2" fill="none"/><line x1="80" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "binary_xnor_gate"
		, "data" : '<circle class="node input" cx="3" cy="37.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="37.5" x2="30" y2="37.5" stroke="black" stroke-width="2"/><circle class="node input" cx="3" cy="62.5" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="62.5" x2="30" y2="62.5" stroke="black" stroke-width="2"/><path d="M 17.5,25 a 75,55 -25 0 1 57.5,25 a 75,55 25 0 1 -57.5,25 a 15,25 0 0 0 0,-50" stroke="black" stroke-width="2" fill="white"/><path d="M 12.5,27.5 a 20,25 0 0 1 0,45" stroke="black" stroke-width="2" fill="none"/><circle cx="80" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="85" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}, {
		"name" : "zener_diode"
		, "data" : '<circle class="node input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="25" y2="50" stroke="black" stroke-width="2"/><polygon points="25,25 75,50 25,75" fill="white" stroke="black" stroke-width="2"/><polyline points="65,20 75,25 75,75 85,80" fill="none" stroke="black" stroke-width="2"/><line x1="75" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
	}
];