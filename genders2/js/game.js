'use strict';
const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x1e99bb,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: false,
	forceCanvas: true
});

const viewStart = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);
const viewGame = new Viewport(app, 16 / 9);

const animator = new Animator(app, 40);

const plate = new Element();
const mouseF = new Element('f');
const mouseM = new Element('m');
const mouseN = new Element('n');
const cloudF = new Element();
const cloudM = new Element();
const cloudN = new Element();
const cat = new Element();
const word = new Element();
const clock = new Element();
const glade = getDrawRect(20, 20, 20, 0xff0000);

const sound_meow = PIXI.sound.Sound.from('audio/meow.mp3');
const sound_yummy = PIXI.sound.Sound.from('audio/yummy.mp3');
const sound_no = PIXI.sound.Sound.from('audio/no.mp3');

const styleCheese = new PIXI.TextStyle({
	fontFamily: 'RubikMonoOne',
	fontSize: 80,
	fill: '#ffffff',
	wordWrap: false,
	letterSpacing: 0
});
const text = new PIXI.Text('', styleCheese);
const words = [];

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
	fontSize: 150,
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
	.add('plate', 'img/plate.png')
	.add('cheese_texture', 'img/cheese_texture.png')
	.add('cloud', 'img/cloud.png')
	.add('clock', 'img/clock.png')
	.load(init);

var scale = 1;
var cheese_texture;
var curWordGender = '';
var curWordIndex = 0;
var isMeow = false;
var isNewWord = true;
var isShowingCloud = false;
var isReady = false;
// var eaten = -1;
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

	// app.stop();

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


	let greeting = new PIXI.Text("Мышки проголодались\n\nпомоги покормить мышек", styleMessage);
	greeting.anchor.set(.5);

	let startButton = genButton("Помогу", styleMessage, 0xff6968, 2);
	setButton(startButton, startGame);

	viewStart.add(getDrawRect(300, 200, 30, 0x5d70bc), 0.5, 0.5, .6);
	viewStart.add(greeting, 0.5, .35, .4);
	viewStart.add(startButton, 0.5, .7, .2);
}

function initViewEnd(resources) {
	let ending = new PIXI.Text("Мышки съели\n12 сырных слов!", styleCheeseEnding);
	ending.anchor.set(.5);

	endingCount.anchor.set(.5);

	let againButton = genButton(" Сыграть еще ", styleMessage, 0xff6968);
	setButton(againButton, startGame);

	let endButton = genButton("Закончить игру", styleMessage, 0x3d55b7);
	setButton(endButton, exitGame);


	let c1 = genCloud(resources.cloud.texture, 'Вкуснятина!', styleCloud, { x: 1.75, y: 2.75 }, { x: -1.5, y: 1 });
	let c2 = genCloud(resources.cloud.texture, 'А я бы поел ещё!', styleCloud, { x: -.7, y: 2.75 }, { x: 2, y: 1 });
	let c3 = genCloud(resources.cloud.texture, 'Очень вкусно!!', styleCloud, { x: 1.65, y: 2.75 }, { x: -1.7, y: 1 });

	c1.name = 'c1';
	c2.name = 'c2';
	c3.name = 'c3';

	let m1 = new Element('m1');
	m1.add(genSprite(resources.m1.texture, 'mouse', { x: .5, y: .4 }))
	setButton(m1, () => {
		animator.addNewAnimationAlpha(c1, null, 1, .3);
		m1.interactive = false;
	});

	let m2 = new Element('m2');
	m2.add(genSprite(resources.m2.texture, 'mouse', { x: .5, y: .4 }, { x: -1, y: 1 }))
	setButton(m2, () => {
		animator.addNewAnimationAlpha(c2, null, 1, .3);
		m2.interactive = false;
	});

	let m3 = new Element('m3');
	m3.add(genSprite(resources.m3.texture, 'mouse', { x: .5, y: .4 }, { x: -1, y: 1 }))
	setButton(m3, () => {
		animator.addNewAnimationAlpha(c3, null, 1, .3);
		m3.interactive = false;
	});
	viewEnd.add(m1, .44, .65, .07);
	viewEnd.add(m2, .56, .65, .07);
	viewEnd.add(m3, .22, .29, .07);
	viewEnd.add(getDrawRect(400, 200, 50, 0x1e2949), .5, .3, .5);
	viewEnd.add(ending, .5, .3, .1, true);
	// viewEnd.add(endingCount, .5, .4, .3);
	viewEnd.add(againButton, .35, .86, .06, true);
	viewEnd.add(endButton, .65, .86, .06, true);
	viewEnd.add(c1, .49, .65, .07, true);
	viewEnd.add(c2, .50, .65, .07, true);
	viewEnd.add(c3, .27, .29, .07, true);
}

