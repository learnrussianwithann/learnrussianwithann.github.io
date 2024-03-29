'use strict';

const SENTENCES_HARD =
	["-Заяц/очень/быстро/=скрылся/в/лесу."];

const SENTENCES_EASY =
	["-Заяц/быстро/=скрылся/в лесу.",
		"Зелёная/-гусеница/=переползает/дорогу.",
		"-Муравей/=тащит/тяжелую/ветку.",
		"-Школьники/радостно/=бегут/домой.",
		"Сегодня/=дует/сильный/-ветер.",
		"Ночью/ярко/=светят/-звёзды.",
		"На каникулах/-мы/=поедем/к морю.",
		"В озере/=плавает/большая/-рыба.",
		"-Я/=видел/в лесу/медведя.",
		"Лесной/-ручей/весело/=журчит.",
		"-Бабушка/=пишет/письмо/внуку.",
		"-Мышка/=утащила/в норку/сыр.",
		"-Котёнок/=испугался/громкого/шума.",
		"Весной/=цветут/красивые/-розы.",
		"-Я/=люблю/шоколадные/конфеты.",
		"-Лиса/тихо/=крадётся/за кроликом.",
		"Красная/-машина/=приехала/первой.",
		"-Белка/=спрятала/орехи/в дупле.",
		"Полярная/-сова/=притаилась/в снегу.",
		"-Я/=съел/целый/торт!",
		"-Мама/=показала/новый/мультфильм.",
		"-Мальчик/хорошо/=катается/на коньках.",
		"Ночью/в лесу/=рыщет/-волк.",
		"Спелое/-яблоко/=упало/с дерева.",
		"Летучие/-мыши/=спят/в пещере.",
		"Сегодня/=идёт/сильный/-дождь."];

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

const sound_yes = PIXI.sound.Sound.from('sound/yes.mp3');
const sound_no = PIXI.sound.Sound.from('sound/no.mp3');
const sound_pisk0 = PIXI.sound.Sound.from('sound/pisk0.mp3');
const sound_pisk1 = PIXI.sound.Sound.from('sound/pisk1.mp3');

const font = new FontFaceObserver('OpenSans');
const font2 = new FontFaceObserver('Nunito');

const loader = PIXI.Loader.shared;
loader.add('pattern', 'img/pattern.png')
	.add('subject', 'img/subject.png')
	.add('mouse', 'img/mouse.png')
	.add('paper', 'img/paper.png')
	.add('predicate', 'img/predicate.png');
// 	.add('flies', 'img/flies.png');

font.load().then(() => { font2.load().then(() => { loader.load(init); }) });

const MAX_WORDS = 6;
const BUFFER_POS = new Array(MAX_WORDS);
const BUFFER_WORDS = new Array(MAX_WORDS);
const BOARD_POSITION = { X: 0.6, Y: 0.3 };

var sentences;
var stage = 0;
var difficulty = 0;
var subject;
var predicate;
var words;
var positions;
var mouse = Object.create(null);
var paper;

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
		y: .8
	});

	setButton(bstart, startGame);

	let bdiff0 = viewStart.createElement({
		type: BUTTON,
		text: 'Легко',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0xff6968,
		bwidth: .7,
		width: .15,
		height: .06,
		x: .4,
		y: .6
	});

	let bdiff1 = viewStart.createElement({
		type: BUTTON,
		text: 'Сложно',
		style: {
			fontFamily: 'OpenSans',
			fontSize: 30,
			fill: '#ffffff',
			wordWrap: false,
			align: 'center'
		},
		bcolor: 0xff6968,
		bwidth: .7,
		width: .15,
		height: .06,
		x: .6,
		y: .6
	});

	bdiff0.info.setScale(1.15);
	bdiff1.info.setScale(0.85);

	setButton(bdiff0, () => {
		if (difficulty == 0) return;
		difficulty = 0;
		viewStart.createAnimation({
			type: ANIM_SCALE,
			element: bdiff0,
			start: { x: .85, y: .85 },
			end: { x: 1.15, y: 1.15 },
			duration: 200,
			isActive: true
		});
		viewStart.createAnimation({
			type: ANIM_SCALE,
			element: bdiff1,
			start: { x: 1.15, y: 1.15 },
			end: { x: .85, y: .85 },
			duration: 200,
			isActive: true
		});
	});
	setButton(bdiff1, () => {
		if (difficulty == 1) return;
		difficulty = 1;
		viewStart.createAnimation({
			type: ANIM_SCALE,
			element: bdiff0,
			start: { x: 1.15, y: 1.15 },
			end: { x: .85, y: .85 },
			duration: 200,
			isActive: true
		});
		viewStart.createAnimation({
			type: ANIM_SCALE,
			element: bdiff1,
			start: { x: .85, y: .85 },
			end: { x: 1.15, y: 1.15 },
			duration: 200,
			isActive: true
		});
	});
}

