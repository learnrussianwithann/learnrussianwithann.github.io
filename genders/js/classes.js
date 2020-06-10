class Point {

	constructor(x, y) {
		if (x == undefined) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = x;
			if (y == undefined) {
				this.y = x;
			} else {
				this.y = y;
			}
		}

	}

	set(x, y) {
		if (x == undefined) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = x;
			if (y == undefined) {
				this.y = x;
			} else {
				this.y = y;
			}
		}
	}

	dist(x, y) {
		return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
	}

	distToPoint(point) {
		return this.dist(point.x, point.y);
	}

	toString() {
		return 'x: ' + this.x + ' y: ' + this.y;
	}
}

class ElementInfo extends Point {
	constructor(x, y, w, byHeight) {
		super(x, y);
		this.width = w;
		this.byHeight = byHeight;
	}
}

class Element extends PIXI.Container {
	constructor() {
		super();
		this.sprites = [];
		// this.container = new PIXI.Container();
		this.interactiveChildren = false;
		// setMoveable(this.container);
	}

	put(elem) {
		this.addChild(elem);
		this.updateHitArea();
	}

	updateHitArea() {
		this.calculateBounds();
		this.hitArea = this.getLocalBounds();
	}

	getByName(name) {
		return this.getChildByName(name);
	}

	hide(name) {
		this.getByName(name).visible = false;
	}

	show(name) {
		this.getByName(name).visible = true;
	}



}

class Viewport {
	constructor(container, ratio) { //ratio width/height
		this.container = new PIXI.Container();
		this.w = 100;
		this.h = 100;
		this.c = new Point(this.w / 2, this.h / 2);
		if (ratio) this.ratio = ratio;
		else this.ratio = 16 / 9;
		container.addChild(this.container);
	}

	add(elem, x, y, w, byHeight) {
		elem.info = new ElementInfo(x, y, w, byHeight);
		this.container.addChild(elem);
	}

	resizeElement(e) {
		let eratio = e.width / e.height;

		if (e.info.byHeight) {
			e.height = this.w * e.info.width;
			e.width = e.height * eratio;
			e.x = this.w * e.info.x + this.c.x;
			e.y = this.h * e.info.y + this.c.y;
		} else {
			e.width = this.w * e.info.width;
			e.height = e.width / eratio;
			e.x = this.w * e.info.x + this.c.x;
			e.y = this.h * e.info.y + this.c.y;
		}
		
	}

	resize() {
		this.w = app.screen.width;
		this.h = app.screen.height;
		this.c.set(this.w / 2, this.h / 2);
		if (this.w / this.ratio < this.h) {
			this.h = this.w / this.ratio;
		} else {
			this.w = this.h * this.ratio;
		}
		this.container.children.forEach(element => {
			this.resizeElement(element)
		});
	}
}

