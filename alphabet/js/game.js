'use strict';
const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x61d3da,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: false,
	forceCanvas: true
});

const viewStart = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);
const viewGame = new Viewport(app, 16 / 9);

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
const VOWELS = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
const ELetters = [];

const sound_A = PIXI.sound.Sound.from('sound/A.mp3');
const sound_E = PIXI.sound.Sound.from('sound/E.mp3');
const sound_I = PIXI.sound.Sound.from('sound/I.mp3');
const sound_O = PIXI.sound.Sound.from('sound/O.mp3');
const sound_U = PIXI.sound.Sound.from('sound/U.mp3');
const sound_YA = PIXI.sound.Sound.from('sound/YA.mp3');
const sound_YI = PIXI.sound.Sound.from('sound/YI.mp3');
const sound_YO = PIXI.sound.Sound.from('sound/YO.mp3');
const sound_YU = PIXI.sound.Sound.from('sound/YU.mp3');
const sound_AE = PIXI.sound.Sound.from('sound/AE.mp3');
const sound_fly = new SoundBuffer('sound/fly.mp3', 3, true);



// const text_style = new PIXI.TextStyle({
// 	fontFamily: 'RubikMonoOne',
// 	fontSize: 30,
// 	fill: '#ffffff',
// 	wordWrap: false,
// 	letterSpacing: 0,
// 	align: 'center'
// });

const font = new FontFaceObserver('OpenSans');
const font2 = new FontFaceObserver('RubikMonoOne');

const loader = PIXI.Loader.shared;
loader.add('rocks', 'img/rocks.png')
	.add('flies', 'img/flies.png');

font.load().then(() => { font2.load().then(() => { loader.load(init); }) });


var isActive = true;
var left;
var letters = new Array(VOWELS.length);
var flies_info = new Array(VOWELS.length);
var flies = new Array(VOWELS.length);
var all_letters = new Array(LETTERS.length);
var all_positions = new Array(LETTERS.length);



function init(loader, resources) {
	gamefield.appendChild(app.view);
	// app.stop();

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
		color: 0x5d70bc,
		x: .5,
		y: .5
	});

	viewStart.createElement({
		type: TEXT,
		text: 'Помоги жучкам \nнайти островки \nс гласными буквами',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 60,
			fill: '#ffffff',
			wordWrap: false,
			letterSpacing: 0,
			align: 'center'
		},
		byHeight: true,
		height: .15,
		x: .5,
		y: .35
	});

	let bstartStright = viewStart.createElement({
		type: BUTTON,
		text: 'По алфавиту',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0xff6968,
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
			fontFamily: 'OpenSans',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0xff6968,
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
		let x = i < 28 ? (i % colums) * .1 + .3 : (i % colums) * .1 + .4;
		let y = Math.floor(i / colums) * .17 + .16;
		// if ((i % colums == 0 && i != 28) || i % colums == colums - 1) y += .08
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
			text_anchor: { x: .5, y: .25 },
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
		all_positions[i] = { x: x, y: y };
	}

	let spritesFlies = new Array(10);
	for (let i = 0; i < spritesFlies.length; i++) {
		spritesFlies[i] = new PIXI.Texture(res.flies.texture.baseTexture, new PIXI.Rectangle(200 * i, 0, 200, 200));
	}

	for (let i = 0; i < VOWELS.length; i++) {
		let x = i < 5 ? .1 : .2;
		let y = .2 + (i % 5) * .15;
		flies[i] = viewGame.createElement({
			type: SPRITE,
			texture: spritesFlies[i % spritesFlies.length],
			anchor: .5,
			height: .08,
			width: .08,
			x: x,
			y: y
		});
		flies_info[i] = flies[i].info.clone();
	}
}

function initEnd() {
	viewEnd.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .5,
		radius: .1,
		color: 0x5d70bc,
		x: .5,
		y: .5
	});

	viewEnd.createElement({
		type: TEXT,
		text: 'Все жучки нашли островки!',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 60,
			fill: '#ffffff',
			wordWrap: false,
			letterSpacing: 0,
			align: 'center'
		},
		byHeight: false,
		width: .5,
		x: .5,
		y: .35
	});

	let bagain = viewEnd.createElement({
		type: BUTTON,
		text: 'Сыграть еще раз',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0xff6968,
		k_w: 2,
		k_h: 1.8,
		width: .3,
		height: .06,
		x: .5,
		y: .65
	});

	setButton(bagain, showStart);
}