function reinitEnd() {
	viewEnd.getContainer().getChildByName('c1').alpha = 0;
	viewEnd.getContainer().getChildByName('c2').alpha = 0;
	viewEnd.getContainer().getChildByName('c3').alpha = 0;
	viewEnd.getContainer().getChildByName('m1').interactive = true;
	viewEnd.getContainer().getChildByName('m2').interactive = true;
	viewEnd.getContainer().getChildByName('m3').interactive = true;

	// if (eaten == 0) {
	// 	endingCount.text = `Мышки не поели!`;
	// 	viewEnd.getContainer().getChildByName('m1').interactive = false;
	// 	viewEnd.getContainer().getChildByName('m2').interactive = false;
	// } else {
	// 	viewEnd.getContainer().getChildByName('m1').interactive = true;
	// 	viewEnd.getContainer().getChildByName('m2').interactive = true;
	// 	let wcheese, wword;
	// 	let ten = eaten % 10;
	// 	let hundred = eaten % 100;

	// 	if (ten == 1 && eaten != 11) {
	// 		wcheese = 'сырное';
	// 		wword = 'слово';
	// 	} else {
	// 		wcheese = 'сырных';
	// 		if (hundred >= 11 && hundred <= 19) {
	// 			wword = 'слов';
	// 		} else {
	// 			switch (ten) {
	// 				case (1): wword = 'слово'; break;
	// 				case (2):
	// 				case (3):
	// 				case (4): wword = 'слова'; break;
	// 				default: wword = 'слов';
	// 			}
	// 		}
	// 	}
	// 	endingCount.text = `Мышки съели\n${eaten} ${wcheese} ${wword}!`;
	// }


	// viewEnd.resizeElement(endingCount);
}

function initViewGame(resources) {
	mouseF.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));
	mouseN.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));
	mouseM.add(genSprite(resources.hole.texture, 'hole', .5, 1.5));

	mouseF.add(genSprite(resources.m1.texture, 'body', { x: .5, y: .4 }));
	mouseN.add(genSprite(resources.m2.texture, 'body', { x: .5, y: .4 }));
	mouseM.add(genSprite(resources.m3.texture, 'body', { x: .5, y: .4 }));

	cloudF.add(genCloud(resources.cloud.texture, 'Она моя!', styleCloud, { x: -.9, y: 3.1 }, 1.2));
	cloudN.add(genCloud(resources.cloud.texture, 'Оно моё!', styleCloud, { x: -.9, y: 3.1 }, 1.2));
	cloudM.add(genCloud(resources.cloud.texture, 'Он мой!', styleCloud, { x: -1.1, y: 3.1 }, 1.2));

	plate.add(genSprite(resources.plate.texture, 'cheese', .5))

	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(686, 1076, 750, 167)), 'leg', { x: .9, y: -.8 }));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(0, 0, 1436, 1021)), 'body', .5));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(186, 1021, 445, 133)), 'eyes_close', { x: 1.35, y: 1.3 }));
	cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)), 'eyes_open', .5, 1, { x: -380, y: -120 }));
	// cat.add(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)), 'eyes_open', { x: 1.36, y: 1.1 }));

	cat.hide('eyes_open');

	mouseF.add(textF);
	mouseN.add(textN);
	mouseM.add(textM);
	textF.scale.set(3);
	textN.scale.set(3);
	textM.scale.set(3);
	textF.anchor.set(0.5, 4.8);
	textN.anchor.set(0.5, 4.8);
	textM.anchor.set(0.5, 4.8);

	// clock.add(genSprite(new PIXI.Texture(resources.clock.texture.baseTexture, new PIXI.Rectangle(0, 0, 600, 600)), null, .5));
	// clock.add(genSprite(new PIXI.Texture(resources.clock.texture.baseTexture, new PIXI.Rectangle(601, 0, 48, 284)), 'arrow', { x: .5, y: .91 }));
	// clock.getChildByName('arrow').pivot.set(.5, .91);

	glade.addChild(getDrawRect(20, 20, 20, 0xff0000));
	glade.visible = false;

	viewGame.add(cat, .76, .77, .35);
	viewGame.add(plate, .45, 0.89, .32);
	viewGame.add(glade, .48, 0.3, .01);
	viewGame.add(mouseF, .22, .155, .13, true);
	viewGame.add(mouseN, .22, .5, .13, true);
	viewGame.add(mouseM, .22, .86, .13, true);

	// viewGame.add(word, .0, -.2, .05, true);


	// cheese_texture.anchor.set(.5);
	// cheese_texture.mask = text;
	// text.anchor.set(.5);
	// word.addChild(cheese_texture);
	// word.addChild(text);


	setButton(cat, catMeow);

	setButton(mouseF, checkMouse);
	setButton(mouseN, checkMouse);
	setButton(mouseM, checkMouse);

	// setButton(plate, catMeow);

	for (let i = 0; i < 12; i++) {
		let ctex = new PIXI.TilingSprite(resources.cheese_texture.texture, 1000, 250);
		ctex.anchor.set(.5);
		words.push(new MaskText(null, ctex, styleCheese));
		words[i].rotation = .1 - .2 * Math.random();
		viewGame.add(words[i], 0, 0, .12, true);
	}

	viewGame.add(cloudF, .22, .155, .08, true);
	viewGame.add(cloudN, .22, .5, .08, true);
	viewGame.add(cloudM, .22, .86, .08, true);
}

