'use strict';

var width = document.body.clientWidth;
var height = document.body.clientHeight;

const wrapper = document.getElementById('wrapper');

// var scale = 1;
var drag = null;

class Point {
	x;
	y;

	constructor(x, y) {
		this.x = x;
		this.y = y;
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

const NUM_OF_MONSTERS = 10;
const POSITION_HARD_VERTICAL = new Point(50, 92);
const POSITION_HARD_HORIZONTAL = new Point(92, 50);
const POSITION_SOFT_VERTICAL = new Point(50, 8);
const POSITION_SOFT_HORIZONTAL = new Point(8, 50);
const SIZE_OF_HOUSE = 0.25;
const SIZE_OF_MONSTERS = 0.2;
const MIN_DIST_MONSTERS = 10;
const VOWELS_HARD = 'АУОЫЭ';
const VOWELS_SOFT = 'ИЕЯЁЮЭ';
const CONSONANTS = 'НМТКХБВГДЗЛПРСФ';
const MONSTER_NAMES = ['monster_0', 'monster_1', 'monster_2', 'monster_3', 'monster_4'];

class Element {
	img = new Image();
	pos = new Point(0, 0);
	offImg = new Point(0, 0);
	offDrag = new Point(0, 0);
	scale = 0.1;
	div = document.createElement('div');

	dragable = false;
	//name of file; position in percent, scale in fraction, is draggable
	constructor(name, position, scale, dragable) { 
		this.img.src = 'img/' + name + '.png';
		this.pos = position;
		this.dragable = dragable;
		this.scale = scale;

		this.img.onload = function() {resize();};
		
		this.div.appendChild(this.img);
		this.div.style.position = 'absolute';
		this.toBackground();

		this.div.ondragstart = function() {return false;};

		if (dragable) this.div.className = 'monster';

		wrapper.appendChild(this.div);
	}

	toForeground() {
		this.div.style.zIndex = 100;
	}

	toBackground() {
		if (this.dragable) this.div.style.zIndex = Math.round(this.pos.y);
		else this.div.style.zIndex = 0;
	}

	setPosition(x, y) {
		this.pos.x = x;
		this.pos.y = y;
		this.updatePosition();
	}

	moveAt(x, y) { //in percent
		this.setPosition(x + this.offDrag.x, y + this.offDrag.y);
	}

	setOffset(x, y) {
		this.offDrag.x = this.pos.x - x;
		this.offDrag.y = this.pos.y - y;
	}

	updatePosition() {
		this.div.style.left = this.pos.x - this.offImg.x + '%';
		this.div.style.top = this.pos.y - this.offImg.y + '%';
	}

	resize() {
		let t = width < height ? width : height;
		this.img.height = t * this.scale; //relative to width
		this.img.width = t * this.scale;
		this.offImg.x = 50 * this.img.width / width;
		this.offImg.y = 50 * this.img.height / height;
		this.updatePosition();
	}
}

class Monster extends Element {

	textDiv = document.createElement('div');
	isSoft = false;

	constructor(name, position, scale, dragable, isSoft) {
		super(name, position, scale, dragable);
		this.textDiv.className = 'text';
		this.div.appendChild(this.textDiv);
		if (isSoft) {
			this.isSoft = true;
			this.setText(getRandom(CONSONANTS) + getRandom(VOWELS_SOFT));
		} else {
			this.setText(getRandom(CONSONANTS) + getRandom(VOWELS_HARD));
		}
		if (Math.random() > .5) {
			this.img.style.transform = 'scaleX(-1)';
		}
		let r = Math.floor(Math.random() * 180);
		this.img.style['-webkit-filter'] = 'hue-rotate(' + r + 'deg)';
		this.img.style['filter'] = 'hue-rotate(' + r + 'deg)';
	}


	setText(text) {
		this.textDiv.innerHTML = '<h1>'+ text + '</h1>';
	}

}
//const monster = new Element('1212121', .5, .5, true, 150, 150);

const houseSoft = new Element('house_soft', POSITION_SOFT_HORIZONTAL, SIZE_OF_HOUSE, false);
const houseHard = new Element('house_hard', POSITION_HARD_HORIZONTAL, SIZE_OF_HOUSE, false);

const monsters = [];

let points = getPoints(NUM_OF_MONSTERS);

for (var i = points.length - 1; i >= 0; i--) {
	let m = new Monster(getRandom(MONSTER_NAMES), points[i], SIZE_OF_MONSTERS, true, Math.random() > .5);
	monsters.push(m);
}

resize();
window.addEventListener("resize", resize);

window.addEventListener('mousedown', startMoving);
window.addEventListener('mousemove', moving);
window.addEventListener('mouseup', endMoving);

window.addEventListener('touchstart', startMoving);
window.addEventListener('touchmove', moving);
window.addEventListener('touchend', endMoving);


function getRandom(source) {
	return source[Math.floor(source.length * Math.random())];
}

function closest(x, y) {
	let r = 100;
	let out;
	for (var i = monsters.length - 1; i >= 0; i--) {
		let t = monsters[i].pos.dist(x, y);
		if (t < r) {
			r = t;
			out = monsters[i];
		} 
	}
	if (r < SIZE_OF_MONSTERS * 45) return out;
	else return null;
}


function startMoving(e) {
	let x, y;
	if (e.type == 'touchstart') {
		x = 100 * e.changedTouches[0].clientX / width;
		y = 100 * e.changedTouches[0].clientY / height;
	} else {
		x = 100 * e.clientX / width;
		y = 100 * e.clientY / height;
	}
	drag = closest(x, y);
	if (drag) {
		drag.setOffset(x, y);
		drag.toForeground();
	}
}

function moving(e) {
	if (drag != null) {
		if (e.type == 'touchmove') {
			drag.moveAt(100 * e.changedTouches[0].clientX / width,
						100 * e.changedTouches[0].clientY / height);
		} else {
			drag.moveAt(100 * e.clientX / width, 100 * e.clientY / height);
		}
	}
}

function endMoving(e) {
	if (drag) {
		console.log((drag.isSoft ? 'soft ' : 'hard ') + 'dist to hard  ' + drag.pos.distToPoint(houseHard.pos) + ' dist to soft ' + drag.pos.distToPoint(houseSoft.pos));
		if (drag.pos.distToPoint(houseSoft.pos) < 10) {
			if (drag.isSoft) {
				console.log('correct');
				remove(drag);
			} else {
				console.log('incorrect');
			}
		} else if (drag.pos.distToPoint(houseHard.pos) < 10) {
			if (!drag.isSoft) {
				console.log('correct');
				remove(drag);
			} else {
				console.log('incorrect');
			}
		}
		drag.toBackground();
		drag = null;
	}
}

function remove(elem) {
	wrapper.removeChild(elem.div);
	monsters.splice(monsters.indexOf(elem), 1);
}

function resize()
{
	width = document.body.clientWidth;
	height = document.body.clientHeight;
	if (width > height) {
//		scale = height / 1000;
		houseHard.pos = POSITION_HARD_HORIZONTAL;
		houseSoft.pos = POSITION_SOFT_HORIZONTAL;
	} else {
//		scale = width / 1000;
		houseHard.pos = POSITION_HARD_VERTICAL;
		houseSoft.pos = POSITION_SOFT_VERTICAL;
	}
	houseHard.resize();
	houseSoft.resize();
	for (var i = monsters.length - 1; i >= 0; i--) {
		monsters[i].resize();
	}
}

function getPoints(num) {
	let out = [];
	let count = 0;
	while (count++ < 2000 && out.length < num) {
		let p = new Point(Math.random() * 60 + 20, Math.random() * 60 + 20);
		let add = true;
		let i = out.length;
		while(i--) {
			if (out[i].distToPoint(p) < SIZE_OF_MONSTERS * 60) {
				add = false;
				break;
			}
		}
		if (add) {
			out.push(p);
		}

	}
	return out;
}
