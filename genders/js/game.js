'use strict';
const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x1e99bb,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: false
});

const viewStart = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);
const viewGame = new Viewport(app, 16 / 9);

const animator = new Animator(app, 40);

const cheese = new Element();
const mouseF = new Element('f');
const mouseM = new Element('m');
const mouseN = new Element('n');
const cat = new Element();
const word = new Element();
const clock = new Element();

const sound_meow = PIXI.sound.Sound.from('audio/meow.mp3');

const styleCheese = new PIXI.TextStyle({
	fontFamily: 'RubikMonoOne',
	fontSize: 80,
	fill: '#ffffff',
	wordWrap: false,
});
const text = new PIXI.Text('', styleCheese);

const styleName = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 50,
	fontWeight: 'bold',
	fill: '#ffffff',
	wordWrap: false,
});
const textF = new PIXI.Text('ЖЕНСКИЙ РОД', styleName);
const textN = new PIXI.Text('СРЕДНИЙ РОД', styleName);
const textM = new PIXI.Text('МУЖСКОЙ РОД', styleName);

const styleCloud = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 200,
	fontWeight: 'bold',
	fill: '#344072',
	wordWrap: false,
});

const styleMessage = new PIXI.TextStyle({
	align: 'center',
	fontFamily: 'Arial',
	fontSize: 50,
	fontWeight: 'bold',
	fill: '#ffffff'
});

const styleCheeseEnding = new PIXI.TextStyle({
	align: 'center',
	fontFamily: 'Arial',
	fontSize: 50,
	fontWeight: 'bold',
	fill: '#e6be5e'
});


const loader = PIXI.Loader.shared;
loader.add('hole', 'img/hole.png')
	.add('m1', 'img/m1.png')
	.add('m2', 'img/m2.png')
	.add('m3', 'img/m3.png')
	.add('cat', 'img/cat.png')
	.add('cheese', 'img/cheese.png')
	.add('cheese_texture', 'img/cheese_texture.png')
	.add('cloud', 'img/cloud.png')
	.add('clock', 'img/clock.png')
	.load(init);

var scale = 1;
var cheese_texture;
var curWordGender = '';
var isMeow = false;
var isNewWord = true;
var isShowingCloud = false;
var isReady = false;
var eaten = -1;
var endingCount = new PIXI.Text(``, styleCheeseEnding);

function resize() {
	viewStart.resize();
	viewEnd.resize();
	viewGame.resize();
	app.resize();
	updater();
}

function init(loader, resources) {
	initViewStart(resources);
	initViewEnd(resources);
	initViewGame(resources);

	app.stage.sortChildren();
	window.addEventListener('resize', resize);

	app.stop();

	viewStart.show();
	viewEnd.hide();
	viewGame.hide();

	gamefield.appendChild(app.view);
	resize();
}

function initViewStart(resources) {
	viewStart.getContainer().zIndex = 10;
	viewEnd.getContainer().zIndex = 11;
	viewGame.getContainer().zIndex = 0;


	let greeting = new PIXI.Text("Привет\nпокорми мышек\nтретья строка", styleMessage);
	greeting.anchor.set(.5);

	let startButton = genButton("Покормить", styleMessage, 0xff6968);
	setButton(startButton, startGame);

	viewStart.add(getDrawRect(300, 200, 30, 0x1e2949), 0, 0, .6);
	viewStart.add(greeting, 0, -.15, .4);
	viewStart.add(startButton, 0, .2, .2);
}

