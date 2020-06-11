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

	multiple(d) {
		this.x *= d;
		this.y *= d;
		return this;
	}

	subtractPoint(d) {
		this.x -= d.x;
		this.y -= d.y;
		return this;
	}

	sumPoint(d) {
		this.x += d.x;
		this.y += d.y;
		return this;
	}

	dist(x, y) {
		return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
	}

	distToPoint(point) {
		return this.dist(point.x, point.y);
	}

	static getVector(a, b) {
		return new Point(b.x - a.x, b.y - a.y);
	}

	static getPoint(elem) {
		return new Point(elem.x, elem.y);
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

class Animator {
	constructor(application, fps) {
		this.application = application;
		this.application.animator = this;
		this.animations = { next: null };
		this.isRun = false;
		if (fps == null) this.fps = 60;
		else this.fps = fps;
	}

	addNewAnimationMove(elem, disp, end, time, endFunc) {
		if (disp != null) {
			elem.x = end.x - disp.x;
			elem.y = end.y - disp.y;
		} else {
			disp = new Point(end.x - elem.x, end.y - elem.y);
		}
		let steps = Math.ceil(time * this.fps);
		let step = disp.multiple(1 / steps);
		new EAnimation(this.animations, elem, fmove, steps, step, endFunc);
		this.start();
	}

	addNewAnimationAlpha(elem, agr, time, endFunc) {
		let steps = Math.ceil(time * this.fps);
		let disp = agr / steps;
		new EAnimation(this.animations, elem, falpha, steps, disp, endFunc);
		this.start();
	}

	addNewAnimationScale(elem, disp, end, time, endFunc) {
		if (disp != null) {
			elem.scale.x = end.x - disp.x;
			elem.scale.y = end.y - disp.y;
		} else {
			disp = new Point(end.x - elem.scale.x, end.y - elem.scale.y);
		}

		let steps = Math.ceil(time * this.fps);
		let step = disp.multiple(1 / steps);
		new EAnimation(this.animations, elem, fscale, steps, step, endFunc);
		this.start();
	}

	tick() {
		if (this.animations.next == null) this.stop();
		else this.animations.next.do();
		this.application.render();
	}

	start() {
		if (!this.isRun) {
			this.isRun = true;
			this.timerId = setInterval(function () { animator.tick() }, 1000 / this.fps);
		}
	}

	stop() {
		this.isRun = false;
		clearInterval(this.timerId);
	}
}

class EAnimation {
	constructor(prev, element, func, steps, arg, endFunc) {
		this.prev = prev;
		if (prev.next) {
			prev.next.prev = this;
			this.next = prev.next;
		}
		prev.next = this;
		this.count = steps;
		this.element = element;
		this.func = func;
		this.arg = arg
		this.endFunc = endFunc;
	}

	do() {
		if (this.count > 0) {
			this.func(this.element, this.arg, 1);
			this.count--;
		} else {
			this.end();
		}
		if (this.next != null) this.next.do();
	}

	doAll() {
		this.func(this.element, this.arg, this.count);
		this.count = -1;
		this.end();
	}

	end() {
		if (this.endFunc != null) {
			this.endFunc();
		}
		if (this.next) this.next.prev = this.prev;
		this.prev.next = this.next;
	}
}