function initGameView(res) {

	mouse.x = .12;
	mouse.y = .6;
	mouse.scale = .2;
	mouse.isRotate = false;

	mouse.body = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(res.mouse.texture.baseTexture, new PIXI.Rectangle(0, 0, 750, 900)),
		width: mouse.scale,
		anchor: .5,
		x: mouse.x,
		y: mouse.y
	});
	mouse.arm_left = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(res.mouse.texture.baseTexture, new PIXI.Rectangle(0, 900, 200, 70)),
		width: mouse.scale * .3,
		anchor: { x: .1, y: .5 },
		x: mouse.x - .04,
		y: mouse.y + .07
	});
	mouse.arm_left.rotation = .6;

	mouse.arm_right = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(res.mouse.texture.baseTexture, new PIXI.Rectangle(0, 900, 200, 70)),
		width: mouse.scale * .3,
		anchor: { x: .1, y: .5 },
		x: mouse.x + .01,
		y: mouse.y + .07
	});
	mouse.arm_right.rotation = -.3;

	mouse.arm_left.zIndex = 12;
	mouse.body.zIndex = 11;
	mouse.arm_right.zIndex = 10;

	paper = viewGame.createElement({
		type: SPRITE,
		texture: res.paper.texture,
		width: .75,
		height: .3,
		x: .6,
		y: .33,
		anchor: .5
	});
	paper.zIndex = 0;

	// subject = viewGame.createElement({
	// 	type: SPRITE,
	// 	texture: res.subject.texture,
	// 	width: .15,
	// 	height: .04,
	// 	x: .25,
	// 	y: .6,
	// 	anchor: .5
	// });


	subject = viewGame.createElement({
		type: SHAPE,
		polygons: [{
			color: 0x8888ff, path:
				[new PIXI.Point(100, 100),
				new PIXI.Point(-100, 100),
				new PIXI.Point(-100, -100),
				new PIXI.Point(100, -100),
				new PIXI.Point(140, 0)]
		},
		{
			color: 0xfff48f, path:
				[new PIXI.Point(100, 100),
				new PIXI.Point(100, -100),
				new PIXI.Point(125, -40),
				new PIXI.Point(125, 40)]
		}],
		width: .3,
		height: .025,
		x: .5,
		y: .55,
		anchor: .5
	});

	subject.zIndex = 10;
	subject.pos = null;
	subject.info.startPosition = { x: subject.info.x, y: subject.info.y };
	setMoveable(subject, upStrip, downStrip);
	subject.hitArea = new PIXI.Rectangle(-200, -400, 400, 800);

	// predicate = viewGame.createElement({
	// 	type: SPRITE,
	// 	texture: res.predicate.texture,
	// 	width: .15,
	// 	height: .04,
	// 	x: .75,
	// 	y: .6,
	// 	anchor: .5
	// });

	predicate = viewGame.createElement({
		type: SHAPE,
		polygons: [{
			color: 0xff3700, path:
				[new PIXI.Point(100, -50),
				new PIXI.Point(-100, -50),
				new PIXI.Point(-100, -250),
				new PIXI.Point(100, -250),
				new PIXI.Point(140, -150)]
		},
		{
			color: 0xfff48f, path:
				[new PIXI.Point(100, -50),
				new PIXI.Point(100, -250),
				new PIXI.Point(125, -190),
				new PIXI.Point(125, -110)]
		},
		{
			color: 0xff3700, path:
				[new PIXI.Point(100, 250),
				new PIXI.Point(-100, 250),
				new PIXI.Point(-100, 50),
				new PIXI.Point(100, 50),
				new PIXI.Point(140, 150)]
		},
		{
			color: 0xfff48f, path:
				[new PIXI.Point(100, 250),
				new PIXI.Point(100, 50),
				new PIXI.Point(125, 110),
				new PIXI.Point(125, 190)]
		}],
		width: .15,
		height: .03,
		x: .75,
		y: .55,
		anchor: { x: .5, y: -.1 }
	});
	predicate.zIndex = 10;
	predicate.pos = null;
	predicate.info.startPosition = { x: predicate.info.x, y: predicate.info.y };
	setMoveable(predicate, upStrip, downStrip);
	predicate.hitArea = new PIXI.Rectangle(-200, -400, 400, 800);

	for (let i = 0; i < MAX_WORDS; i++) {
		BUFFER_POS[i] = viewGame.createElement({
			type: ROUND_RECT,
			width: .15,
			height: .05,
			radius: .05,
			color: 0x777777,
			x: .5,
			y: .5
		});
		BUFFER_POS[i].alpha = .4
		BUFFER_POS[i].zIndex = 0;
		BUFFER_POS[i].visible = false;
		BUFFER_POS[i].order = i;

		BUFFER_WORDS[i] = viewGame.createElement({
			type: TEXT_TEXTURED,
			text: 'test',
			style: {
				fontFamily: 'Nunito',
				fontSize: 50,
				fill: '#ffffff',
				wordWrap: false,
				align: 'center'
			},
			text_anchor: { x: .5, y: .75 },
			texture: res.pattern.texture,
			textureSize: { x: 100, y: 100 },
			width: .15,
			height: .05,
			x: .5,
			y: .5
		});
		BUFFER_WORDS[i].zIndex = 1;
		BUFFER_WORDS[i].visible = false;


		viewGame.sort();
	}

	setButton(mouse.body, mouseInteract);

	viewGame.cloud = viewGame.addElement(
		drawCloud(
			.30,
			.15,
			.05,
			0xffffff,
			{
				fontFamily: 'OpenSans',
				fontSize: 40,
				fill: '#000000',
				wordWrap: false,
				align: 'center'
			},
			'Правильно!',
			1,
			'down'
		),
		{ x: .13, y: .3, width: .25 });

	viewGame.cloud.alpha = 0;

	viewGame.check = viewGame.createElement({
		type: BUTTON,
		text: 'Проверить',
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
		x: .6,
		y: .75
	});
	viewGame.check.alpha = 0;
	viewGame.check.visible = false;

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
		width: .3,
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
	switch (difficulty) {
		case 0:
			sentences = SENTENCES_EASY;
			break;
		case 1:
			sentences = SENTENCES_HARD;
			break;
	}

	let twords = sentences[Math.floor(Math.random() * sentences.length)].split('/');
	let l = twords.length;
	let xGap = .25 - difficulty * .05;
	let maxWidth = 0;
	let maxWidthIndex = 0;

	words = new Array(l);
	positions = new Array(l);

	for (let i = 0; i < MAX_WORDS; i++) {
		if (i < l) {
			words[i] = BUFFER_WORDS[i];
			words[i].info.x = BOARD_POSITION.X - .5 + xGap + i * (1 - 2 * xGap) / (l - 1);
			words[i].info.y = BOARD_POSITION.Y - .5 + .7;
			words[i].info.width = (1 - 2 * xGap) / (l - 1);
			words[i].info.startPosition = { x: words[i].info.x, y: words[i].info.y };
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
			setHitAreaByElement(words[i], words[i]);
			// words[i].text = twords[i];
			let width = words[i].getChildByName('text').width;
			if (width > maxWidth) {
				maxWidth = width;
				maxWidthIndex = i;
			}

			positions[i] = BUFFER_POS[i];
			positions[i].info.x = BOARD_POSITION.X - .5 + xGap + i * (1 - 2 * xGap) / (l - 1);
			positions[i].info.y = BOARD_POSITION.Y - .5 + .4;
			positions[i].info.width = (1 - 2 * xGap) / (l - 1);
			positions[i].visible = true;
			positions[i].isEmpty = true;
		} else {
			BUFFER_WORDS[i].visible = false;
			BUFFER_POS[i].visible = false;
		}
	}


	swapInfo(words[0], words[getRandomIntBetween(1, l - 2)]);
	swapInfo(words[l - 1], words[getRandomIntBetween(0, l - 2)]);


	for (let i = 0; i < words.length; i++) {
		words[i].getChildByName('sprite').width = 1.2 * maxWidth;
	}

	subject.info.width = words[0].info.width;
	predicate.info.width = words[0].info.width;

	subject.visible = false;
	predicate.visible = false;

	moveElementToStart(subject);
	moveElementToStart(predicate);

	firstStage();

	showGame();
}

