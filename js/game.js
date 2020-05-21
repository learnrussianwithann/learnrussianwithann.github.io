'use strict';

var width = document.body.clientWidth;
var height = document.body.clientHeight;
var firstInteraction = false;
var isVertical = true;
var lastIsVertical = true;
var changeOrientation = false;

var indexSoft = Math.floor(Math.random() * 5);
var indexHard = Math.floor(Math.random() * 5);

const gamefield = document.getElementById('gamefield');
const greeting = document.getElementById('greeting');
const ending =  document.getElementById('ending');

// var scale = 1;
var drag = null;

class Point {

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
const SIZE_OF_HOUSE = 35;
const SIZE_OF_MONSTERS = 20;
const MIN_DIST_MONSTERS = 10;
const VOWELS_HARD = 'аоуэы';
const VOWELS_SOFT = 'иеяёю';
const CONSONANTS = 'нмткхбвгдзлпрсф';
const SYLLABLES_SOFT = ['йо', 'йе', 'ча', 'чо', 'чу', 'чи', 'че', 'чё', 'ща', 'що', 'щу', 'щи', 'ще', 'щё'];
const SYLLABLES_HARD = ['жа', 'жо', 'жу', 'жи', 'жю', 'же', 'жё', 'ша', 'шо', 'шу', 'ши', 'ше', 'шё', 'ца', 'цо', 'цу', 'ци', 'це', 'цю'];
const MONSTER_NAMES = ['m0', 'm2', 'm4', 'm5', 'm6', 'm7'];
const HOUSE_HARD = 'house_hard';
const HOUSE_SOFT = 'house_soft';
const FLAG = 'flag';
const BACK_LIGHT = 'backlight';

const POSITION_HARD_VERTICAL = new Point(50, 100 - SIZE_OF_HOUSE * .5);
const POSITION_HARD_HORIZONTAL = new Point(100 - SIZE_OF_HOUSE * .5, 50);
const POSITION_SOFT_VERTICAL = new Point(50, SIZE_OF_HOUSE * .7);
const POSITION_SOFT_HORIZONTAL = new Point(SIZE_OF_HOUSE * .5, 50);


loadImages();
const yes = new Audio();
const no = new Audio();
loadAudio();




class Element {
	//name of file; position in percent, scale in fraction, is draggable
	constructor(name, position, scale, dragable) {
		this.container = document.createElement('div');
		this.pos = new Point(0, 0);
		this.offImg = new Point(0, 0);
		this.offDrag = new Point(0, 0);
		this.scale = 0.1;
		this.dragable = false;

		this.img = imageLoader(name);
		this.pos = position;
		this.dragable = dragable;
		this.scale = scale;

		this.img.onload = function() {resize();};
		
		this.container.appendChild(this.img);
		this.container.style.position = 'absolute';
		this.toBackground();

		this.container.ondragstart = function() {return false;};

		if (dragable) this.container.className = 'monster';

		this.hide();

		gamefield.appendChild(this.container);
	}

	toForeground() {
		this.container.style.zIndex = 100;
		this.container.style.pointerEvents = 'none';
	}

	toBackground() {
		if (this.dragable) this.container.style.zIndex = Math.round(this.pos.y);
		else this.container.style.zIndex = 0;
		this.container.style.pointerEvents = 'auto';
	}

	setPosition(x, y) {
		if (x > 0 && y > 0 && x < 100 && y < 100) {
			this.pos.x = x;
			this.pos.y = y;
		this.updatePosition();
		}
	}

	setPositionPoint(point) {
		this.setPosition(point.x, point.y);
	}

	moveAt(x, y) { //in percent
		this.setPosition(x + this.offDrag.x, y + this.offDrag.y);
	}

	setOffset(x, y) {
		this.offDrag.x = this.pos.x - x;
		this.offDrag.y = this.pos.y - y;
	}

	updatePosition() {
		this.container.style.left = this.pos.x + '%';
		this.container.style.top = this.pos.y + '%';
	}

	resize() {
		let t = width < height ? width : height;
		this.img.height = t * this.scale / 100; 
		this.img.width = t * this.scale / 100;
		this.updatePosition();
	}

	show() {
		this.container.style.display = "block";
	}

	hide() {
		this.container.style.display = "none";
	}
}

class Monster extends Element {

