class Viewport {
	constructor(application, ratio) { //ratio width/height
		this.app = application;
		this.animations = new Set();
		this.container = new PIXI.Container();
		this.active = false;
		this.w = 100;
		this.h = 100;
		this.c = { x: 0, y: 0 };
		if (ratio) this.ratio = ratio;
		else this.ratio = 16 / 9;
		this.app.stage.addChild(this.container);
	}

	createElement(prop) {
		let e;

		switch (prop.type) {
			case "round_rect":
				e = getRect(prop);
				break;
			case "sprite":
				e = getSprite(prop);
				break;
			case "text":
				e = getText(prop);
				break;
			case "button":
				e = getButton(prop);
				break;
		}
		this.container.addChild(e);
		return e;
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
		this.c.x -= this.w / 2;
		this.c.y -= this.h / 2;
		this.container.children.forEach(e => {
			this.resizeElement(e);
		});
	}

	createAnimation(animprop) {
		let a = new ViewportAnimation(animprop);
		this.animations.add(a);
		return a;
	}

	startAnimation() {
		this.active = true;
	}

	stopAnimation() {
		this.active = false;
	}

	pauseAnimation() {
		this.active = false;
	}

	show() {
		this.startAnimation();
	}

	hide() {
		this.stopAnimation();
	}

	loop() {
		if (this.active) {
			let flag = true;console.log()
			this.animation.forEach(a => {
				if (a.isActive) {
					a.tick();
				}
				if (a.isDone) this.animation.delete(a);
			})
		}
	}
}

class ViewportAnimation {
	constructor(prop) {
		this.type = prop.type;
		this.element = prop.element;
		switch(prop.type) {
			case "move":
				ViewportAnimation.getMoveAnimation(this, prop);
				break;
			case "rotate":
				ViewportAnimation.getRotateAnimation(this, prop);
				break;
			case "scale":
				ViewportAnimation.getScaleAnimation(this, prop);
				break;
			case "alpha":
				ViewportAnimation.getAlphaAnimation(this, prop);
				break;
		}
		if (prop.hasOwnProperty('next')) {
			this.next = prop.next;
		}

		this.isActive = false;
		this.isDone = false;
	}

	static getMoveAnimation(animation, prop) {
		animation.tick = function() {
			if (prop.hasOwnProperty('start')) {
				
			}
		}
	}

	static getRotateAnimation(animation, prop) {

	}

	static getScaleAnimation(animation, prop) {

	}

	static getAlphaAnimation(animation, prop) {

	}
}