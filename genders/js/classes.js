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

class Element {
	constructor() {
		this.sprites = [];
		this.container = new PIXI.Container();

		// setMoveable(this.container);
	}

	put(elem) {
		this.container.addChild(elem);
	}

	setMask(mask) {
		this.container.parent.addChild(mask);
		this.container.mask = mask;
		this.mask = mask;
	}

	switchMask() {
		if (this.container.mask) this.container.mask = null;
		else this.container.mask = this.mask;
	}

	getByName(name) {
		return this.container.getChildByName(name);
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
		this.info = [];
		if (ratio) this.ratio = ratio;
		else this.ratio = 16 / 9;
		container.addChild(this.container);
	}

	add(elem, x, y, w, byHeight) {
		let pos = new ElementInfo(x, y, w, byHeight);
		this.info[this.container.children.length] = pos;
		this.container.addChild(elem);
	}

	resize() {
		let w = app.screen.width, h = app.screen.height, c = new Point(w / 2, h / 2);
		if (w / this.ratio < h) {
			h = w / this.ratio;
		} else {
			w = h * this.ratio;
		}

		for (let i = 0; i < this.container.children.length; i++) {
			let e = this.container.children[i];
			let eratio = e.width / e.height;
			let einfo = this.info[i];

			if (einfo.byHeight) {
				e.height = w * einfo.width;
				e.width = e.height * eratio;
				e.x = w * einfo.x + c.x;
				e.y = h * einfo.y + c.y;
			} else {
				e.width = w * einfo.width;
				e.height = e.width / eratio;
				e.x = w * einfo.x + c.x;
				e.y = h * einfo.y + c.y;
			}
		}
	}

}

