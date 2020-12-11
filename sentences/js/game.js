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

	initStart();
	initGame(resources);
	initEnd();

	viewStart.show();
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

function initGame(res) {

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

	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
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