
////////////////////////////////////////////////
//			Distance
////////////////////////////////////////////////

function dist(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function distElement(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

function distToMouse(word, mouse) {
	return (
		Math.abs(mouse.x - word.x) < word.width / 2 &&
		Math.abs(mouse.y - word.y) < word.height
	)
}

////////////////////////////////////////////////
//			Generators
////////////////////////////////////////////////

function getRect(prop) {
	if (!checkProperty(prop, 'width', 'height', 'raduis', 'color')) return null;

	let out = new PIXI.Graphics();
	out.beginFill(prop.color);
	out.drawRoundedRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height, prop.radius);
	out.endFill();
	return out;
}

function getSprite(prop) {
	if (!checkProperty(prop, 'texture', 'name', 'scale', 'position')) return null;

	let out = new PIXI.Sprite(prop.texture)
	out.name = prop.name;
	if (prop.hasOwnProperty('anchor')) {
		if (prop.anchor.hasOwnProperty('x')) {
			out.anchor.x = prop.anchor.x;
			out.anchor.y = prop.anchor.y;
		} else out.anchor.set(prop.anchor)
	}
	if (prop.hasOwnProperty('x')) {
		out.scale.x = scale.x;
		out.scale.y = scale.y;
	} else out.scale.set(scale)

	out.x = prop.position.x;
	out.y = prop.position.y;

	return out;
}

function getButton(prop) {
	if (!checkProperty(prop, 'text', 'style', 'bcolor', 'k_w', 'k_h')) return null;

	let out = new PIXI.Container();
	let t = new PIXI.Text(prop.text, prop.style);
	t.anchor.set(0.5);

	out.add(getRect({ width: prop.k_w * t.width, height: prop.k_h * t.height, radius: prop.k_h * t.height, color: prop.bcolor }));
	out.add(t);
	return out;
}

///////////////////////////////////////////////////
//		Modifiers
///////////////////////////////////////////////////

function onDragStart(event) {
	// store a reference to the data
	// the reason for this is because of multitouch
	// we want to track the movement of this particular touch
	this.data = event.data;
	// this.alpha = 0.5;
	this.dragging = true;
	this['offset'] = this.data.getLocalPosition(this.parent);
	this.offset.set(this.x - this.offset.x, this.y - this.offset.y);
}

function onDragEnd() {
	this.dragging = false;
	// set the interaction data to null
	this.data = null;
	let max_dist = 0.1 * viewGame.h;
	if (distToMouse(this, window.mouseF)) {
		if (curWordGender == 'f') correct(window.mouseF);
		else incorrect(window.mouseF);
	} else if (distToMouse(this, window.mouseN)) {
		if (curWordGender == 'n') correct(window.mouseN);
		else incorrect(window.mouseN);
	} else if (distToMouse(this, window.mouseM)) {
		if (curWordGender == 'm') correct(window.mouseM);
		else incorrect(window.mouseM);
	} else if (distToMouse(this, window.cat)) {
		window.catMeow();
	}
}

function onDragMove() {
	if (this.dragging) {
		const newPosition = this.data.getLocalPosition(this.parent);
		let x = newPosition.x + this.offset.x;
		let y = newPosition.y + this.offset.y;
		if (x > 50 && y > 10 && x < app.screen.width - 50 && y < app.screen.height - 10) {
			this.x = newPosition.x + this.offset.x;
			this.y = newPosition.y + this.offset.y;
		}
	}
}

function setMoveable(
	element,
	onDragStart,
	onDragMove,
	onDragEnd,
	updateFunction,
) {
	element
		.on('pointerdown', onDragStart)
		.on('pointerdown', updateFunction)
		.on('pointerup', onDragEnd)
		.on('pointerup', updateFunction)
		.on('pointerupoutside', onDragEnd)
		.on('pointerupoutside', updateFunction)
		.on('pointermove', onDragMove)
		.on('pointermove', updateFunction)

	element.interactive = true
	element.buttonMode = true
}

function setButton(element, event) {
	element.on('pointerdown', event)
	element.interactive = true
	element.buttonMode = true
}

/////////////////////////////////////////
//        Checkers
/////////////////////////////////////////
function checkProperty() { //arguments[0] - object
	for (var i = 1; i < arguments.length; i++) {
		if (!arguments[0].hasOwnProperty(arguments[i]))
			return false;
	}
	return true;
}