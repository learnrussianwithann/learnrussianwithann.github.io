'use strict';

const SENTENCES = 
["В Австралии/=живут/-кенгуру.",
"Сегодня/=идёт/-дождь.",
"-Я/рано/=проснулся.",
"На дереве/=мяукает/-кошка.",
"-Гусеница/=превратилась/в бабочку.",
"-Я/=плыву/на  катере.",
"Скоро/=начнётся/-гроза.",
"-Велосипедист/=пронёсся/мимо.",
"Дует/=тёплый/-ветер.",
"-Сова/=вылетела/на охоту.",
"-Пираты/=нашли/золото.",
"=Начинается/интересная/-сказка.",
"-Крокодил/=чистит/зубы.",
"-Мама/=зовёт/обедать.",
"-Дверь/страшно/=скрипит.",
"-Маг/=показывает/фокус.",
"-Кролик/=икает/от страха.",
"-Муравей/=ползёт/по ноге.",
"-Ураган/=ломает/деревья.",
"-Волшебник/=взмахнул/палочкой.",
"-Я/высоко/=подпрыгнул."];

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
	.add('mouse', 'img/m1.png')
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
var mouse;

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

	mouse = viewGame.createElement({
		type: SPRITE,
		texture: res.mouse.texture,
		width: .12,
		anchor: .5,
		x: .1,
		y: .2
	})
	mouse.zIndex = 11;

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
	subject.pos = null;
	subject.startPosition = { x: subject.info.x, y: subject.info.y };
	setMoveable(subject, upStrip, downStrip);

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
	predicate.pos = null;
	predicate.startPosition = { x: predicate.info.x, y: predicate.info.y };
	setMoveable(predicate, upStrip, downStrip);

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
		BUFFER_POS[i].order = i;

		BUFFER_WORDS[i] = viewGame.createElement({
			type: SPRITE_WITH_TEXT,
			text: 'test',
			style: {
				fontFamily: 'OpenSans',
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
	let twords = SENTENCES[Math.floor(Math.random() * SENTENCES.length)].split('/');
	let l = twords.length;
	let xGap = .3;
	let maxWidth = 0;
	let maxWidthIndex = 0;
	
	words = new Array(l);
	positions = new Array(l);

	for (let i = 0, k = getRandomInt(l); i < MAX_WORDS; i++, k++) {
		if (i < l) {
			k %= l;

			words[i] = BUFFER_WORDS[i];
			words[i].info.x = xGap + k * (1 - 2 * xGap) / (l - 1);
			words[i].info.y = .7;
			words[i].info.width = (1 - 2 * xGap) / (l - 1);
			words[i].startPosition = { x: words[i].info.x, y: words[i].info.y };
			words[i].visible = true;
			setMoveable(words[i], upWord, downWord);
			release(words[i]);

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
			let width = words[i].getChildByName('text').width;
			if (width > maxWidth) {
				maxWidth = width;
				maxWidthIndex = i;
			}

			positions[i] = BUFFER_POS[i];
			positions[i].info.x = xGap + i * (1 - 2 * xGap) / (l - 1);
			positions[i].info.y = .4;
			positions[i].info.width = (1 - 2 * xGap) / (l - 1);
			positions[i].visible = true;
			positions[i].isEmpty = true;
		} else {
			BUFFER_WORDS[i].visible = false;
			BUFFER_POS[i].visible = false;
		}
	}
	
	

	for (let i = 0; i < words.length; i++) {
		words[i].getChildByName('sprite').width = 1.2 * maxWidth;
	}

	subject.info.width = words[0].info.width;
	predicate.info.width = words[0].info.width;

	subject.visible = false;
	predicate.visible = false;
	
	moveElementToStart(subject);
	moveElementToStart(predicate);

	showGame();
}

function startSecondStage() {
	subject.visible = true;
	predicate.visible = true;

	words.forEach(e => {
		setInactive(e);
	});
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

function downWord() {
	this.zIndex = 2;
	viewGame.sort();
}

function upWord() {
	checkPositionWord(this);
	this.zIndex = 1;
	viewGame.sort();
	viewGame.resize();
}

function downStrip() {

}

function upStrip() {
	checkPositionStrip(this);
	viewGame.resizeElement(this);
}

function checkPositionStrip(strip) {
	let t_i = -1, min = strip.info.width * 1.1;
	for (let i = 0; i < positions.length; i++) {
		const e = positions[i];
		let r = distElement(e.info, viewGame.getRelativeCoordinates(strip))
		if (r < min) {
			min = r;
			t_i = i;
		}
	}


	if (t_i >= 0) {
		switch (strip) {
			case subject:
				if (positions[t_i] == predicate.pos) {
					if (subject.pos == null) {
						moveElementToStart(subject);
					} else {
						moveElementToPosition(subject);
					}
					return;
				}
				break;
			case predicate:
				if (positions[t_i] == subject.pos) {
					if (predicate.pos == null) {
						moveElementToStart(predicate);
					} else {
						moveElementToPosition(predicate);
					}
					return;
				}
				break;
		}

		if (strip.pos == null) {
			strip.anchor.set(.5, 0);
		}

		strip.pos = positions[t_i];
		strip.info.copyPosition(positions[t_i]);

		if (subject.pos != null && predicate.pos != null &&
			subject.pos.word.type == '-' && predicate.pos.word.type == '=') {
			endGame();
		}
	} else if (t_i < 0) {
		moveElementToStart(strip);
	}
}

function checkPositionWord(word) {
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
		moveElementToStart(word);
	}

	let flag = true;

	words.forEach(w => {
		if (w.pos == null) flag = false;
	});

	if (flag) checkOrder();
}

function checkOrder() {
	for (let i = 0, x = 0; i < words.length; i++) {
		if (words[i].pos.order != i) {
			moveAllWordsToStart();
			return;
		}
	}
	startSecondStage();
}

function moveAllWordsToStart() {
	words.forEach(w => {
		moveElementToStart(w);
	});
}

function moveElementToStart(elem) {
	elem.info.setPosition(elem.startPosition.x, elem.startPosition.y);
	if (elem == subject || elem == predicate) {
		elem.pos = null;
		elem.anchor.set(.5);
	} else {
		release(elem);
	}

}

function moveElementToPosition(elem) {
	elem.info.copyPosition(elem.pos);
}

function release(elem) {
	if (elem.pos != null) elem.pos.word = null;
	elem.pos = null;
}