function initViewEnd(resources) {
	let ending = new PIXI.Text("Наступила полночь", styleMessage);
	ending.anchor.set(.5);

	endingCount.anchor.set(.5);

	let againButton = genButton(" Сыграть еще ", styleMessage, 0xff6968);
	setButton(againButton, startGame);

	let endButton = genButton("Закончить игру", styleMessage, 0x3d55b7);
	setButton(endButton, exitGame);

	let m1 = new Element('m1');
	m1.add(genSprite(resources.hole.texture, null, 0.5, 1.5));
	m1.add(genSprite(resources.m1.texture, 'mouse', { x: .5, y: .4 }))
	m1.add(genCloud(resources.cloud.texture, 'Вкуснятина!', styleCloud, { x: 1.8, y: .5 }, { x: -4.5, y: 4.5 }));
	setButton(m1, () => {
		animator.addNewAnimationAlpha(m1.getByName('cloud'), null, 1, .3);
		m1.interactive = false;
	});

	let m2 = new Element('m2');
	m2.add(genSprite(resources.hole.texture, null, 0.5, 1.5));
	m2.add(genSprite(resources.m2.texture, 'mouse', { x: .5, y: .4 }, { x: -1, y: 1 }))
	m2.add(genCloud(resources.cloud.texture, 'А я бы поел ещё!', styleCloud, { x: -.7, y: .5 }, 5.7));
	setButton(m2, () => {
		animator.addNewAnimationAlpha(m2.getByName('cloud'), null, 1, .3);
		m2.interactive = false;
	});


	viewEnd.add(m1, -.06, .15, .12, true);
	viewEnd.add(m2, .06, .15, .12, true);
	viewEnd.add(genSprite(resources.m3.texture, null, 0.5, 0.5), -.3, -.21, .07);
	viewEnd.add(getDrawRect(400, 200, 50, 0x1e2949), 0, -.2, .5);
	viewEnd.add(ending, 0, -.3, .05, true);
	viewEnd.add(endingCount, 0, -.1, .3);
	viewEnd.add(againButton, -.15, .36, .06, true);
	viewEnd.add(endButton, .15, .36, .06, true);
}

function reinitEnd() {
	viewEnd.getContainer().getChildByName('m1').getChildByName('cloud').alpha = 0;
	viewEnd.getContainer().getChildByName('m2').getChildByName('cloud').alpha = 0;

	if (eaten == 0) {
		endingCount.text = `Мышки не поели!`;
		viewEnd.getContainer().getChildByName('m1').interactive = false;
		viewEnd.getContainer().getChildByName('m2').interactive = false;
	} else {
		viewEnd.getContainer().getChildByName('m1').interactive = true;
		viewEnd.getContainer().getChildByName('m2').interactive = true;
		let wcheese, wword;
		let ten = eaten % 10;
		let hundred = eaten % 100;

		if (ten == 1 && eaten != 11) {
			wcheese = 'сырное';
			wword = 'слово';
		} else {
			wcheese = 'сырных';
			if (hundred >= 11 && hundred <= 19) {
				wword = 'слов';
			} else {
				switch (ten) {
					case (1): wword = 'слово'; break;
					case (2):
					case (3):
					case (4): wword = 'слова'; break;
					default: wword = 'слов';
				}
			}
		}
		endingCount.text = `Мышки съели\n${eaten} ${wcheese} ${wword}!`;
	}


	viewEnd.resizeElement(endingCount);
}

function initViewGame(resources) {
	mouseF.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));
	mouseN.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));
	mouseM.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));

	mouseF.add(genSprite(resources.m1.texture, 'body', { x: .5, y: .4 }));
	mouseN.add(genSprite(resources.m2.texture, 'body', { x: .5, y: .4 }));
	mouseM.add(genSprite(resources.m3.texture, 'body', { x: .5, y: .4 }));

	mouseF.add(genCloud(resources.cloud.texture, 'Она моя!', styleCloud, { x: -1, y: .5 }));
	mouseN.add(genCloud(resources.cloud.texture, 'Оно моё!', styleCloud, { x: -1, y: .5 }));
	mouseM.add(genCloud(resources.cloud.texture, 'Он мой!', styleCloud, { x: -1.27, y: .5 }));

	cheese.add(genSprite(resources.cheese.texture, 'cheese', .5))

	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(686, 1076, 750, 167)), 'leg', { x: .9, y: -.8 }));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(0, 0, 1436, 1021)), 'body', .5));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(186, 1021, 445, 133)), 'eyes_close', { x: 1.35, y: 1.3 }));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)), 'eyes_open', { x: 1.36, y: 1.1 }));

	cat.hide('eyes_open');

	cheese_texture = new PIXI.TilingSprite(resources.cheese_texture.texture, 2000, 500);
	cheese_texture.texture = resources.cheese_texture.texture;

	mouseF.add(textF);
	mouseN.add(textN);
	mouseM.add(textM);
	textF.scale.set(3);
	textN.scale.set(3);
	textM.scale.set(3);
	textF.anchor.set(0.5, 4.8);
	textN.anchor.set(0.5, 4.8);
	textM.anchor.set(0.5, 4.8);

	clock.add(genSprite(new PIXI.Texture(resources.clock.texture.baseTexture, new PIXI.Rectangle(0, 0, 600, 600)), null, .5));
	clock.add(genSprite(new PIXI.Texture(resources.clock.texture.baseTexture, new PIXI.Rectangle(601, 0, 48, 284)), 'arrow', { x: .5, y: .91 }));
	clock.getChildByName('arrow').pivot.set(.5, .91);

	viewGame.add(clock, .38, -.345, .15);
	viewGame.add(mouseF, -.38, -.345, .13, true);
	viewGame.add(mouseN, -.38, -.0, .13, true);
	viewGame.add(mouseM, -.38, .36, .13, true);
	viewGame.add(cat, .26, .27, .35);
	viewGame.add(cheese, -.05, 0.322, .3);
	viewGame.add(word, .0, -.2, .05, true);

	cheese_texture.anchor.set(.5);
	cheese_texture.mask = text;
	text.anchor.set(.5);
	word.addChild(cheese_texture);
	word.addChild(text);

	setButton(cat, catMeow);

	setButton(mouseF, checkMouse);
	setButton(mouseN, checkMouse);
	setButton(mouseM, checkMouse);
}