	constructor(name, position, scale, dragable, isSoft) {
		super(name, position, scale, dragable);
		this.textDiv = document.createElement('div');
		this.isSoft = false;
		this.textDiv.className = 'syllable';
		this.container.appendChild(this.textDiv);
		if (isSoft) {
			this.isSoft = true;
			this.setText(getSoftSyllable());
		} else {
			this.setText(getHardSyllable());
		}
		if (Math.random() > .5) {
			this.img.style.transform = 'scaleX(-1)';
		}
		// let r = Math.floor(Math.random() * 40);
		// this.img.style['-webkit-filter'] = 'hue-rotate(' + r + 'deg)';
		// this.img.style['filter'] = 'hue-rotate(' + r + 'deg)';
	}


	setText(text) {
		this.textDiv.innerHTML = text;
	}
}

class House extends Element {
	
	constructor(name, position, scale, dragable, text) {
		super(name, position, scale, dragable);
		this.textDiv = document.createElement('div');
		this.flagDiv = document.createElement('div');
		this.backlightImg = imageLoader(BACK_LIGHT);

		this.container.className = 'house';
		this.textDiv.className = 'houseName';
		this.backlightImg.className = 'backlight';

		this.container.appendChild(this.backlightImg);

		this.textDiv.innerHTML = text;
		this.flagDiv.appendChild(this.textDiv);
		this.flagDiv.className = 'flag';
		this.flagimg = imageLoader(FLAG);

		this.flagDiv.appendChild(this.flagimg);
		this.container.appendChild(this.flagDiv);
	}

	resize() {
		let t = width < height ? width : height;
		this.img.height = t * this.scale / 100; 
		this.img.width = t * this.scale / 100;
		this.flagimg.width = t * this.scale / 120;
		this.updatePosition();
	}	

}

const houseSoft = new House(HOUSE_SOFT, POSITION_SOFT_HORIZONTAL, SIZE_OF_HOUSE, false, 'Мягкий дом');
const houseHard = new House(HOUSE_HARD, POSITION_HARD_HORIZONTAL, SIZE_OF_HOUSE, false, 'Твёрдый дом');

const monsters = [];

window.addEventListener("resize", resize);

window.addEventListener('mousedown', startMoving);
window.addEventListener('mousemove', moving);
window.addEventListener('mouseup', endMoving);

// window.addEventListener('touchstart', startMoving);
// window.addEventListener('touchmove', moving);
// window.addEventListener('touchend', endMoving);

window.ontouchstart = startMoving;;
window.ontouchmove = moving;
window.ontouchend = endMoving;

function startGame() {
	if (!firstInteraction) {
		//Safari fix?
		yes.play();
		yes.pause()
		yes.currentTime = 0
		no.play();
		no.pause()
		no.currentTime = 0


		firstInteraction = true;
	}

	hide(greeting);
	hide(ending);

	
	resize();
	let points = getPoints(NUM_OF_MONSTERS);

	for (var i = points.length - 1, j = 0; i >= 0; i--, j++) {
		if (j >= MONSTER_NAMES.length) j = 0;
		let m = new Monster(MONSTER_NAMES[j], points[i], SIZE_OF_MONSTERS, true, i < points.length / 2);
		monsters.push(m);
	}
	resize();
	showElements();

}

function endGame() {
	hideElements();
	show(ending);
}

function imageLoader(name) {
	let out = new Image();
	out.src = 'img/' + name + '.png';
	return out;
}



function loadImages() {
	imageLoader(HOUSE_SOFT);
	imageLoader(HOUSE_HARD);
	imageLoader(FLAG);
	imageLoader(BACK_LIGHT);
	for (var i = MONSTER_NAMES.length - 1; i >= 0; i--) {
		imageLoader(MONSTER_NAMES[i]);
	}
}


function loadAudio() {
	yes.src = 'audio/yes.mp3';
	no.src = 'audio/no.mp3';

	yes.load();
	no.load();
}

function getSoftSyllable() {
	if (Math.random() < 0.25) {
		return getRandom(SYLLABLES_SOFT);
	}
	if (indexSoft >= VOWELS_SOFT.length) indexSoft = 0;
	return getRandom(CONSONANTS) + VOWELS_SOFT[indexSoft++];
}

function getHardSyllable() {
	if (Math.random() < 0.25) {
		return getRandom(SYLLABLES_HARD);
	}
	if (indexHard >= VOWELS_SOFT.length) indexHard = 0;
	return getRandom(CONSONANTS) + VOWELS_HARD[indexHard++];
}

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
	if (r < SIZE_OF_MONSTERS * .45) return out;
	else return null;
}