function startSecondStage() {
	stage = 1;

	subject.visible = true;
	predicate.visible = true;

	setInactive(viewGame.check);
	setButton(viewGame.check, checkStrip);

	words.forEach(e => {
		setInactive(e);
	});

	setTimeout(mouseInteract, 2000);
}

function endGame() {
	viewEnd.show();
	viewGame.hide();
}

function showStart() {
	let show = () => { showView(viewStart) };

	hideView(viewGame, show);
	hideView(viewEnd, show);

	if (!viewGame.isVisible() && !viewEnd.isVisible()) show();
}

function showGame() {
	let show = () => { showView(viewGame) };

	hideView(viewStart, show);
	hideView(viewEnd, show);
}

function showEnd() {
	let show = () => { showView(viewEnd) };

	hideView(viewStart, show);
	hideView(viewGame, show);
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
				predicate.anchor.set(.5, .2);
				break;
		}

		// if (strip.pos == null) {
		// 	strip.info.y += .1;
		// 	// strip.anchor.set(.5);
		// }

		strip.pos = positions[t_i];
		strip.info.copyPosition(positions[t_i]);
		strip.info.y += .05;

		// if (subject.pos != null && predicate.pos != null &&
		// 	subject.pos.word.type == '-' && predicate.pos.word.type == '=') {
		// 	animationHands(showEnd);
		// 	say('Правильно!');
		// 	sound_yes.play();
		// }

		if (subject.pos != null && predicate.pos != null)
			showCheck();
	} else if (t_i < 0) {
		moveElementToStart(strip);
		hideCheck();
	}
}

