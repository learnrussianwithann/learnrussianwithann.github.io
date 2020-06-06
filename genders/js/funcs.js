function genMask() {
	let mask = new PIXI.Graphics();
	mask.beginFill(0xff5555);
	mask.drawEllipse(0, 0, 20, 20);
	mask.endFill();

	return mask;
}

var offset;

function onDragStart(event) {
	// store a reference to the data
	// the reason for this is because of multitouch
	// we want to track the movement of this particular touch
	console.log(this);
	this.data = event.data;
	// this.alpha = 0.5;
	this.dragging = true;
	offset = this.data.getLocalPosition(this.parent);
	offset.set(this.x - offset.x, this.y - offset.y);
}

function onDragEnd() {
	// this.alpha = 1;
	this.dragging = false;
	// set the interaction data to null
	this.data = null;
}

function onDragMove() {
	if (this.dragging) {
		const newPosition = this.data.getLocalPosition(this.parent);
		this.x = newPosition.x + offset.x;
		this.y = newPosition.y + offset.y;
	}
}

function genSprite(texture, name) {
	let out = new PIXI.Sprite(texture);
	out.name = name;
	return out;
}