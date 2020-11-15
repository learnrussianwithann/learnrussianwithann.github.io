'use strict';
const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x99fc92,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: false
});

const viewStart = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);
const viewGame = new Viewport(app, 16 / 9);

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
const VOWELS = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
const ELetters = [];

// const text_style = new PIXI.TextStyle({
// 	fontFamily: 'RubikMonoOne',
// 	fontSize: 30,
// 	fill: '#ffffff',
// 	wordWrap: false,
// 	letterSpacing: 0,
// 	align: 'center'
// });

const font = new FontFaceObserver('RubikMonoOne');

const loader = PIXI.Loader.shared;
loader.add('rocks', 'img/rocks.png')
	.add('flies', 'img/flies.png');

font.load().then(() => { loader.load(init); });


var isActive = true;
var left;
var letters = new Array(VOWELS.length);
var flies_info = new Array(VOWELS.length);
var flies = new Array(VOWELS.length);
var all_letters = new Array(LETTERS.length);
var all_positions = new Array(LETTERS.length);

function loop() {
	updater();
	// if (isActive)
	// 	window.requestAnimationFrame(loop);
}

function updater() {
	app.render();
}

function init(loader, resources) {
	gamefield.appendChild(app.view);
	// app.stop();
	window.addEventListener('resize', updater);

	initStart();
	initGame(resources);
	initEnd();

	viewStart.show();
	// window.requestAnimationFrame(loop);
}

function initStart() {
	viewStart.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .5,
		radius: .1,
		color: 0xf0ecad,
		x: .5,
		y: .5
	});

	viewStart.createElement({
		type: TEXT,
		text: 'start text\nsecond line',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			letterSpacing: 0,
			align: 'center'
		},
		byHeight: true,
		height: .1,
		x: .5,
		y: .4
	});

	let bstartStright = viewStart.createElement({
		type: BUTTON,
		text: 'По алфавиту',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0x197dff,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .06,
		x: .5,
		y: .65
	});

	let bstartRandom = viewStart.createElement({
		type: BUTTON,
		text: 'Случайно',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0x197dff,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .06,
		x: .5,
		y: .8
	});

	setButton(bstartStright, startStaright);
	setButton(bstartRandom, startRandom);
}

function initGame(res) {
	let sprites = new Array(9);
	for (let i = 0; i < 9; i++) {
		sprites[i] = new PIXI.Texture(res.rocks.texture.baseTexture, new PIXI.Rectangle(200 * (i % 3), 150 * Math.floor(i / 3), 200, 150));
	}
	let colums = 7;
	for (let i = 0; i < LETTERS.length; i++) {
		let x = i < 28 ? (i % colums) * .1 + .2 : (i % colums) * .1 + .3;
		let y = Math.floor(i / colums) * .17 + .16;
		let e = viewGame.createElement({
			type: SPRITE_WITH_TEXT,
			text: LETTERS[i],
			name: LETTERS[i],
			style: {
				fontFamily: 'RubikMonoOne',
				fontSize: 80,
				fill: '#ffffff',
				wordWrap: false,
				align: 'center'
			},
			text_anchor: {x:.5, y:.25},
			texture: sprites[i % 9],
			height: .08,
			width: .1,
			x: x,
			y: y
		});
		let ind = VOWELS.indexOf(LETTERS[i]);
		if (ind >= 0) {
			letters[ind] = e;
		}
		all_letters[i] = e;
		all_positions[i] = {x:x, y:y};
	}

	let spritesFlies = new Array(5);
	for (let i = 0; i < spritesFlies.length; i++) {
		spritesFlies[i] = new PIXI.Texture(res.flies.texture.baseTexture, new PIXI.Rectangle(350 * i, 0, 350, 350));
	}

	for (let i = 0; i < VOWELS.length; i++) {
		let x = i < 5 ? .1 : .9;
		let y = .1 + (i % 5) * .2;
		flies[i] = viewGame.createElement({
			type: SPRITE,
			texture: spritesFlies[i % spritesFlies.length],
			anchor: .5,
			height: .08,
			width: .08,
			x: x,
			y: y
		});
		setMoveable(flies[i], updater, check);
		flies_info[i] = flies[i].info.clone();
	}
}

function initEnd() {
	viewEnd.createElement({
		type: 'round_rect',
		width: .5,
		height: .5,
		radius: .1,
		color: 0xf0ecad,
		x: .5,
		y: .5
	});

	viewEnd.createElement({
		type: TEXT,
		text: 'start text\nsecond line',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			letterSpacing: 0,
			align: 'center'
		},
		byHeight: true,
		height: .1,
		x: .5,
		y: .4
	});

	let bstartStright = viewEnd.createElement({
		type: BUTTON,
		text: 'По алфавиту',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0x197dff,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .06,
		x: .5,
		y: .65
	});

	let bstartRandom = viewEnd.createElement({
		type: BUTTON,
		text: 'Случайно',
		style: {
			fontFamily: 'RubikMonoOne',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0x197dff,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .06,
		x: .5,
		y: .8
	});

	setButton(bstartStright, startStaright);
	setButton(bstartRandom, startRandom);
}

function startRandom() {
	for (let i = 0; i < all_letters.length; i++) {
		let a = all_letters[getRandomInt(all_letters.length)];
		let b = all_letters[getRandomInt(all_letters.length)];
		let c = { x:a.info.x, y:a.info.y};
		a.info.x = b.info.x;
		a.info.y = b.info.y;
		b.info.x = c.x;
		b.info.y = c.y;
	}

	startGame();
}

function startStaright(params) {
	for (let i = 0; i < all_letters.length; i++) {
		all_letters[i].info.x = all_positions[i].x;
		all_letters[i].info.y = all_positions[i].y;
	}
	startGame();
}

function startGame() {

	left = [...letters];
	for (let i = 0; i < flies.length; i++) {
		flies[i].info = flies_info[i].clone();
		setMoveable(flies[i], updater, check);
	}
	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
}

function check() {

	for (let i = 0; i < left.length; i++) {
		let e = left[i];
		let d = distElement(this.position, e.position) / viewGame.w;
		if (d < .05) {
			this.info.x = e.info.x;
			this.info.y = e.info.y - .05;
			this.info.scale = .7;
			viewGame.resizeElement(this);
			left.splice(i, 1);
			setUnmoveable(this);
			break;
		}
	}
	if (left.length == 0) setTimeout(endGame, 1000);
}

function endGame() {
	viewEnd.show();
	viewGame.hide();
}