function initGame() {
	// eaten = 0;
	showMouses();

	let twords = genWords();
	for (let i = 0; i < words.length; i++) {
		words[i].setText(twords[i]);
		words[i].info.x = plate.info.x - 0.02 + .04 * Math.random();
		words[i].info.y = plate.info.y - .06 + .1 * Math.random();
		words[i].visible = true;
	}

	curWordIndex = words.length - 1;
}

function updater() {
	// app.render();
}

function showCloud(cloud) {
	animator.addNewAnimationAlpha(cloud, 0, 1, .1, function () {
		setTimeout(function () {
			animator.addNewAnimationAlpha(cloud, 1, 0, .1);
			isShowingCloud = false;
		}, 2800);
	});
}

function help() {
	if (isReady && !isShowingCloud) {
		isShowingCloud = true;
		switch (words[curWordIndex].gender) {
			case 'f':
				showCloud(cloudF.getByName('cloud'));
				animator.addAnimationJump(mouseF.getByName('body'));
				break;
			case 'n':
				showCloud(cloudN.getByName('cloud'));
				animator.addAnimationJump(mouseN.getByName('body'));
				break;
			case 'm':
				showCloud(cloudM.getByName('cloud'));
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
	if (!isMeow && isReady) {
		help();
		isMeow = true;
		cat.show('eyes_open');
		cat.hide('eyes_close');
		sound_meow.play();
		let leg = cat.getByName('leg');
		let w = leg.width;
		let eyes = cat.getByName('eyes_open');
		animator.addNewAnimationScale(eyes, { x: 1, y: 0.1 }, { x: 1, y: 1 }, null, 0.1);
		animator.addNewAnimationMove(leg, null, new Point(-.1 * w, 0), .2, function () {
			animator.addNewAnimationMove(leg, null, new Point(), 2.6, function () {
				animator.addNewAnimationScale(eyes, { x: 1, y: 1 }, { x: 1, y: 0.1 }, null, .1, () => {
					cat.show('eyes_close');
					cat.hide('eyes_open');
					isMeow = false;
					updater();
				})
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
		animator.addNewAnimationMove(word, plate, word, .5);

		let baseScale = word.scale.clone();
		word.scale.set(0);
		animator.addNewAnimationScale(word, 0, 1, baseScale, 0.5, () => {
			isReady = true;
		});
		animator.addAnimationJump(plate.getByName('cheese'));
	}
}

function nextWord() {
	if (curWordIndex >= 0) {
		words[curWordIndex].info.x = glade.info.x;
		words[curWordIndex].info.y = glade.info.y;
		animator.addNewAnimationMove(words[curWordIndex], null, glade, .5);
		animator.addNewAnimationRotation(words[curWordIndex], null, 0, .5, () => {
			isReady = true;
		});
	} else {
		endGame();
	}
}

function startGame() {
	initGame();

	viewStart.hide();
	viewEnd.hide();
	viewGame.show();
	// createNewWord();
	// setTimeout(endGame, 500);
	// animator.addNewAnimationRotation(clock.getChildByName('arrow'), 0, 2 * Math.PI, 30, endGame);
	resize();
	nextWord();
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
		if (words[curWordIndex].gender == this.name) correct(this);
		else incorrect(this);
	}

}

function correct(mouse) {
	// eaten++;
	isReady = false;
	animator.addNewAnimationMove(words[curWordIndex], null, mouse.position, .3);
	let baseScale = words[curWordIndex].scale.clone();
	animator.addNewAnimationScale(words[curWordIndex], null, 0, baseScale, 0.5, function () {
		words[curWordIndex].visible = false;
		text.text = '';
		curWordGender = '';
		isNewWord = true;
		curWordIndex--;
		nextWord();
		// createNewWord();
	});
	let body = mouse.getChildByName('body');
	let scale = new Point(body.scale.x);
	let h = body.getBounds().height;

	setTimeout(function () {
		sound_yummy.play();
		animator.addAnimationJump(body);
	}, 200);
}

function incorrect(mouse) {
	animator.addAnimationJump(mouse.getByName('body'));
	if (!sound_no.isPlaying) sound_no.play();
}