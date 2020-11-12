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
var left = new Array(10);

// for (let i = 0; i < LETTERS.length; i++) {
// 	let l = LETTERS[i];
// 	let e = new Element(l);
// 	e.isVowel = VOWELS.includes(l);
// 	ELetters.push(e);
// }

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

	let bstart = viewStart.createElement({
		type: BUTTON,
		text: 'start',
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
		height: .08,
		x: .5,
		y: .7
	});

	setButton(bstart, startGame);
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
				fontSize: 90,
				fill: '#ffffff',
				wordWrap: false,
				align: 'center'
			},
			texture: sprites[i % 9],
			height: .08,
			width: .1,
			x: x,
			y: y
		});
		let ind = VOWELS.indexOf(LETTERS[i]);
		if (ind >= 0) left[ind] = e;
	}

	let spritesFlies = new Array(5);
	for (let i = 0; i < spritesFlies.length; i++) {
		spritesFlies[i] = new PIXI.Texture(res.flies.texture.baseTexture, new PIXI.Rectangle(350 * i, 0, 350, 350));
	}

	for (let i = 0; i < VOWELS.length; i++) {
		let f = viewGame.createElement({
			type: SPRITE,
			texture: spritesFlies[i % spritesFlies.length],
			anchor: .5,
			height: .08,
			width: .08,
			x: i < 5 ? .1 : .9,
			y: .1 + (i % 5) * .2
		});
		setMoveable(f, updater, check);
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

	let bstart = viewEnd.createElement({
		type: 'button',
		text: 'start',
		style: new PIXI.TextStyle({
			fontFamily: 'RubikMonoOne',
			fontSize: 50,
			fill: '#ffffff',
			wordWrap: false,
			letterSpacing: 0
		}),
		bcolor: 0x197dff,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .08,
		x: .5,
		y: .7
	});

	setButton(bstart, startGame);
}

function startGame() {
	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
}

function check() {
	left.forEach(e => {
		let d = distElement(this.position, e) / viewGame.w;
		if (d < .05) {
			this.info.x = e.info.x;
			this.info.y = e.info.y;
			viewGame.resizeElement(this);
			left.splice();
		}
	});

	for (let i = 0; i < left.length; i++) {
		let e = left[i];
		let d = distElement(this.position, e) / viewGame.w;
		if (d < .05) {
			this.info.x = e.info.x;
			this.info.y = e.info.y;
			viewGame.resizeElement(this);
			left.splice(i, 1);
			setUnmoveable(this);
			break;
		}
	}
	if (left.length == 0) endGame();
}

function endGame() {
	viewEnd.show();
	viewGame.hide();
}