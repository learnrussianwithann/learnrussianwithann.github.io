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

	static subtractPoint(a, b) {
		return new Point(a.x - b.x, a.y - b.y);
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

class Element extends PIXI.Container {
	constructor(name) {
		super();
		this.sprites = [];
		this.interactiveChildren = false;
		this.ratio = 1;
		if (name) this.name = name;
	}

	add(elem) {
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
	constructor(application, ratio) { //ratio width/height
		this.app = application;
		this.container = new PIXI.Container();
		this.w = 100;
		this.h = 100;
		this.c = new Point(this.w / 2, this.h / 2);
		if (ratio) this.ratio = ratio;
		else this.ratio = 16 / 9;
		this.app.stage.addChild(this.container);
	}

	add(elem, x, y, w, byHeight) {
		elem.info = {x:x, y:y, size:w, byHeight:byHeight};
		this.container.addChild(elem);
	}

	getContainer() {
		return this.container;
	}

	resizeElement(e) {
		e.calculateBounds();
		e.scale.set(1);
		e.ratio = e.width / e.height;
		if (e.info.byHeight) {
			e.height = this.w * e.info.size;
			e.width = e.height * e.ratio;
			e.x = this.w * e.info.x + this.c.x;
			e.y = this.h * e.info.y + this.c.y;
		} else {
			e.width = this.w * e.info.size;
			e.height = e.width / e.ratio;
			e.x = this.w * e.info.x + this.c.x;
			e.y = this.h * e.info.y + this.c.y;
		}
	}

	resize() {
		this.w = this.app.screen.width;
		this.h = this.app.screen.height;
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

	show() {
		this.container.visible = true;
	}

	hide() {
		this.container.visible = false;
	}
}

class Animator {
	constructor(application, fps) {
		this.application = application;
		window.animator = this;
		this.animations = { next: null };
		this.isRun = false;
		if (fps == null) this.fps = 60;
		else this.fps = fps;
		this.endFunc = null;
	}

	fmove(element, arg, steps) {
		element.x += arg.x * steps;
		element.y += arg.y * steps;
	}

	falpha(element, arg, steps) {
		element.alpha += arg * steps;
	}

	fscale(element, arg, steps) {
		element.scale.x += arg.x * steps;
		element.scale.y += arg.y * steps;
	}

	frotate(element, arg, steps) {
		element.rotation += arg * steps;
	}

	addNewAnimationMove(elem, start, end, time, endFunc) {
		if (start == null) start = new Point(elem.x, elem.y);
		let steps = Math.ceil(time * this.fps);
		let step = Point.subtractPoint(end, start).multiple(1 / steps);
		elem.position.set(start.x, start.y);
		new EAnimation(this.animations, elem, this.fmove, steps, step, endFunc);
		this.start();
	}

	addNewAnimationAlpha(elem, start, end, time, endFunc) {
		let steps = Math.ceil(time * this.fps);
		let disp = (end - start) / steps;
		elem.alpha = start;
		new EAnimation(this.animations, elem, this.falpha, steps, disp, endFunc);
		this.start();
	}

	addNewAnimationScale(elem, startScale, endScale, baseScale, time, endFunc) {
		if (startScale == null) startScale = elem.scale;
		else {
			if (!startScale.hasOwnProperty('x')) startScale = { x: startScale, y: startScale };
			startScale.x *= baseScale.x;
			startScale.y *= baseScale.y;
		}
		if (!endScale.hasOwnProperty('x')) endScale = { x: endScale, y: endScale };

		endScale.x *= baseScale.x;
		endScale.y *= baseScale.y;

		let steps = Math.ceil(time * this.fps);
		let step = Point.subtractPoint(endScale, startScale).multiple(1 / steps);
		new EAnimation(this.animations, elem, this.fscale, steps, step, endFunc);
		this.start();
	}

	addNewAnimationRotation(elem, startAngle = elem.rotation, endAngle, time, endFunc) { 
		let steps = Math.ceil(time * this.fps);
		let step = (endAngle - startAngle) / steps;
		if (elem.rotation != startAngle) elem.rotation == startAngle;
		new EAnimation(this.animations, elem, this.frotate, steps, step, endFunc);
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
			this.timerId = setInterval(function () { window.animator.tick() }, 1000 / this.fps);
		}
	}

	stop() {
		this.isRun = false;
		clearInterval(this.timerId);
		if (this.endFunc != null) this.endFunc();
		this.endFunc = null;
	}

	addAnimationJump(elem) {
		let tprep = 0.1;
		let tup = .1;
		let tdown = .1;
		let ttonormal = .1;
		let h = elem.getLocalBounds().height;
		let fMove = this.addNewAnimationMove.bind(this);
		setTimeout(function () {
			fMove(elem, null, { x: 0, y: -.05 * h }, tup, () => {
				fMove(elem, null, { x: 0, y: .01 * h }, tdown + tprep, () => {
					fMove(elem, null, { x: 0, y: 0 }, ttonormal);
				});
			});
		}, tprep * 1000);

		let fScale = this.addNewAnimationScale.bind(this);
		let baseScale = elem.scale.clone();
		fScale(elem, null, { x: 1.05, y: .95 }, baseScale, tprep, () => {
			fScale(elem, null, { x: .95, y: 1.05 }, baseScale, tup, () => {
				fScale(elem, null, 1, baseScale, tdown);
			})
		})
		// this.addNewAnimationScale(elem, { x: 2.05, y: .95 }, tprep, function () {
		// 	animator.addNewAnimationScale(elem, { x: .95, y: 1.05 }, tup, function () {
		// 		animator.addNewAnimationScale(elem, { x: 1, y: 1 }, tdown);
		// 	});
		// });
	}

	doAll() {
		while(this.animations.next !=null) {
			this.animations.next.doAll();
		}
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
		if (this.next != null) this.next.doAll();
	}

	end() {
		if (this.next) this.next.prev = this.prev;
		this.prev.next = this.next;
		if (this.endFunc != null) {
			this.endFunc();
		}
	}
}