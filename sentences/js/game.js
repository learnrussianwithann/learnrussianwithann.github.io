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

const viewStartView = new Viewport(app, 16 / 9);
const viewEndView = new Viewport(app, 16 / 9);
const viewGameView = new Viewport(app, 16 / 9);


const font = new FontFaceObserver('OpenSans');
const font2 = new FontFaceObserver('RubikMonoOne');

const loader = PIXI.Loader.shared;
// loader.add('rocks', 'img/rocks.png')
// 	.add('flies', 'img/flies.png');

font.load().then(() => { font2.load().then(() => { loader.load(init); }) });

const MAX_WORDS = 5;
const positions = new Array(MAX_WORDS);
const words = new Array(MAX_WORDS);

function init(loader, resources) {
	gamefield.appendChild(app.view);

	initStartView();
	initGameView(resources);
	initEndView();

	showStart();
}

function initStartView() {
	viewStartView.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .5,
		radius: .1,
		color: 0x5d70bc,
		x: .5,
		y: .5
	});

	viewStartView.createElement({
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

	let bstart = viewStartView.createElement({
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

}

function initEndView() {
	viewEndView.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .5,
		radius: .1,
		color: 0x5d70bc,
		x: .5,
		y: .5
	});

	viewEndView.createElement({
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

	let bagain = viewEndView.createElement({
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

	console.log(getWords());
	showGame();
}


function endGame() {
	viewEndView.show();
	viewGameView.hide();
}

function showStart() {
	viewStartView.show();
	viewGameView.hide();
	viewEndView.hide();
}

function showGame() {
	viewStartView.hide();
	viewGameView.show();
	viewEndView.hide();
}

function showEnd() {
	viewStartView.hide();
	viewGameView.hide();
	viewEndView.show();
}

function getWords() {
	let words = SENTENCES[Math.floor(Math.random() * SENTENCES.length)].split(' ');
	return words;
}