function checkStrip() {
	if (subject.pos != null && predicate.pos != null &&
		subject.pos.word.type == '-' && predicate.pos.word.type == '=') {
		say('Правильно!');
		setTimeout(showEnd, 2000);
		// sound_yes.play();
	} else {
		// sound_no.play();
		say('Неправильно!');
		// animationHands();
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

	if (flag) showCheck();
	else hideCheck();
}

function checkOrder() {
	for (let i = 0, x = 0; i < words.length; i++) {
		if (words[i].pos.order != i) {
			// sound_no.play();
			say('Неправильно!');
			hideCheck();
			moveAllWordsToStart();
			return;
		}
	}
	animationHands(startSecondStage);
	say('Правильно!');
	// sound_yes.play();
	hideCheck();
}

function moveAllWordsToStart() {
	words.forEach(w => {
		moveElementToStart(w);
		viewGame.resizeElement(w);
	});
}

function moveElementToStart(elem) {
	elem.info.setPosition(elem.info.startPosition.x, elem.info.startPosition.y);
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

function animationHands(action) {
	let duration = 600;
	if (mouse.isRotate == false) {
		mouse.isRotate = true;
		rotate_anim(mouse.arm_left, .3, duration);
		rotate_anim(mouse.arm_right, -.3, duration);
		setTimeout(() => {
			mouse.isRotate = false;
			if (typeof action === 'function') action();
		}, duration);
	}

}

function rotate_anim(elem, angle, duration) {
	viewGame.createAnimation({
		type: ANIM_ROTATE,
		element: elem,
		start: elem.rotation,
		end: elem.rotation + angle,
		duration: duration / 2,
		isActive: true,
		end_action: function () {
			rotate_anim_reverse(elem, angle, duration)
		}
	});
}

function rotate_anim_reverse(elem, angle, duration) {
	viewGame.createAnimation({
		type: ANIM_ROTATE,
		element: elem,
		start: elem.rotation,
		end: elem.rotation - angle,
		duration: duration / 2,
		isActive: true
	});
}

function hideView(view, action) {
	if (view.isVisible()) {
		view.createAnimation({
			type: ANIM_ALPHA,
			element: view.container,
			start: 1,
			end: 0,
			duration: 300,
			isActive: true,
			end_action: () => {
				view.hide();
				if (action) action();
			}
		});
	}
}

function showView(view) {
	view.container.alpha = 0;
	view.show();
	view.createAnimation({
		type: ANIM_ALPHA,
		element: view.container,
		start: 0,
		end: 1,
		duration: 300,
		isActive: true
	});
}

function say(text) {
	if (!viewGame.cloud.isAnimated) {
		viewGame.cloud.isAnimated = true;
		mousePisk();
		animationHands();
		changeText(viewGame.cloud, text);
		viewGame.createAnimation({
			type: ANIM_ALPHA,
			element: viewGame.cloud,
			start: 0,
			end: 1,
			duration: 200,
			isActive: true,
			end_action: () => {
				setTimeout(() => {
					viewGame.createAnimation({
						type: ANIM_ALPHA,
						element: viewGame.cloud,
						start: 1,
						end: 0,
						duration: 200,
						isActive: true,
						end_action: () => { viewGame.cloud.isAnimated = false }
					})
				}, 2000)

			}
		})
	}
}

function showCheck() {
	if (viewGame.check.visible) return;

	viewGame.check.visible = true;
	viewGame.createAnimation({
		type: ANIM_ALPHA,
		element: viewGame.check,
		start: 0,
		end: 1,
		duration: 200,
		isActive: true
	});
}

function hideCheck() {
	if (!viewGame.check.visible) return;
	viewGame.createAnimation({
		type: ANIM_ALPHA,
		element: viewGame.check,
		start: 1,
		end: 0,
		duration: 200,
		isActive: true,
		end_action: () => { viewGame.check.visible = false; }
	});
}

function firstStage() {
	stage = 0;
	hideCheck();
	setInactive(viewGame.check);
	setButton(viewGame.check, checkOrder);

	setTimeout(mouseInteract, 600);
}

function mouseInteract() {
	if (mouse.isRotate) return;
	if (stage == 0)say('Расставь слова\nправильно!');
	else say('Найди\nподлежащее\nи сказуемое!')
}

function mousePisk() {
	if (sound_pisk0.isPlaying || sound_pisk1.isPlaying) return;
	Math.random() > .5 ? sound_pisk0.play() : sound_pisk1.play();
}