function updater() {
	app.render();
}

function showCloud(cloud) {
	animator.addNewAnimationAlpha(cloud, 0, 1, .2, function () {
		setTimeout(function () {
			animator.addNewAnimationAlpha(cloud, 1, 0, .2);
			isShowingCloud = false;
		}, 2600);
	});
}

function help() {
	if (!isNewWord && !isShowingCloud) {
		isShowingCloud = true;
		switch (curWordGender) {
			case 'f':
				showCloud(mouseF.getByName('cloud'));
				animator.addAnimationJump(mouseF.getByName('body'));
				break;
			case 'n':
				showCloud(mouseN.getByName('cloud'));
				animator.addAnimationJump(mouseN.getByName('body'));
				break;
			case 'm':
				showCloud(mouseM.getByName('cloud'));
				animator.addAnimationJump(mouseM.getByName('body'));
				break;
		}
	}
}

function showMouses() {
	if (mouseF.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseF.getByName('body'), mouseF.getByName('body').alpha, 1, .2);
	if (mouseN.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseN.getByName('body'), mouseN.getByName('body').alpha, 1, .2);
	if (mouseM.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseM.getByName('body'), mouseM.getByName('body').alpha, 1, .2);
}

function catMeow() {
	if (!isMeow) {
		help();
		isMeow = true;
		cat.show('eyes_open');
		sound_meow.play();
		let leg = cat.getByName('leg');
		let w = leg.width;
		animator.addNewAnimationMove(leg, null, new Point(-.3 * w, 0), .2, function () {
			animator.addNewAnimationMove(leg, null, new Point(), 2.8, function () {
				cat.hide('eyes_open');
				isMeow = false;
				updater();
			});
		});
		updater();
	}
}

function createNewWord() {
	if (isNewWord) {
		writeNewWord(text);
		viewGame.resizeElement(word);
		isNewWord = false;
		showMouses();
		animator.addNewAnimationMove(word, cheese, word, .5);

		let baseScale = word.scale.clone();
		word.scale.set(0);
		animator.addNewAnimationScale(word, 0, 1, baseScale, 0.5, () => {
			isReady = true;
		});
		animator.addAnimationJump(cheese.getByName('cheese'));
	}
}

function startGame() {
	eaten = 0;
	showMouses();
	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
	createNewWord();
	// setTimeout(endGame, 500);
	animator.addNewAnimationRotation(clock.getChildByName('arrow'), 0, 2 * Math.PI, 30, endGame);
	updater();
}

function endGame() {
	reinitEnd();

	viewGame.hide();
	viewStart.hide();
	viewEnd.show();
	updater();
}

function exitGame() {
	viewGame.hide();
	viewStart.hide();
	viewEnd.hide();
	updater();
}

function checkMouse() {
	if (isReady) {
		if (curWordGender == this.name) correct(this);
		else incorrect(this);
	}

}

function correct(mouse) {
	eaten++;
	isReady = false;
	animator.addNewAnimationMove(word, null, mouse.position, .3);
	let baseScale = word.scale.clone();
	animator.addNewAnimationScale(word, null, 0, baseScale, 0.5, function () {
		text.text = '';
		curWordGender = '';
		isNewWord = true;
		createNewWord();
	});
	let body = mouse.getChildByName('body');
	let scale = new Point(body.scale.x);
	let h = body.getBounds().height;

	setTimeout(function () {
		animator.addAnimationJump(body);
	}, 200);
}

function incorrect(mouse) {
	animator.addNewAnimationAlpha(mouse.getByName('body'), mouse.getByName('body').alpha, 0, .2);
}