function startMoving(e) {
	if (drag == null) {
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
		// console.log((drag.isSoft ? 'soft ' : 'hard ') + 'dist to hard  ' + drag.pos.distToPoint(houseHard.pos) + ' dist to soft ' + drag.pos.distToPoint(houseSoft.pos));
		if (drag.pos.distToPoint(houseSoft.pos) < .5 * SIZE_OF_HOUSE) {
			if (drag.isSoft) {
				// console.log('correct');
				correct();
			} else {
				// console.log('incorrect');
				incorrect();
			}
		} else if (drag.pos.distToPoint(houseHard.pos) < .5 * SIZE_OF_HOUSE) {
			if (!drag.isSoft) {
				// console.log('correct');
				correct();
			} else {
				// console.log('incorrect');
				incorrect();
			}
		}
		drag.toBackground();
		drag = null;
		if (monsters.length == 0) show(ending);
	}
}

function correct() {
	yes.play();
	remove(drag);
}

function incorrect() {
	no.play();
}

function remove(elem) {
	gamefield.removeChild(elem.container);
	monsters.splice(monsters.indexOf(elem), 1);
}

function checkOrientation() {
	lastIsVertical = isVertical;
	isVertical = width < height;
	changeOrientation = lastIsVertical != isVertical;
}

function resize()
{
	checkOrientation();
	width = document.body.clientWidth;
	height = document.body.clientHeight;
	if (width > height) {
		houseHard.pos = POSITION_HARD_HORIZONTAL;
		houseSoft.pos = POSITION_SOFT_HORIZONTAL;
	} else {
		houseHard.pos = POSITION_HARD_VERTICAL;
		houseSoft.pos = POSITION_SOFT_VERTICAL;
	}
	houseHard.resize();
	houseSoft.resize();
	for (var i = monsters.length - 1; i >= 0; i--) {
		monsters[i].resize();
	}
	if (changeOrientation) {
		reposition();
	}
}

function getRandomPoint() {
	return new Point(Math.random() * 80 + 10, Math.random() * 80 + 10);
}

function checkDist(index) {
	let p = monsters[index].pos;
	let i = monsters.length;
	while(i--) {
		if (i != index && monsters[i].pos.distToPoint(p) < SIZE_OF_MONSTERS) {
			return false;
		}
	}
	return houseSoft.pos.distToPoint(p) > SIZE_OF_HOUSE && houseHard.pos.distToPoint(p) > SIZE_OF_HOUSE; 
}

function reposition() {
	let count = 0;
	for (var i = monsters.length - 1; i >= 0; i--) {
		count = 0;
		if (!checkDist(i)) {
			while (count++ < 1000) {
				monsters[i].setPositionPoint(getRandomPoint());
				if (checkDist(i)) {
					break;
				}
			}
			if (count >= 1000) repositionAll();
		}
	}
}

function repositionAll() {
	// body...
}



function getPoints(num) {
	let out = [];
	let count = 0;
	while (count++ < 2000 && out.length < num) {
		let p = getRandomPoint();
		let add = true;
		let i = out.length;
		while(i--) {
			if (out[i].distToPoint(p) < SIZE_OF_MONSTERS) {
				add = false;
				break;
			}
		}
		if (houseSoft.pos.distToPoint(p) < SIZE_OF_HOUSE || houseHard.pos.distToPoint(p) < SIZE_OF_HOUSE) {
				add = false;
		}
		if (add) {
			out.push(p);
		}

	}
	return out;
}

function show(elem) {
	elem.style.display = "block";
}

function hide(elem) {
	elem.style.display = "none";
}

function showElements() {
	houseSoft.show();
	houseHard.show();

	for (var i = monsters.length - 1; i >= 0; i--) {
		monsters[i].show();
	}
}

function hideElements() {
	houseSoft.hide();
	houseHard.hide();

	for (var i = monsters.length - 1; i >= 0; i--) {
		monsters[i].hide();
	}
}

function exit() {
	hideElements();
	hide(ending);
}
