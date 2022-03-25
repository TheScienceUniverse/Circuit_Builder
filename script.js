/*------------------------------ Data Structures ------------------------------*/

class Coordinate {
	constructor (
		x = 0
		, y = 0
	) {
		this .x = x;
		this .y = y;
	}
}

class Dimension {
	constructor (
		width = 0
		, height = 0
	) {
		this .width = width;
		this .height = height;
	}
}

class Component {
	constructor (
		name = ""
		, base_point = new Coordinate ()
		, dimension = new Dimension ()
		, rotation = 0
	) {
		this .id = "component_" + ++ component_counter;
		this .name = name;
		this .base_point = base_point;
		this .sub_points = [];
		this .dimension = dimension;
		this .rotation = rotation;
		this .nodes = [];
	}
}

class Sub_Diagram_Anchor {
	constructor (
		type = ""
		, anchor_points = [new Coordinate ()]
	) {
		this .type = type;
		this .anchor_points = anchor_points;
	}
}

class Component_Node {
	constructor (
		i = 0
		, id = ""
	) {
		this .sub_diagram_index = i;
		this .node_id = id;
	}
}

class Node {
	constructor (
		type = ""
		, position = new Coordinate ()
		, base_component_id = ""
	) {
		this .id = "node_" + ++ node_counter;
		this .type = type;
		this .position = position;
		this .base_component_id = base_component_id;
		this .linked_connection_ids = [];
	}
}

class Connection {
	constructor (
		node_1_id = ""
		, component_1_id = ""
		, node_2_id = ""
		, component_2_id = ""
	) {
		this .id = "connection_" + ++ connection_counter;
		this .node_1_id = node_1_id;
		this .component_1_id = component_1_id;
		this .node_2_id = node_2_id;
		this .component_2_id = component_2_id;
		this .connector_colour = "black";
	}
}

class Link {
	constructor (
		connection_id = ""
		, connected_node_index = 0
		, node_position = new Coordinate ()
	) {
		this .connection_id = connection_id
		this .connected_node_index = connected_node_index
		this .node_position = node_position
	}
}


/*------------------------------ Constants and Variables ------------------------------*/

const media_directory = '..';

var mouse_x = null, mouse_y = null;
var mouse_dx = null, mouse_dy = null;
var selected_component_tool = null;
var selected_component = null;
var component_position = null;

var component_counter = 0;
var node_counter = 0;
var connection_counter = 0;

var component = null;
var component_image = null;
var node = null;
var connection = null;

var component_list = [];
var node_list = [];
var connection_list = [];

var circuit_offset = new Coordinate (0, 0);
var circuit_movement_activated = false;

const circuit_default_dimension = new Dimension (0, 0);
var circuit_dimension = new Dimension (0, 0);


/*------------------------------ Functionalities ------------------------------*/

function init () {
	let circuit = document .getElementById ("circuit");
	circuit_default_dimension .width = parseInt (circuit .getAttribute ("width"));
	circuit_default_dimension .height = parseInt (circuit .getAttribute ("height"));
	circuit_dimension .width = circuit_default_dimension .width;
	circuit_dimension .height = circuit_default_dimension .height;

	set_component_search_box_events ()
	set_overlay_events ();
	set_circuit_listeners ();
}

function set_component_search_box_events () {
	let search_text_box = document .getElementById ("component-search-text-box");
	let tool_list = document .getElementById ("component-tool-list");
	let search_button = document .getElementById ("component-search-button");
	var search_button_active = false;

	search_button .addEventListener ("click", (event) => {
		let search_text = search_text_box .value .toLowerCase ();
		
		if (!search_button_active) {
			search_button_active = true;
			event .target .setAttribute ("src", "./media/close.svg");

			for (let i = 0; i < tool_list .children .length; i++) {
				if (search_text != "" && !(tool_list .children [i] .firstChild .getAttribute ("alt") .includes (search_text))) {
					tool_list .children [i] .classList .add ("absent");
				}
			}
		} else {
			search_button_active = false;
			event .target .setAttribute ("src", "./media/search.svg");
			search_text_box .value = "";

			for (let i = 0; i < tool_list .children .length; i++) {
				tool_list .children [i] .classList .remove ("absent");
			}
		}
	});
}

