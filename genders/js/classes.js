const SPRITE = 'sprite';
const SPRITE_WITH_TEXT = 'sprite_text';
const TEXT = 'text';
const TEXT_TEXTURED = 'text_textured';
const ROUND_RECT = 'round_rect';
const BUTTON = 'button';
const SHAPE = 'shape';

const ANIM_MOVE = 'move';
const ANIM_ROTATE = 'rot';
const ANIM_SCALE = 'scale';
const ANIM_ALPHA = 'alpha';
const ANIM_ANCHOR_LOOP = 'anloop';



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

	setScale(x = 0, y = x) {
		this.scale.x = x;
		this.scale.y = y;
	}

	setPosition(x = 0, y = x) {
		this.x = x;
		this.y = y;
	}

	setPosByPoint(pos) {
		this.x = pos.x;
		this.y = pos.y;
	}

	getPosition() {
		return { x: this.x, y: this.y };
	}

	getScale() {
		return { x: this.scale.x, y: this.scale.y };
	}

	copyPosition(element) {
		this.x = element.info.x;
		this.y = element.info.y;
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

	// ROUND_RECT prop(type, width*, height*, byHeight*, radius, color, x, y) *optional
	// SPRITE prop(type, texture, x, y, name*, anchor*, width*, height*, byHeight*) *optional
	// TEXT prop(type, text, style, width*, height*, byHeight*, x, y) *optional
	// BUTTON prop(type, text, style, bcolor, bwidth*, bheight*, width*, height*, byHeight*, x, y) *optional
	// SPRITE_WITH_TEXT prop(type, texture, text, style, name*, anchor*, text_anchor*, width*, height*, byHeight*, x, y) *optional
	// TEXT_TEXTURED prop(type, text, style, texture, textureSize{x,y}, width*, height*, byHeight*, x, y) *optional
	// SHAPE prop(type, text, style, texture, width*, height*, byHeight*, x, y) *optional

	createElement(prop) {
		this.calcScreenSize();
		let e;
		switch (prop.type) {
			case ROUND_RECT:			
				e = getRect(prop.width, prop.height, prop.color, prop.radius);
				break;
			case SPRITE:				
				e = getSprite(prop);
				break;
			case TEXT:				
				e = getText(prop.text, prop.style);
				break;
			case BUTTON:				
				e = getButton(prop);
				break;
			case SPRITE_WITH_TEXT:				
				e = getSpriteWithText(prop);
				e.setText = (text) => {
					e.getChildByName('text').text = text;
				};
				break;
			case TEXT_TEXTURED:				
				e = getTexturedText(prop);
				break;
			case SHAPE:				
				e = getShape(prop.polygons);
				break;
		}
		this.addElement(e, prop);

		// if (prop.hasOwnProperty('byHeight') && prop.byHeight == true) {
		// 	if (prop.hasOwnProperty('height'))
		// 		e.info = new Info(prop.height * e.width / e.height, prop.height, prop.byHeight, prop.x, prop.y);
		// }
		// else if (prop.hasOwnProperty('width'))
		// 	if (prop.hasOwnProperty('height')) e.info = new Info(prop.width, prop.height, prop.byHeight, prop.x, prop.y);
		// 	else e.info = new Info(prop.width, prop.width * e.height / e.width, prop.byHeight, prop.x, prop.y);
		// else e.info = new Info(e.width / this.w, e.height / this.w, prop.byHeight, prop.x, prop.y);

		// this.container.addChild(e);
		// this.resizeElement(e);
		return e;
	}

	//prop: width*, height*, byHeight*, x, y; *optional

	addElement(e, prop) {
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

	// animation types:
	// ANIM_MOVE type, element, start(x,y), end(x,y), isActive, end_action()
	// ANIM_ROTATE type, element, start, end, duration, isActive, end_action()
	// ANIM_SCALE type, element, start(x,y), end(x,y), isActive, end_action()
	// ANIM_ALPHA type, element, start, end, duration, isActive, end_action()
	// ANIM_ANCHOR_LOOP type, element, duration, function(progress) returns a(x,y) new element anchor


	createAnimation(animprop) {
		let a = new ViewportAnimation(animprop, this);
		if (a.hasOwnProperty('tick')) return a;
		else return null;
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
			case ANIM_MOVE:
				if (prop.element.hasOwnProperty('move_animation') && prop.element.move_animation != null) return;
				ViewportAnimation.getMoveAnimation(this, prop, viewport);
				break;
			case ANIM_ROTATE:
				if (prop.element.hasOwnProperty('rotate_animation') && prop.element.rotate_animation != null) return;
				ViewportAnimation.getRotateAnimation(this, prop, viewport);
				break;
			case ANIM_SCALE:
				if (prop.element.hasOwnProperty('scale_animation') && prop.element.scale_animation != null) return;
				ViewportAnimation.getScaleAnimation(this, prop, viewport);
				break;
			case ANIM_ALPHA:
				if (prop.element.hasOwnProperty('alpha_animation') && prop.element.alpha_animation != null) return;
				ViewportAnimation.getAlphaAnimation(this, prop, viewport);
				break;
			case ANIM_ANCHOR_LOOP:
				if (prop.element.hasOwnProperty('anchor_loop_animation') && prop.element.anchor_loop_animation != null) return;
				ViewportAnimation.getAnchorLoopAnimation(this, prop, viewport);
				break;
		}
	}

	start() {
		window.requestAnimationFrame(this.tick);
		this.start_time = performance.now();
	}

	static getMoveAnimation(animation, prop, viewport) {
		prop.element.move_animation = animation;
		let start = prop.hasOwnProperty('start') ? prop.start : animation.element.info.getPosition();
		let displacement =
		{
			x: prop.end.x - start.x,
			y: prop.end.y - start.y
		};
		animation.isActive = prop.hasOwnProperty('isActive') ? prop.isActive : true;
		animation.tick = function (time) {
			let progress = (time - animation.start_time) / prop.duration;
			if (progress > 1) progress = 1;

			animation.element.info.x = displacement.x * progress + start.x;
			animation.element.info.y = displacement.y * progress + start.y;

			if (progress >= 1) {
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone) {
				prop.element.move_animation = null;
				if (prop.hasOwnProperty('end_action')) prop.end_action();
			}

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}
		if (animation.isActive) animation.start();
	}

	static getRotateAnimation(animation, prop, viewport) {
		prop.element.rotate_animation = animation;
		let start = prop.hasOwnProperty('start') ? prop.start : animation.element.angle;
		let displacement = prop.end - start;

		animation.isActive = prop.hasOwnProperty('isActive') ? prop.isActive : true;

		animation.tick = function (time) {
			let progress = (time - animation.start_time) / prop.duration;
			if (progress > 1) progress = 1;

			animation.element.angle = displacement * progress + start;
			
			if (progress >= 1) {
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone) {
				prop.element.rotate_animation = null;
				if (prop.hasOwnProperty('end_action')) prop.end_action();
			}

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}

		if (animation.isActive) animation.start();
	}

	static getScaleAnimation(animation, prop, viewport) {
		prop.element.scale_animation = animation;
		let start = prop.hasOwnProperty('start') ? prop.start : prop.element.info.getScale();
		let displacement =
		{
			x: prop.end.x - start.x,
			y: prop.end.y - start.y
		}
		animation.isActive = prop.hasOwnProperty('isActive') ? prop.isActive : true;
		animation.tick = function (time) {
			let progress = (time - animation.start_time) / prop.duration;
			if (progress > 1) progress = 1;
			animation.element.info.scale.x = displacement.x * progress + start.x;
			animation.element.info.scale.y = displacement.y * progress + start.y;

			if (progress >= 1) {
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone) {
				prop.element.scale_animation = null;
				if (prop.hasOwnProperty('end_action')) prop.end_action();
			}

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}
		if (animation.isActive) animation.start();
	}

	static getAlphaAnimation(animation, prop, viewport) {
		prop.element.alpha_animation = animation;

		let displacement = prop.end - prop.start;

		animation.isActive = prop.hasOwnProperty('isActive') ? prop.isActive : true;

		animation.tick = function (time) {
			let progress = (time - animation.start_time) / prop.duration;
			if (progress > 1) progress = 1;

			animation.element.alpha = displacement * progress + prop.start;

			if (progress >= 1) {
				animation.isActive = false;
				animation.isDone = true;
			}

			viewport.resizeElement(animation.element);

			if (animation.isDone) {
				prop.element.alpha_animation = null;
				if (prop.hasOwnProperty('end_action')) prop.end_action();
			}

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}

		if (animation.isActive) animation.start();
	}

	static getAnchorLoopAnimation(animation, prop, viewport) {
		prop.element.anchor_loop_animation = animation;

		animation.isActive = prop.hasOwnProperty('isActive') ? prop.isActive : true;

		animation.tick = function (time) {
			let progress = (time - animation.start_time) / prop.duration;
			if (progress > 1) {
				progress = 1;
				animation.start_time = performance.now();
			}

			let a = prop.function(progress);
			animation.element.anchor.set(a.x, a.y);
			// viewport.resizeElement(animation.element);

			if (animation.isDone) {
				animation.isActive = false;
				prop.element.anchor_loop_animation = null;
				if (prop.hasOwnProperty('end_action')) prop.end_action();
			}

			if (animation.isActive) window.requestAnimationFrame(animation.tick);

		}

		if (animation.isActive) animation.start();
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