function startRandom() {
	for (let i = 0; i < all_letters.length; i++) {
		let a = all_letters[getRandomInt(all_letters.length)];
		let b = all_letters[getRandomInt(all_letters.length)];
		let c = { x: a.info.x, y: a.info.y };
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

	letters.forEach(e => {
		e.children[1].style.fill = '#ffffff';
		setInactive(e);
	})

	left = [...letters];
	for (let i = 0; i < flies.length; i++) {
		flies[i].info = flies_info[i].clone();
		setMoveable(flies[i], up, down);
	}
	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
}

function up() {
	let fly = this;
	let coord = viewGame.getRelativeCoordinates(this);
	let found = false;
	this.zIndex = 0;
	for (let i = 0; i < left.length; i++) {
		let e = left[i];
		let d = distElement(this.position, e.position) / viewGame.w;
		if (d < .05) {
			found = true;
			// this.info.scale = .7;
			this.info.x = coord.x;
			this.info.y = coord.y;

			viewGame.createAnimation({
				element: this,
				type: 'scale',
				start: { x: this.info.scale.x, y: this.info.scale.y },
				end: { x: .7, y: .7 },
				duration: 500,
				isActive: true
			});

			viewGame.createAnimation({
				element: this,
				type: 'move',
				start: coord,
				end: { x: e.info.x, y: e.info.y - .05 },
				duration: 500,
				isActive: true,
				end_action: function () {
					e.children[1].style.fill = '#ff0000';
					setButton(e, play);
					play_sound(e.name);
					sound_fly.stop();
					if (fly.hasOwnProperty('anchor_loop_animation') && fly.anchor_loop_animation != null) {
						fly.anchor_loop_animation.isDone = true;
					}
				}
			});
			left.splice(i, 1);
			setInactive(this);
			break;
		}
	}
	if (!found) {
		viewGame.createAnimation({
			element: this,
			type: 'scale',
			start: { x: this.info.scale.x, y: this.info.scale.y },
			end: { x: 1, y: 1 },
			duration: 600,
			isActive: true
		});

		viewGame.createAnimation({
			element: this,
			type: 'move',
			start: coord,
			end: { x: this.info.x, y: this.info.y },
			duration: 600,
			isActive: true,
			end_action: () => {
				sound_fly.stop();
				if (fly.hasOwnProperty('anchor_loop_animation') && fly.anchor_loop_animation != null) {
					fly.anchor_loop_animation.isDone = true;
				}
			}
		});
		this.info.x = coord.x;
		this.info.y = coord.y;
	}
	if (left.length == 0) setTimeout(endGame, 1500);
}

function down() {
	this.zIndex = 1;
	this.info.setScale(1.3);
	viewGame.sort();
	viewGame.resizeElement(this);

	sound_fly.play();

	let e = this;

	viewGame.createAnimation({
		element: e,
		type: 'anchor loop',
		function: (progress) => {
			return {
				x: (Math.sin(progress * 2 * Math.PI) / 6) + .5,
				y: (Math.cos(progress * 2 * Math.PI) / 6) + .5
			}
		},
		duration: 600,
		isActive: true,
		end_action: () => { e.anchor.set(.5); }
	});
}


function play() {

	if (this.hasOwnProperty('name')) {
		play_sound(this.name)

	}
}

function play_sound(name) {
	switch (name) {
		case 'А':
			if (!sound_A.isPlaying) sound_A.play();
			break;
		case 'Е':
			if (!sound_E.isPlaying) sound_E.play();
			break;
		case 'Ё':
			if (!sound_YO.isPlaying) sound_YO.play();
			break;
		case 'И':
			if (!sound_I.isPlaying) sound_I.play();
			break;
		case 'О':
			if (!sound_O.isPlaying) sound_O.play();
			break;
		case 'У':
			if (!sound_U.isPlaying) sound_U.play();
			break;
		case 'Ы':
			if (!sound_YI.isPlaying) sound_YI.play();
			break;
		case 'Э':
			if (!sound_AE.isPlaying) sound_AE.play();
			break;
		case 'Ю':
			if (!sound_YU.isPlaying) sound_YU.play();
			break;
		case 'Я':
			if (!sound_YA.isPlaying) sound_YA.play();
			break;
	}
}

function endGame() {
	viewEnd.show();
	viewGame.hide();
}

function showStart() {
	viewStart.show();
	viewEnd.hide();
	viewGame.hide();
}