function set_circuit_listeners () {
	let circuit = document .getElementById ("circuit");
	var component_tool_list = document .getElementsByClassName ("component-tool");
	var circuit_moving = false;
	var initial_position = new Coordinate (0, 0);

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

		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (selected_component_tool .classList [0] == "component-tool") {
			component = new Component ();
			component .name = selected_component_tool .getAttribute ("alt");
			component .dimension = new Dimension (100, 100);

			component_image = document .createElementNS ("http://www.w3.org/2000/svg", "g");
			component_image .setAttribute ("id", component .id);
			component_image .setAttribute ("class", "component");
			component_image .setAttribute ("draggable", "true");
			component_image .style .backgroundColor = "white";
			component_image .innerHTML = get_component_svg_data (component .name);

			set_component_values (component, component_image)
			component_list .push (component);
			event .target .appendChild (component_image);

			move_component (component .id, new Coordinate (mouse_x - 223 - mouse_dx, mouse_y - 3 - mouse_dy));
			set_componet_events (component_image, [component .base_X, component .base_Y]);
			
			selected_component_tool = null;
			circuit_movement_activated = true;
		}
	});

	circuit .addEventListener ("mousedown", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (event .target .getAttribute ("id") == "circuit") {
			circuit_moving = circuit_movement_activated & true;
			initial_position .x = mouse_x;
			initial_position .y = mouse_y;
		}
	});

	circuit .addEventListener ("mousemove", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (event .target .getAttribute ("id") == "circuit" && circuit_moving) {
			let offset = new Coordinate (mouse_x - initial_position .x, mouse_y - initial_position .y);

			circuit_dimension .width += offset .x;
			circuit_dimension .height += offset .y;

			if (circuit_dimension .width < circuit_default_dimension .width) {
				circuit_dimension .width = circuit_default_dimension .width;
			}

			if (circuit_dimension .height < circuit_default_dimension .height) {
				circuit_dimension .height = circuit_default_dimension .height;
			}

			circuit .setAttribute ("width", "" + circuit_dimension .width);
			circuit .setAttribute ("height", "" + circuit_dimension .height);
			circuit .setAttribute ("viewBox", "0 0 " + circuit_dimension .width + " " + circuit_dimension .height);

			move_all_components (offset);

			initial_position .x = mouse_x;
			initial_position .y = mouse_y;
		}
	});

	circuit .addEventListener ("mouseup", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;

		if (event .target .getAttribute ("id") == "circuit" && circuit_moving) {
			circuit_moving = false;
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

function set_component_values (component = new Component (), component_image) {
	var sub_diagram;

	for (let i = 0; i < component_image .children .length; i++) {
		sub_diagram = component_image .children [i];

		if (sub_diagram .localName == "line") {
			component .sub_points .push (new Sub_Diagram_Anchor (
				"line"
				, [new Coordinate (
					parseInt (sub_diagram .getAttribute ("x1"))
					, parseInt (sub_diagram .getAttribute ("y1"))
				), new Coordinate (
					parseInt (sub_diagram .getAttribute ("x2"))
					, parseInt (sub_diagram .getAttribute ("y2"))
				)]
			));
		} else if (sub_diagram .localName == "rect") {
			component .sub_points .push (new Sub_Diagram_Anchor (
				"rect"
				, [new Coordinate (
					parseInt (sub_diagram .getAttribute ("x"))
					, parseInt (sub_diagram .getAttribute ("y"))
				)]
			));
		} else if (sub_diagram .localName == "circle") {
			component .sub_points .push (new Sub_Diagram_Anchor (
				"circle"
				, [new Coordinate (
					parseInt (sub_diagram .getAttribute ("cx"))
					, parseInt (sub_diagram .getAttribute ("cy"))
				)]
			));

		} else if (sub_diagram .localName == "path") {
			let path = sub_diagram .getAttribute ("d") .split (" ");

			component .sub_points .push (new Sub_Diagram_Anchor (
				"path"
				, [new Coordinate (
					parseInt (path [1] .split (",") [0])
					, parseInt (path [1] .split (",") [1])
				)]
			));
		} else if (sub_diagram .localName == "polygon" || sub_diagram .localName == "polyline") {
			let path = sub_diagram .getAttribute ("points") .split (" ");
			let points = [];

			for (var p = 0; p < path .length; p++) {
				points .push (new Coordinate (
					parseInt (path [p] .split (",") [0])
					, parseInt (path [p] .split (",") [1])
				));
			}

			component .sub_points .push (new Sub_Diagram_Anchor (
				sub_diagram .localName
				, points
			));
		}

		if (sub_diagram .classList .contains ("node")) {
			let node = new Node (
				component_image .children [i] .classList [1]
				, new Coordinate (
					component .sub_points [component .sub_points .length - 1] .anchor_points [0] .x
					, component .sub_points [component .sub_points .length - 1] .anchor_points [0] .y
				)
				, component .id
			);

			node_list .push (node);
			component .nodes .push (new Component_Node (i, node .id));
			component_image .children [i] .setAttribute ("id", node .id);
		}
	}
}

function set_componet_events (component_image, initial_position = new Coordinate()) {
	var dragging = false;
	var connecting = false;
	let circuit = document .getElementById ("circuit");
	let old_position = initial_position;
	var connection_line = null;
	var connection_lines = document .getElementById ("connections");

	component_image .addEventListener ("mousedown", (event) => {
		mouse_x = event .clientX;
		mouse_y = event .clientY;
		old_position = [mouse_x, mouse_y];

		if (event .target .classList .contains ("node")) {
			connecting = true;
			dragging = false;

			connection = new Connection ();
			connection .component_1_id = component_image .getAttribute ("id");
			connection .node_1_id = event .target .getAttribute ("id");

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
			move_component (component_image .getAttribute ("id"), new Coordinate (mouse_x - old_position [0], mouse_y - old_position [1]));
			move_component_connections (component_image .getAttribute ("id"));

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
				connection .component_2_id = node .base_component_id;

				connection_line .setAttribute ("id", connection .id);
				connection_line .setAttribute ("x2", event .target .getAttribute ("cx"));
				connection_line .setAttribute ("y2", event .target .getAttribute ("cy"));

				connection_list .push (connection);
			} else {
				connection_lines .removeChild (connection_lines .lastChild);
			}
		}

		if (dragging) {
			move_component (component_image .getAttribute ("id"), new Coordinate (mouse_x - old_position [0], mouse_y - old_position [1]));
			move_component_connections (component_image .getAttribute ("id"));

			old_position = [mouse_x, mouse_y];
		}

		connecting = false;
		dragging = false;
	});
}

function move_all_components (offset = new Coordinate (0, 0)) {
	for (let i = 0; i < component_list .length; i++) {
		move_component (component_list [i] .id, offset);
		move_component_connections (component_list [i] .id)
	}
}

function move_component (component_id, offset = new Coordinate (0, 0)) {
	var component = get_component_by_id (component_id);
	var component_image = document .getElementById (component_id);
	var sub_diagram;

	component .base_point .x += offset .x;
	component .base_point .y += offset .y;

	for (let i = 0; i < component_image .children .length; i++) {
		sub_diagram = component_image .children [i];

		if (sub_diagram .localName == "line") {
			sub_diagram .setAttribute ("x1", "" + (component .base_point .x + component .sub_points [i] .anchor_points [0] .x));
			sub_diagram .setAttribute ("y1", "" + (component .base_point .y + component .sub_points [i] .anchor_points [0] .y));
			sub_diagram .setAttribute ("x2", "" + (component .base_point .x + component .sub_points [i] .anchor_points [1] .x));
			sub_diagram .setAttribute ("y2", "" + (component .base_point .y + component .sub_points [i] .anchor_points [1] .y));
		} else if (sub_diagram .localName == "rect") {
			sub_diagram .setAttribute ("x", "" + (component .base_point .x + component .sub_points [i] .anchor_points [0] .x));
			sub_diagram .setAttribute ("y", "" + (component .base_point .y + component .sub_points [i] .anchor_points [0] .y));
		} else if (sub_diagram .localName == "circle") {
			sub_diagram .setAttribute ("cx", "" + (component .base_point .x + component .sub_points [i] .anchor_points [0] .x));
			sub_diagram .setAttribute ("cy", "" + (component .base_point .y + component .sub_points [i] .anchor_points [0] .y));
		} else if (sub_diagram .localName == "path") {
			let path = sub_diagram .getAttribute ("d") .split (" ");

			path [1] = ""
				+ (component .base_point .x + component .sub_points [i] .anchor_points [0] .x)
				+ ","
				+ (component .base_point .y + component .sub_points [i] .anchor_points [0] .y);

			sub_diagram .setAttribute ("d", path .join (" "));
		} else if (sub_diagram .localName == "polygon" || sub_diagram .localName == "polyline") {
			let path = "";
			let length = sub_diagram .getAttribute ("points") .split (" ") .length;

			for (var p = 0; p < length; p++) {
				path += 
					(component .base_point .x + component .sub_points [i] .anchor_points [p] .x)
					+ ","
					+ (component .base_point .y + component .sub_points [i] .anchor_points [p] .y);
			
				if (p < length - 1) {
					path += " ";
				}
			}

			sub_diagram .setAttribute ("points", path);
		}
	}

	for (let i = 0; i < component .nodes .length; i++) {
		let node = get_node_by_id (component .nodes [i] .node_id);

		node .position .x = component .base_point .x + component .sub_points [component .nodes [i] .sub_diagram_index] .anchor_points [0] .x;
		node .position .y = component .base_point .y + component .sub_points [component .nodes [i] .sub_diagram_index] .anchor_points [0] .y;
	}
}

function move_component_connections (component_id = "") {
	const links = get_links_by_component_id (component_id);
	var connection_line;

	for (let i = 0; i < links .length; i++) {
		connection_line = document .getElementById (links [i] .connection_id);

		if (links [i] .connected_node_index == 1) {
			connection_line .setAttribute ("x1", links [i] .node_position .x);
			connection_line .setAttribute ("y1", links [i] .node_position .y);
		} else {
			connection_line .setAttribute ("x2", links [i] .node_position .x);
			connection_line .setAttribute ("y2", links [i] .node_position .y);
		}
	}
}

function get_component_svg_data (component_name = "") {
	let data = null;

	for (var i = 0 ; i < component_svg_data .length; i++) {
		if (component_svg_data [i]["name"] == component_name) {
			data = component_svg_data [i] .data;
			break;
		}
	}

	return data;
}

function get_component_by_id (component_id = "") {
	var component;

	for (var i = 0; i < component_list .length; i++) {
		if (component_list [i] .id == component_id) {
			component = component_list [i];
			break;
		}
	}

	return component;
}

function get_node_by_id (node_id = "") {
	var node;

	for (var i = 0; i < node_list .length; i++) {
		if (node_list [i] .id == node_id) {
			node = node_list [i];
			break;
		}
	}

	return node;
}

function get_links_by_component_id (component_id = "") {
	var links = [];

	for (var i = 0; i < connection_list .length; i++) {
		if (connection_list [i] .component_1_id == component_id) {
			links .push (new Link (connection_list [i] .id, 1, get_node_by_id (connection_list [i] .node_1_id) .position));
		} else if (connection_list [i] .component_2_id == component_id) {
			links .push (new Link (connection_list [i] .id, 2, get_node_by_id (connection_list [i] .node_2_id) .position));
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

function get_fitting_dimension () {
	var fitting_dimension = new Dimension (0, 0);
	var min_x = 0, min_y = 0, max_x = 0, max_y = 0;

	if (component_list .length > 0) {
		min_x = component_list [0] .base_point .x;
		min_y = component_list [0] .base_point .y;
		max_x = min_x;
		max_y = min_y;
	}

	for (let i = 1; i < component_list .length; i++) {
		if (min_x > component_list [i] .base_point .x) {
			min_x = component_list [i] .base_point .x;
		}

		if (max_x < component_list [i] .base_point .x) {
			max_x = component_list [i] .base_point .x;
		}

		if (min_y > component_list [i] .base_point .y) {
			min_y = component_list [i] .base_point .y;
		}

		if (max_y < component_list [i] .base_point .y) {
			max_y = component_list [i] .base_point .y;
		}
	}

	fitting_dimension .width = max_x - min_x + 100;
	fitting_dimension .height = max_y - min_y + 100;

	return fitting_dimension;
}


/*------------------------------ Data Constants ------------------------------*/

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
		, "data" : '<circle class="node input" cx="3" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/><line x1="5" y1="50" x2="20.5" y2="50" stroke="black" stroke-width="2"/><polygon points="20.5,25 70.5,50 20.5,75" stroke="black" stroke-width="2" fill="white"/><circle cx="75" cy="50" r="5" stroke="black" stroke-width="2" fill="white"/><line x1="80.5" y1="50" x2="95" y2="50" stroke="black" stroke-width="2"/><circle class="node output" cx="97" cy="50" r="2.5" stroke="black" stroke-width="1" fill="white"/>'
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