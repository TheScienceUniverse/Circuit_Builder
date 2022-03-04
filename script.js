media_directory = '..';

let mouse_x = null, mouse_y = null;
let mouse_dx = null, mouse_dy = null;
let selected_component = null;

//dragElement(document.getElementById ("mydiv"));

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
	set_component_listeners ();
}

function set_component_listeners () {
	let circuit_window = document .getElementById ("circuit-window");

	var component_list = document .getElementsByClassName ("component-tool");


	for (i = 0; i < component_list .length; i++) {
		component_list [i] .addEventListener ("dragstart", (event) => {
			mouse_dx = event .offsetX;
			mouse_dy = event .offsetY;
		});
	}

	for (i = 0; i < component_list .length; i++) {
		component_list [i] .addEventListener ("drag", (event) => {
			//event .dataTransfer .setData ("text", event .target .id);
			//event .dataTransfer .effectAllowed = "copy";
	
			selected_component = event .target;
	
			mouse_x = event .clientX;
			mouse_y = event .clientY;
	
			//mouse_dx = event .offsetX;
			//mouse_dy = event .offsetY;
		});
	}

	circuit_window .addEventListener ("dragover", (event) => {
		event .preventDefault ();

		mouse_x = event .clientX;
		mouse_y = event .clientY;
	});

	circuit_window .addEventListener ("drop", (event) => {
		event .preventDefault ();

		//console .log ("hello " + event.dataTransfer.getData("text"));

		//var data = event.dataTransfer.getData("text");
		var new_component = document .createElement ("img");
		new_component .src = selected_component .src;
		new_component .classList .add ("component");
		

		mouse_x = event .clientX;
		mouse_y = event .clientY;

		console .log (mouse_dx + " " + mouse_dy);

		event .target.appendChild (new_component);

		new_component .style .left = (mouse_x - 223 - mouse_dx) + "px";
		new_component .style .top = (mouse_y - mouse_dy - 3) + "px";
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


/*

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
}*/