const SPRITE = 'sprite';
const SPRITE_WITH_TEXT = 'sprite_text';
const TEXT = 'text';
const TEXT_TEXTURED = 'text_textured';
const ROUND_RECT = 'round_rect';
const BUTTON = 'button';



class Info {
	constructor(width, height, byHeight, x, y) {
		this.width = width;
		this.height = height;
		this.ratio = width / height;
		this.byHeight = byHeight;
		this.scale = { x: 1, y: 1 };
		this.x = x;
		this.y = y;
	}

	setScale(scale) {
		if (scale.hasOwnProperty('x')) this.scale = scale;
		else this.scale = { x: scale, y: scale };
	}

	getSize(screenSize) {
		let out = { w: 0, h: 0 };
		if (this.byHeight) {
			out.h = this.height * screenSize;
			out.w = out.h * this.ratio * this.scale.x;
			out.h *= this.scale.y;
		} else {
			out.w = this.width * screenSize;
			out.h = (out.w / this.ratio) * this.scale.y;
			out.w *= this.scale.x;
		}
		return out;
	}

	clone() {
		return new Info(this.width, this.height, this.byHeight, this.x, this.y);
	}
}

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
		window.addEventListener('resize', () => { this.resize(); });
		this.hide();
	}

	createElement(prop) {
		this.calcScreenSize();
		let e;
		switch (prop.type) {
			case ROUND_RECT:
				e = getRect(prop);
				break;
			case SPRITE:
				e = getSprite(prop);
				break;
			case TEXT:
				e = getText(prop);
				break;
			case BUTTON:
				e = getButton(prop);
				break;
			case SPRITE_WITH_TEXT:
				e = getSpriteWithText(prop);
				break;
			case TEXT_TEXTURED:
				e = getText(prop);
				break;
		}
		if (prop.hasOwnProperty('byHeight') && prop.byHeight == true) {
			if (prop.hasOwnProperty('height'))
				e.info = new Info(prop.height * e.width / e.height, prop.height, prop.byHeight, prop.x, prop.y);
		}
		else if (prop.hasOwnProperty('width'))
			if (prop.hasOwnProperty('height')) e.info = new Info(prop.width, prop.height, prop.byHeight, prop.x, prop.y);
			else e.info = new Info(prop.width, prop.width * e.height / e.width, prop.byHeight, prop.x, prop.y);
		else e.info = new Info(e.width / this.w, e.height / this.w, prop.byHeight, prop.x, prop.y);

		this.container.addChild(e);
		this.resizeElement(e);
		return e;
	}

	resizeElement(e) {
		let size = e.info.getSize(this.w);
		e.height = size.h;
		e.width = size.w;
		e.x = this.w * e.info.x + this.k_w;
		e.y = this.h * e.info.y + this.k_h;
	}

	resize() {
		if (this.container.visible) {
			this.calcScreenSize();
			this.container.children.forEach(e => {
				this.resizeElement(e);
			});
		}

	}

	sort() {
		this.container.sortChildren();
	}

	calcScreenSize() {
		this.w = this.app.screen.width;
		this.h = this.app.screen.height;
		this.k_w = this.app.screen.width / 2;
		this.k_h = this.app.screen.height / 2;
		if (this.w / this.ratio < this.h) {
			this.h = this.w / this.ratio;
		} else {
			this.w = this.h * this.ratio;
		}
		this.k_w -= this.w / 2;
		this.k_h -= this.h / 2;
	}

	getRelativeCoordinates(element) {
		return {
			x: (element.position.x - this.k_w) / this.w,
			y: (element.position.y - this.k_h) / this.h
		};
	}

	createAnimation(animprop) {
		let a = new ViewportAnimation(animprop, this);
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
		this.container.visible = true;
		this.resize();
		this.startAnimation();
	}

	hide() {
		this.stopAnimation();
		this.container.visible = false;
	}

	loop() {
		if (this.active) {
			let flag = true; console.log()
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
	constructor(prop, viewport) {
		this.type = prop.type;
		this.element = prop.element;
		this.isActive = false;
		this.isDone = false;
		switch (prop.type) {
			case "move":
				ViewportAnimation.getMoveAnimation(this, prop, viewport);
				break;
			case "rotate":
				ViewportAnimation.getRotateAnimation(this, prop, viewport);
				break;
			case "scale":
				ViewportAnimation.getScaleAnimation(this, prop, viewport);
				break;
			case "alpha":
				ViewportAnimation.getAlphaAnimation(this, prop, viewport);
				break;
		}
	}

	static getMoveAnimation(animation, prop, viewport) {
		let displacement =
		{
			x: prop.end.x - prop.start.x,
			y: prop.end.y - prop.start.y
		}
		let disp_per_ms =
		{
			x: displacement.x / prop.duration,
			y: displacement.y / prop.duration
		};
		let last_time = performance.now();
		animation.isActive = prop.isActive;
		animation.tick = function (time) {
			let time_pass = time - last_time;
			let dispX = time_pass * disp_per_ms.x;
			let dispY = time_pass * disp_per_ms.y;

			last_time = performance.now();

			if (Math.abs(displacement.x) > Math.abs(dispX)) {
				displacement.x -= dispX;
				displacement.y -= dispY;
				animation.element.info.x += dispX;
				animation.element.info.y += dispY;
			} else {
				animation.element.info.x += displacement.x;
				animation.element.info.y += displacement.y;
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone && prop.hasOwnProperty('end_action')) prop.end_action();

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}
		if (animation.isActive) window.requestAnimationFrame(animation.tick);
	}

	static getRotateAnimation(animation, prop, viewport) {

	}

	static getScaleAnimation(animation, prop, viewport) {
		let displacement =
		{
			x: prop.end.x - prop.start.x,
			y: prop.end.y - prop.start.y
		}
		let disp_per_ms =
		{
			x: displacement.x / prop.duration,
			y: displacement.y / prop.duration
		};
		let last_time = performance.now();
		animation.isActive = prop.isActive;
		animation.tick = function (time) {
			let time_pass = time - last_time;
			let dispX = time_pass * disp_per_ms.x;
			let dispY = time_pass * disp_per_ms.y;

			last_time = performance.now();

			if (Math.abs(displacement.x) > Math.abs(dispX)) {
				displacement.x -= dispX;
				displacement.y -= dispY;
				animation.element.info.scale.x += dispX;
				animation.element.info.scale.y += dispY;
			} else {
				animation.element.info.scale.x += displacement.x;
				animation.element.info.scale.y += displacement.y;
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone && prop.hasOwnProperty('end_action')) prop.end_action();

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}
		if (animation.isActive) window.requestAnimationFrame(animation.tick);
	}

	static getAlphaAnimation(animation, prop, viewport) {

	}
}

class SoundBuffer {
	constructor(path, size, loop) {
		this.buffer = new Array(size);
		for (let i = 0; i < this.buffer.length; i++) {
			this.buffer[i] = PIXI.sound.Sound.from(path);
			this.buffer[i].loop = loop ? true : false;
		}
	}

	play() {
		let count = this.buffer.length;
		this.buffer.forEach(e => {
			if (!e.isPlaying) count--;
		});
		if (count < this.buffer.length) {
			this.buffer[count].play();
		}
	}

	stop() {
		for (let i = 0; i < this.buffer.length; i++) {
			if (this.buffer[i].isPlaying) {
				this.buffer[i].stop();
				break;
			}
		}


	}
}