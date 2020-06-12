'use strict';
const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x1e99bb,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: false
});
const animator = new Animator(app, 40);
const vport = new Viewport(app, 16 / 9);

const cheese = new Element();
const mouseF = new Element();
const mouseM = new Element();
const mouseN = new Element();
const cat = new Element();
const word = new Element();
const help = new Element();

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
const textF = new PIXI.Text('Женский род', styleName);
const textN = new PIXI.Text('Средний род', styleName);
const textM = new PIXI.Text('Мужской род', styleName);

const styleCloud = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 200,
	fontWeight: 'bold',
	fill: '#999999',
	wordWrap: false,
});

const styleHelp = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 50,
	fontWeight: 'bold',
	fill: '#ffffff',
	wordWrap: false,
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
	.load((loader, resources) => {
		help.put(getDrawRect(1000, 200, 220));
		let helpText = new PIXI.Text('Для какой мышки это слово?', styleHelp);
		helpText.anchor.set(.5);
		help.put(helpText);

		mouseF.put(genSprite(resources.hole.texture, 'hole', .5, 1.5));
		mouseN.put(genSprite(resources.hole.texture, 'hole', .5, 1.5));
		mouseM.put(genSprite(resources.hole.texture, 'hole', .5, 1.5));

		mouseF.put(genSprite(resources.m1.texture, 'body', { x: .5, y: .4 }));
		mouseN.put(genSprite(resources.m2.texture, 'body', { x: .5, y: .4 }));
		mouseM.put(genSprite(resources.m3.texture, 'body', { x: .5, y: .4 }));

		mouseF.put(genCloud(resources.cloud.texture, 'Она моя!', styleCloud, { x: -1, y: .5 }));
		mouseN.put(genCloud(resources.cloud.texture, 'Оно мое!', styleCloud, { x: -1, y: .5 }));
		mouseM.put(genCloud(resources.cloud.texture, 'Он мой!', styleCloud, { x: -1.27, y: .5 }));

		cheese.put(genSprite(resources.cheese.texture, 'cheese', .5))

		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(686, 1076, 750, 167)), 'leg', { x: .9, y: -.8 }));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(0, 0, 1436, 1021)), 'body', .5));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(186, 1021, 445, 133)), 'eyes_close', { x: 1.35, y: 1.3 }));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)), 'eyes_open', { x: 1.36, y: 1.1 }));

		cat.hide('eyes_open');

		cheese_texture = new PIXI.TilingSprite(resources.cheese_texture.texture, 2000, 500);
		cheese_texture.texture = resources.cheese_texture.texture;

		init();
		resize();
	});

var scale = 1;
var cheese_texture;
var moew = false;
var new_word = true;
var current_word = '';
var isShowingCloud = false;

window.word = word;
window.text = text;
window.mouseF = mouseF;
window.mouseN = mouseN;
window.mouseM = mouseM;
window.cat = cat;
window.current_word = current_word;
window.catMeow = catMeow;

function resize() {
	vport.resize();
	app.resize();
	updater();
}

function init() {
	gamefield.appendChild(app.view);

	mouseF.put(textF);
	mouseN.put(textN);
	mouseM.put(textM);
	textF.scale.set(3);
	textN.scale.set(3);
	textM.scale.set(3);
	textF.anchor.set(0.5, 4.5);
	textN.anchor.set(0.5, 4.5);
	textM.anchor.set(0.5, 4.5);

	vport.add(help, .34, -.4, .3);
	vport.add(mouseF, -.38, -.345, .13, true);
	vport.add(mouseN, -.38, -.0, .13, true);
	vport.add(mouseM, -.38, .36, .13, true);
	vport.add(cat, .26, .27, .35);
	vport.add(cheese, -.05, 0.322, .3);
	vport.add(word, .0, -.2, .05, true);

	cheese_texture.anchor.set(.5);
	cheese_texture.mask = text;
	text.anchor.set(.5);
	word.addChild(cheese_texture);
	word.addChild(text);

	setMoveable(word, updater);

	setButton(cheese, function () {
		if (new_word) {
			newWord(text);
			vport.resizeElement(word);
			new_word = false;
			showMouses();
			animator.addNewAnimationMove(word, new Point(.05 * vport.w, -.5 * vport.h), word, .5);
			animator.addNewAnimationScale(word, new Point(.2), word.scale, .5, function () {
				word.updateHitArea();
				word.interactive = true;
			});
			animator.addAnimationJump(cheese.getByName('cheese'));
		}
	});

	setButton(cat, catMeow);

	setButton(help, whichMouse);

	app.stage.sortChildren();
	window.addEventListener('resize', resize);

	app.stop();
}

function updater() {
	app.render();
}

function showCloud(cloud) {
	animator.addNewAnimationAlpha(cloud, 1, .2, function () {
		setTimeout(function () {
			animator.addNewAnimationAlpha(cloud, -1, .2);
			isShowingCloud = false;
		}, 3000);
	});
}

function whichMouse() {
	if (!new_word && !isShowingCloud) {
		isShowingCloud = true;
		switch (current_word) {
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
	if (mouseF.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseF.getByName('body'), 1, .2);
	if (mouseN.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseN.getByName('body'), 1, .2);
	if (mouseM.getByName('body').alpha < .9) animator.addNewAnimationAlpha(mouseM.getByName('body'), 1, .2);
}

function catMeow() {
	if (!moew) {
		whichMouse();
		moew = true;
		cat.show('eyes_open');
		sound_meow.play();
		let leg = cat.getByName('leg');
		let w = leg.width;
		animator.addNewAnimationMove(leg, null, new Point(-.1 * w, 0), .2, function () {
			animator.addNewAnimationMove(leg, null, new Point(), .8, function () {
				cat.hide('eyes_open');
				moew = false;
				updater();
			});
		});
		updater();
	}
}