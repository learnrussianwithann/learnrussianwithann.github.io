
////////////////////////////////////////////////
//			Constans
////////////////////////////////////////////////
const DEFAULT_WIDTH = 1000;


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

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getRect(prop) {
	let out = new PIXI.Graphics();
	let w = prop.width * DEFAULT_WIDTH;
	let h = prop.height * DEFAULT_WIDTH;
	out.beginFill(prop.color);
	out.drawRoundedRect(-w / 2, -h / 2, w, h, prop.radius * DEFAULT_WIDTH);
	out.endFill();
	return out;
}

function getRectInPixel(prop) {
	let out = new PIXI.Graphics();
	let w = prop.width;
	let h = prop.height;
	out.beginFill(prop.color);
	out.drawRoundedRect(-w / 2, -h / 2, w, h, prop.radius);
	out.endFill();
	return out;
}

function getSprite(prop) {
	let out = new PIXI.Sprite(prop.texture);
	if (prop.hasOwnProperty('name')) out.name = prop.name;
	if (prop.hasOwnProperty('anchor')) {
		if (prop.anchor.hasOwnProperty('x')) {
			out.anchor.x = prop.anchor.x;
			out.anchor.y = prop.anchor.y;
		} else out.anchor.set(prop.anchor)
	}

	return out;
}

function getSpriteWithText(prop) {
	let out = new PIXI.Container();
	let s = new PIXI.Sprite(prop.texture);
	let t = new PIXI.Text(prop.text, prop.style);
	t.name = 'text';
	s.name = 'sprite';
	if (prop.hasOwnProperty('name')) out.name = prop.name;
	let ratio = t.width / t.height;
	if (prop.hasOwnProperty('anchor')) {
		if (prop.anchor.hasOwnProperty('x')) {
			s.anchor.x = prop.anchor.x;
			s.anchor.y = prop.anchor.y;
		} else s.anchor.set(prop.anchor);
	} else {
		s.anchor.set(.5);
	}

	if (prop.hasOwnProperty('text_anchor')) {
		if (prop.text_anchor.hasOwnProperty('x')) {
			t.anchor.x = prop.text_anchor.x;
			t.anchor.y = prop.text_anchor.y;
		} else t.anchor.set(prop.text_anchor);
	} else {
		t.anchor.set(.5);
	}

	out.addChild(s);
	out.addChild(t);

	return out;
}

function getText(prop) {
	let t = new PIXI.Text(prop.text, prop.style);
	t.anchor.set(0.5);
	t.name = 'text';
	return t;
}

function getTexturedText(prop) {
	let out = new PIXI.Container();
	let ctex = new PIXI.TilingSprite(prop.texture, prop.textureSize.x, prop.textureSize.y);
	ctex.anchor.set(.5);
	ctex.name = 'sprite';
	let t = getText(prop);
	t.anchor.set(.5);
	t.name = 'text';
	out.addChild(ctex);
	out.addChild(t);
	out.mask = t;
	return out;
}

function getButton(prop) {
	// if (!checkProperty(prop, 'text', 'style', 'bcolor', 'k_w', 'k_h')) return null;

	let out = new PIXI.Container();
	let t = new PIXI.Text(prop.text, prop.style);
	t.anchor.set(0.5);

	out.addChild(getRectInPixel({ width: prop.width * DEFAULT_WIDTH, height: prop.height * DEFAULT_WIDTH, radius: prop.height * DEFAULT_WIDTH, color: prop.bcolor }));
	out.addChild(t);
	return out;
}

function getShape(polygons) {
	let g = new PIXI.Graphics();
	polygons.forEach(p => {
		drawPoly(g, p.color, p.path);
	});
	let out = new PIXI.Sprite(app.renderer.generateTexture(g));
	out.anchor.set(.5);
	return out;
}

function drawPoly(graphics, color, path) {
	graphics.beginFill(color);
	graphics.drawPolygon(path);
	graphics.endFill();
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
}

function onDragMove() {
	if (this.dragging) {
		const newPosition = this.data.getLocalPosition(this.parent);
		let x = newPosition.x + this.offset.x;
		let y = newPosition.y + this.offset.y;
		if (x > 10 && y > 10 && x < app.screen.width - 10 && y < app.screen.height - 10) {
			this.x = newPosition.x + this.offset.x;
			this.y = newPosition.y + this.offset.y;
		} else {
			this.emit('pointerup');
		}
	}
}

function setMoveable(element, up_function, down_function) {
	element
		.on('pointerdown', onDragStart)
		.on('pointerup', onDragEnd)
		.on('pointerupoutside', onDragEnd)
		.on('pointermove', onDragMove)

	if (up_function != undefined) element.on('pointerup', up_function);
	if (down_function != undefined) element.on('pointerdown', down_function);

	element.interactive = true;
	element.buttonMode = true;
}

function setInactive(element) {
	element.removeAllListeners();
	element.interactive = false;
	element.buttonMode = false;
}

function setButton(element, event) {
	element.on('pointerdown', event)
	element.interactive = true
	element.buttonMode = true
}

function changeText(element, text) {
	let t = element.getChildByName('text');
	if (t != null) t.text = text;
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