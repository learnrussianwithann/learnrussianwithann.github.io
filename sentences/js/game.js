'use strict';

const SENTENCES = ["-Мама =мыла раму", "-Книга =лежала на столе"];

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
const viewGame = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);


const font = new FontFaceObserver('OpenSans');
const font2 = new FontFaceObserver('RubikMonoOne');

const loader = PIXI.Loader.shared;
loader.add('brige', 'img/brige.png')
	.add('subject', 'img/subject.png')
	.add('predicate', 'img/predicate.png');
// 	.add('flies', 'img/flies.png');

font.load().then(() => { font2.load().then(() => { loader.load(init); }) });

const MAX_WORDS = 5;
const BUFFER_POS = new Array(MAX_WORDS);
const BUFFER_WORDS = new Array(MAX_WORDS);

var subject;
var predicate;
var words;
var positions;

function init(loader, resources) {
	gamefield.appendChild(app.view);

	initStartView();
	initGameView(resources);
	initEndView();

	showStart();
}

function initStartView() {
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
		text: 'Составь предложения из слов',
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

	let bstart = viewStart.createElement({
		type: BUTTON,
		text: 'Поехали',
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

	setButton(bstart, startGame);
}

function initGameView(res) {

	subject = viewGame.createElement({
		type: SPRITE,
		texture: res.subject.texture,
		width: .15,
		height: .04,
		x: .25,
		y: .6,
		anchor: .5
	});
	subject.zIndex = 10;
	setMoveable(subject);

	predicate = viewGame.createElement({
		type: SPRITE,
		texture: res.predicate.texture,
		width: .15,
		height: .04,
		x: .75,
		y: .6,
		anchor: .5
	});
	predicate.zIndex = 10;
	setMoveable(predicate);

	for (let i = 0; i < MAX_WORDS; i++) {
		BUFFER_POS[i] = viewGame.createElement({
			type: ROUND_RECT,
			width: .15,
			height: .1,
			radius: .05,
			color: 0x7777ff,
			x: .5,
			y: .5
		});
		BUFFER_POS[i].zIndex = 0;
		BUFFER_POS[i].visible = false;

		BUFFER_WORDS[i] = viewGame.createElement({
			type: SPRITE_WITH_TEXT,
			text: 'test',
			style: {
				fontFamily: 'RubikMonoOne',
				fontSize: 30,
				fill: '#ffffff',
				wordWrap: false,
				align: 'center'
			},
			text_anchor: { x: .5, y: .75 },
			texture: res.brige.texture,
			width: .15,
			height: .1,
			x: .5,
			y: .5
		});
		BUFFER_WORDS[i].zIndex = 1;
		BUFFER_WORDS[i].visible = false;
		setMoveable(BUFFER_WORDS[i], up, down);

		viewGame.sort();
	}
}

function initEndView() {
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
		text: 'Все готово!',
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

function startGame() {
	let twords = SENTENCES[Math.floor(Math.random() * SENTENCES.length)].split(' ');
	let l = twords.length;

	words = new Array(l);
	positions = new Array(l);

	for (let i = 0; i < MAX_WORDS; i++) {
		if (i < l) {
			words[i] = BUFFER_WORDS[i];
			words[i].info.x = .2 + i * .6 / (l - 1);
			words[i].info.y = .7;
			words[i].info.width = .599 / (l - 1);
			words[i].startPosition = { x: words[i].info.x, y: words[i].info.y };
			words[i].visible = true;

			if (twords[i][0] == '-') {
				words[i].type = '-';
				twords[i] = twords[i].substring(1);
			} else if (twords[i][0] == '=') {
				words[i].type = '=';
				twords[i] = twords[i].substring(1);
			} else {
				words[i].type = '0';
			}

			changeText(words[i], twords[i]);

			positions[i] = BUFFER_POS[i];
			positions[i].info.x = .2 + i * .6 / (l - 1);
			positions[i].info.y = .3;
			positions[i].info.width = .599 / (l - 1);
			positions[i].visible = true;
			positions[i].isEmpty = true;
		} else {
			BUFFER_WORDS[i].visible = false;
			BUFFER_POS[i].visible = false;
		}
	}

	subject.info.width = words[0].info.width;
	predicate.info.width = words[0].info.width;

	showGame();
}


function endGame() {
	viewEnd.show();
	viewGame.hide();
}

function showStart() {
	viewStart.show();
	viewGame.hide();
	viewEnd.hide();
}

function showGame() {
	viewStart.hide();
	viewGame.show();
	viewEnd.hide();
}

function showEnd() {
	viewStart.hide();
	viewGame.hide();
	viewEnd.show();
}

function down() {
	this.zIndex = 2;
	viewGame.sort();
}

function up() {
	checkPosition(this);
	this.zIndex = 1;
	viewGame.sort();
	viewGame.resize();
}

function checkPosition(word) {
	let t_i = -1, min = word.info.width * 1.1;
	for (let i = 0; i < positions.length; i++) {
		const e = positions[i];
		let r = distElement(e.info, viewGame.getRelativeCoordinates(word))
		if (r < min) {
			min = r;
			t_i = i;
		}
	}
	if (t_i >= 0 && positions[t_i].word == null) {
		release(word);
		word.pos = positions[t_i];
		positions[t_i].word = word;
		word.info.copyPosition(positions[t_i]);
	} else if (t_i < 0 || positions[t_i].word != word) {
		word.info.setPosition(word.startPosition.x, word.startPosition.y);
		release(word);
	}

}



function release(word) {
	if (word.pos != null) word.pos.word = null;
	word.pos = null;
}


class Word {
	constructor(text) {
		if (text[0] == '-') {
			this.word = text.substring(1);
		} else if (text[0] = '=') {
			this.word = text.substring(1);
		} else {
			this.word = text;
		}
	}

	getConteiner() {
		return this.word;
	}
}