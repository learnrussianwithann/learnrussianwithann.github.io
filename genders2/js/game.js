'use strict';

const ALL_WORDS = {
	m0: ['папа', 'дядя', 'друг', 'брат', 'урок', 'луч', 'меч', 'заяц', 'куст', 'лес', 'крик', 'сон', 'глаз', 'стол', 'карандаш', 'лист', 'вес', 'магазин', 'поход', 'дождь', 'день', 'ремень', 'огонь', 'шампунь', 'голубь', 'конь', 'мост', 'экран', 'герой', 'рассказ', 'воздух', 'ключ', 'медведь', 'снег', 'тюлень', 'мотоцикл', 'фонтан', 'путь', 'мужчина', 'ботинок'],
	f0: ['морковь', 'пыль', 'лошадь', 'кровать', 'зелень', 'дверь', 'игра', 'пила', 'картина', 'туча', 'погода', 'ягода', 'голова', 'мечта', 'мысль', 'речь', 'ночь', 'дочь', 'ручка', 'причёска', 'юбка', 'футболка', 'бабушка', 'сестра', 'семья', 'вилка', 'сказка', 'книга', 'школа', 'улыбка', 'песня', 'музыка', 'каша', 'фея', 'комната', 'подруга', 'тень', 'помощь', 'дочь', 'вещь'],
	n0: ['поле', 'море', 'пальто', 'радио', 'кино', 'кафе', 'варенье', 'небо', 'одеяло', 'зеркало', 'стекло', 'слово', 'дупло', 'плечо', 'молоко ', 'метро', 'кимоно', 'пюре', 'пианино', 'блюдо', 'шоссе', 'желе', 'меню', 'яблоко', 'ухо', 'эхо', 'дерево', 'колено', 'лето', 'письмо', 'зерно', 'гнездо', 'платье', 'солнце', 'полотенце', 'время', 'племя', 'пламя', 'чтение', 'отражение'],
	m1: ['овощ', 'бензин', 'плащ', 'ключ', 'человек', 'город', 'час', 'локоть', 'огонь', 'календарь', 'гараж', 'рояль', 'богач', 'душ', 'матч', 'восход', 'молоток', 'вход', 'звук', 'маяк', 'завтрак', 'котёл', 'вратарь', 'январь', 'пример', 'космос', 'червяк', 'голос', 'метеорит', 'комикс', 'лабиринт', 'финиш', 'камень', 'обман', 'ручей', 'кашель', 'монстр', 'глагол', 'пояс', 'остров', 'великан', 'царь', 'силач', 'потолок', 'дракон', 'глобус', 'магнит', 'ус', 'урожай', 'рецепт'],
	f1: ['тишина', 'жизнь', 'комната', 'осень', 'точка', 'мышь', 'печь', 'секунда', 'математика', 'тетрадь', 'челюсть', 'фамилия', 'неделя', 'миля', 'оценка', 'пружина', 'смелость', 'подушка', 'музыка', 'башня', 'деревня', 'вещь', 'пыль', 'роль', 'лисица', 'перемена', 'задача', 'пустота', 'планета', 'лень', 'история', 'песня', 'буква', 'мумия', 'удача', 'стрела', 'свобода', 'медуза', 'русалка ', 'струна', 'метла', 'тьма', 'шкатулка', 'резина', 'страница', 'петля', 'проверка', 'уборка', 'зарядка'],
	n1: ['слово', 'окно', 'пламя', 'какао', 'племя', 'предложение', 'болото', 'удивление', 'кресло', 'здоровье', 'тесто', 'зерно', 'озеро', 'сердце', 'золото', 'ударение', 'дыхание', 'щупальце', 'чучело', 'приключение', 'меню', 'чудовище', 'чувство', 'лето', 'сиденье', 'письмо', 'место', 'королевство', 'привидение', 'облако', 'волшебство', 'плечо', 'дупло', 'тело', 'здание', 'полотенце', 'железо', 'растение', 'занятие', 'хобби']
};

const END_PHRASE = ['Вкусненько!', 'Еще хочу!', 'Вкуснятина!', 'Люблю сыр!', 'Ням-ням!'];

shuffle(ALL_WORDS['f0']);
shuffle(ALL_WORDS['m0']);
shuffle(ALL_WORDS['n0']);
shuffle(ALL_WORDS['f1']);
shuffle(ALL_WORDS['m1']);
shuffle(ALL_WORDS['n1']);

const gamefield = document.getElementById('game');
const app = new PIXI.Application({
	resizeTo: gamefield,
	backgroundColor: 0x1e99bb,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: true,
	// forceCanvas: true
});

const viewStart = new Viewport(app, 16 / 9);
const viewEnd = new Viewport(app, 16 / 9);
const viewGame = new Viewport(app, 16 / 9);

const sound_meow = PIXI.sound.Sound.from('audio/meow.mp3');
const sound_yummy = PIXI.sound.Sound.from('audio/yummy.mp3');
const sound_no = PIXI.sound.Sound.from('audio/no.mp3');

const styleCheese = new PIXI.TextStyle({
	fontFamily: 'RubikMonoOne',
	fontSize: 50,
	fill: '#ffffff',
	wordWrap: false,
	letterSpacing: 0
});

const styleName = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 50,
	fontWeight: 'bold',
	fill: '#ffffff',
	wordWrap: false,
});

const styleCloud = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: 100,
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
	.add('cheese_texture', 'img/cheese_texture.png');

const font = new FontFaceObserver('RubikMonoOne');

font.load().then(() => { loader.load(init) });

var difficulty = 0;
var currentPositions = [0, 0, 0];
var curWordIndex = 0;
var isMeow = false;
var isNewWord = true;
var isShowingCloud = false;
var isReady = true;
var words = Array(12);
var startPos = Array(12);
var startAngle = Array(12);


// function resize() {
// 	viewStart.resize();
// 	viewEnd.resize();
// 	viewGame.resize();
// 	app.resize();
// }

function init(loader, resources) {
	initViewStart(resources);
	initViewGame(resources);
	initViewEnd(resources);

	// app.stage.sortChildren();
	// window.addEventListener('resize', resize);

	// app.stop();

	showStart();

	gamefield.appendChild(app.view);
	// resize();
}

function initViewStart(resources) {

	viewStart.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .5,
		radius: .1,
		color: 0x5d70bc,
		x: .5,
		y: .5
	})

	viewStart.createElement({
		type: TEXT,
		text: 'Мышки проголодались\n\nпомоги покормить мышек',
		style: styleMessage,
		byHeight: false,
		width: .5,
		x: .5,
		y: .35
	});

	let bstart = viewStart.createElement({
		type: BUTTON,
		text: 'Помогу',
		style: styleMessage,
		bcolor: 0xff6968,
		bwidth: .7,
		width: .3,
		height: .06,
		x: .5,
		y: .8
	});

	let bdiff0 = viewStart.createElement({
		type: BUTTON,
		text: 'Легко',
		style: styleMessage,
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
		style: styleMessage,
		bcolor: 0xff6968,
		bwidth: .7,
		width: .15,
		height: .06,
		x: .6,
		y: .6
	});

	bdiff0.info.setScale(1.15);
	bdiff1.info.setScale(0.85);


	setButton(bstart, showGame);
	setButton(bdiff0, () => {
		if (difficulty == 0) return;
		setDifficulty(0);
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
		setDifficulty(1);
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

function initViewGame(resources) {

	//Holes

	viewGame.createElement({
		type: SPRITE,
		texture: resources.hole.texture,
		width: .1,
		x: .15,
		y: .2,
		anchor: .5
	});

	viewGame.createElement({
		type: SPRITE,
		texture: resources.hole.texture,
		width: .1,
		x: .15,
		y: .5,
		anchor: .5
	});

	viewGame.createElement({
		type: SPRITE,
		texture: resources.hole.texture,
		width: .1,
		x: .15,
		y: .8,
		anchor: .5
	});

	//Titles

	viewGame.createElement({
		type: TEXT,
		text: "ЖЕНСКИЙ РОД",
		width: .13,
		style: styleName,
		x: .15,
		y: .07,
		anchor: .5
	});

	viewGame.createElement({
		type: TEXT,
		text: "СРЕДНИЙ РОД",
		width: .13,
		style: styleName,
		x: .15,
		y: .37,
		anchor: .5
	});

	viewGame.createElement({
		type: TEXT,
		text: "МУЖСКОЙ РОД",
		width: .13,
		style: styleName,
		x: .15,
		y: .67,
		anchor: .5
	});

	//Plate

	viewGame.createElement({
		type: SPRITE,
		texture: resources.plate.texture,
		width: .3,
		x: .4,
		y: .8,
		anchor: .5
	});

	//Cat

	viewGame.cat = {};

	viewGame.cat.body = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(0, 0, 1436, 1021)),
		width: .38,
		x: .75,
		y: .7,
		anchor: .5
	});

	viewGame.cat.body.zIndex = 1;

	viewGame.cat.leg = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(686, 1076, 750, 167)),
		width: .2,
		x: .67,
		y: .8,
		anchor: .5
	});

	viewGame.cat.leg.zIndex = 0;

	viewGame.cat.eyes_open = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)),
		width: .12,
		x: .655,
		y: .64,
		anchor: .5
	});

	viewGame.cat.eyes_open.zIndex = 3;

	viewGame.cat.eyes_close = viewGame.createElement({
		type: SPRITE,
		texture: new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(186, 1021, 445, 133)),
		width: .13,
		x: .655,
		y: .64,
		anchor: .5
	});

	viewGame.cat.eyes_close.zIndex = 2;

	viewGame.cat.eyes_open.info.setScale(1, 0);

	setButton(viewGame.cat.body, catMeow);

	//Mouses

	viewGame.mouseF = viewGame.createElement({
		type: SPRITE,
		texture: resources.m1.texture,
		width: .08,
		x: .15,
		y: .21,
		anchor: .5
	});

	viewGame.mouseN = viewGame.createElement({
		type: SPRITE,
		texture: resources.m2.texture,
		width: .08,
		x: .15,
		y: .51,
		anchor: .5
	});

	viewGame.mouseM = viewGame.createElement({
		type: SPRITE,
		texture: resources.m3.texture,
		width: .08,
		x: .15,
		y: .81,
		anchor: .5
	});

	viewGame.mouseM.gender = 'm';
	viewGame.mouseN.gender = 'n';
	viewGame.mouseF.gender = 'f';

	setButton(viewGame.mouseM, checkMouse);
	setButton(viewGame.mouseN, checkMouse);
	setButton(viewGame.mouseF, checkMouse);

	//Clouds
	// viewGame.addElement(drawCloud(.14, .06, .1, 0xffffff, styleCloud, 'testtest!', .5, 'up'), { x: .27, y: .21, width: .14 });
	viewGame.cloudF = viewGame.addElement(drawCloud(.14, .06, .1, 0xffffff, styleCloud, 'Она моя!', .5, 'left'), { x: .27, y: .21, width: .14 });
	viewGame.cloudF.zIndex = 4;
	viewGame.cloudF.alpha = 0;

	viewGame.cloudN = viewGame.addElement(drawCloud(.14, .06, .1, 0xffffff, styleCloud, 'Оно моё!', .5, 'left'), { x: .27, y: .51, width: .14 });
	viewGame.cloudN.zIndex = 4;
	viewGame.cloudN.alpha = 0;

	viewGame.cloudM = viewGame.addElement(drawCloud(.14, .06, .1, 0xffffff, styleCloud, 'Он мой!', .5, 'left'), { x: .27, y: .81, width: .14 });
	viewGame.cloudM.zIndex = 4;
	viewGame.cloudM.alpha = 0;

	//Words

	for (let i = 0; i < words.length; i++) {
		words[i] = viewGame.createElement({
			type: TEXT_TEXTURED,
			text: 'wordtest',
			style: styleCheese,
			texture: resources.cheese_texture.texture,
			textureSize: { x: 800, y: 100 },
			x: .5,
			y: .5,
			height: .07,
			byHeight: true
		});
		words[i].zIndex = 3;
	}

	viewGame.sort();
}

function initViewEnd(resources) {

	viewEnd.createElement({
		type: ROUND_RECT,
		width: .6,
		height: .4,
		radius: .1,
		color: 0x5d70bc,
		x: .5,
		y: .6
	})

	viewEnd.createElement({
		type: TEXT,
		text: 'Мышки наелись!',
		style: styleMessage,
		byHeight: false,
		width: .35,
		x: .5,
		y: .55
	});

	let bagain = viewEnd.createElement({
		type: BUTTON,
		text: 'Еще раз',
		style: styleMessage,
		bcolor: 0xff6968,
		bwidth: .7,
		width: .3,
		height: .06,
		x: .5,
		y: .8
	});

	setButton(bagain, showStart);

	viewEnd.mouse1 = viewEnd.createElement({
		type: SPRITE,
		texture: resources.m1.texture,
		width: .15,
		x: .85,
		y: .5,
		anchor: .5
	});

	viewEnd.mouse1.angle = 15;
	viewEnd.mouse1.zIndex = -1;

	viewEnd.mouse2 = viewEnd.createElement({
		type: SPRITE,
		texture: resources.m2.texture,
		width: .15,
		x: .15,
		y: .5,
		anchor: .5
	});

	viewEnd.mouse2.scale.x *= -1
	viewEnd.mouse2.angle = -15;
	viewEnd.mouse2.zIndex = -1;

	viewEnd.mouse3 = viewEnd.createElement({
		type: SPRITE,
		texture: resources.m3.texture,
		width: .15,
		x: .5,
		y: .5,
		anchor: .5
	});

	viewEnd.mouse3.zIndex = -1;

	viewEnd.cloud1 = viewEnd.addElement(drawCloud(.18, .06, .1, 0xffffff, styleCloud, 'testtest!', .5, 'up'), { x: .85, y: .7, width: .18 });

	viewEnd.cloud2 = viewEnd.addElement(drawCloud(.18, .06, .1, 0xffffff, styleCloud, 'testtest!', .5, 'up'), { x: .15, y: .7, width: .18 });

	viewEnd.cloud3 = viewEnd.addElement(drawCloud(.23, .06, .1, 0xffffff, styleCloud, 'testtest!', .6, 'left'), { x: .68, y: .15, width: .23 });

	viewEnd.sort();
}

function setDifficulty(param) {
	difficulty = param;
}

function showCloud(cloud) {
	viewGame.createAnimation({
		type: ANIM_ALPHA,
		element: cloud,
		start: 0,
		end: 1,
		duration: 500,
		isActive: true,
		end_action: () => {
			setTimeout(() => {
				viewGame.createAnimation({
					type: ANIM_ALPHA,
					element: cloud,
					start: 1,
					end: 0,
					duration: 500,
					isActive: true,
					end_action: () => { isShowingCloud = false }
				})
			}, 2000)

		}
	});
}

function jumpMouse(mouse) {
	let pos = mouse.info.getPosition();
	let pos2 = { x: pos.x, y: pos.y - .02 };
	viewGame.createAnimation({
		type: ANIM_MOVE,
		element: mouse,
		start: pos,
		end: pos2,
		duration: 200,
		isActive: true,
		end_action: () => {
			viewGame.createAnimation({
				type: ANIM_MOVE,
				element: mouse,
				start: pos2,
				end: pos,
				duration: 200,
				isActive: true
			})
		}
	});
}

function help() {
	if (isReady && !isShowingCloud) {
		isShowingCloud = true;
		switch (words[curWordIndex].gender) {
			case 'f':
				showCloud(viewGame.cloudF);
				jumpMouse(viewGame.mouseF);
				break;
			case 'm':
				showCloud(viewGame.cloudM);
				jumpMouse(viewGame.mouseM);
				break;
			case 'n':
				showCloud(viewGame.cloudN);
				jumpMouse(viewGame.mouseN);
				break;
		}

	}
}

function catMeow() {
	if (!isMeow && !isShowingCloud) {
		help();
		isMeow = true;
		sound_meow.play();
		viewGame.cat.eyes_open.info.setScale(1, 0);
		viewGame.cat.eyes_close.visible = false;
		viewGame.createAnimation({
			type: ANIM_SCALE,
			element: viewGame.cat.eyes_open,
			end: { x: 1, y: 1 },
			isActive: true,
			duration: 200,
			end_action: () => {
				setTimeout(() => {
					viewGame.createAnimation({
						type: ANIM_SCALE,
						element: viewGame.cat.eyes_open,
						end: { x: 1, y: 0 },
						isActive: true,
						duration: 200,
						end_action: () => {
							isMeow = false;
							viewGame.cat.eyes_close.visible = true;
						}
					})
				}, 1000);
			}
		});

		let pos = viewGame.cat.leg.info.getPosition();
		let pos2 = { x: pos.x - .03, y: pos.y };

		viewGame.createAnimation({
			type: ANIM_MOVE,
			element: viewGame.cat.leg,
			start: pos,
			end: pos2,
			duration: 200,
			isActive: true,
			end_action: () => {
				viewGame.createAnimation({
					type: ANIM_MOVE,
					element: viewGame.cat.leg,
					start: pos2,
					end: pos,
					duration: 200,
					isActive: true
				})
			}
		});
	}
}

function nextWord() {
	if (curWordIndex >= 0) {
		isReady = false;
		viewGame.createAnimation({
			type: ANIM_MOVE,
			element: words[curWordIndex],
			end: { x: .45, y: .35 },
			duration: 400
		});
		viewGame.createAnimation({
			type: ANIM_SCALE,
			element: words[curWordIndex],
			end: { x: 1.3, y: 1.3 },
			duration: 400
		});
		viewGame.createAnimation({
			type: ANIM_ROTATE,
			element: words[curWordIndex],
			end: 0,
			duration: 400,
			end_action: () => { isReady = true }
		});
	} else {
		setTimeout(showEnd, 1000);
	}
}

function showStart() {
	viewStart.show();
	viewGame.hide();
	viewEnd.hide();
}

function showGame() {
	prepareWords();
	nextWord();

	viewStart.hide();
	viewGame.show();
	viewEnd.hide();
}

function showEnd() {

	shuffle(END_PHRASE);
	viewEnd.cloud1.setText(END_PHRASE[0]);
	viewEnd.cloud2.setText(END_PHRASE[1]);
	viewEnd.cloud3.setText(END_PHRASE[2]);

	viewEnd.mouse1.info.setPosition(.5, .5);
	viewEnd.cloud1.alpha = 0;

	setTimeout(() => {
		viewEnd.createAnimation({
			type: ANIM_MOVE,
			element: viewEnd.mouse1,
			end: { x: .85, y: .5 },
			isActive: true,
			duration: Math.random() * 1000 + 500,
			end_action: () => {
				viewEnd.createAnimation({
					type: ANIM_ALPHA,
					element: viewEnd.cloud1,
					start: 0,
					end: 1,
					duration: 500,
					isActive: true
				})
			}
		});
	}, Math.random() * 1000 + 200);

	viewEnd.mouse2.info.setPosition(.5, .5);
	viewEnd.cloud2.alpha = 0;

	setTimeout(() => {
		viewEnd.createAnimation({
			type: ANIM_MOVE,
			element: viewEnd.mouse2,
			end: { x: .15, y: .5 },
			isActive: true,
			duration: Math.random() * 1000 + 500,
			end_action: () => {
				viewEnd.createAnimation({
					type: ANIM_ALPHA,
					element: viewEnd.cloud2,
					start: 0,
					end: 1,
					duration: 500,
					isActive: true
				})
			}
		});
	}, Math.random() * 1000 + 200);

	viewEnd.mouse3.info.setPosition(.5, .5);
	viewEnd.cloud3.alpha = 0;
	setTimeout(() => {
		viewEnd.createAnimation({
			type: ANIM_MOVE,
			element: viewEnd.mouse3,
			end: { x: .5, y: .15 },
			isActive: true,
			duration: Math.random() * 1000 + 500,
			end_action: () => {
				viewEnd.createAnimation({
					type: ANIM_ALPHA,
					element: viewEnd.cloud3,
					start: 0,
					end: 1,
					duration: 500,
					isActive: true
				})
			}
		});
	}, Math.random() * 1000 + 200);



	viewStart.hide();
	viewGame.hide();
	viewEnd.show();
}

function checkMouse() {
	if (isReady) {
		if (words[curWordIndex].gender == this.gender) correct(this);
		else incorrect(this);
	}

}

function correct(mouse) {
	if (!isReady) return;
	isReady = false;
	viewGame.createAnimation({
		type: ANIM_MOVE,
		element: words[curWordIndex],
		end: mouse.info.getPosition(),
		duration: 400
	});
	viewGame.createAnimation({
		type: ANIM_SCALE,
		element: words[curWordIndex],
		end: { x: 0, y: 0 },
		duration: 400
	});
	setTimeout(function () {
		sound_yummy.play();
		curWordIndex--;
		nextWord();
	}, 200);

}

function incorrect(mouse) {
	jumpMouse(mouse);
	if (!sound_no.isPlaying) sound_no.play();
}

function prepareWords() {
	let m = ALL_WORDS['m' + difficulty];
	let f = ALL_WORDS['f' + difficulty];
	let n = ALL_WORDS['n' + difficulty];

	for (let i = 0; i < words.length / 3; i++) {
		words[i].getChildByName('text').text = m[currentPositions[0]++ % m.length];
		words[i].gender = 'm';
		words[i + words.length / 3].getChildByName('text').text = n[currentPositions[1]++ % n.length];
		words[i + words.length / 3].gender = 'n';
		words[i + 2 * words.length / 3].getChildByName('text').text = f[currentPositions[2]++ % f.length];
		words[i + 2 * words.length / 3].gender = 'f';
	}
	for (let i = 0; i < words.length; i++) {
		words[i].info.setScale(1);
		words[i].angle = 15 - Math.random() * 30;
		words[i].info.setPosition(.38 + Math.random() * .04, .75 + Math.random() * .08);
	}
	curWordIndex = words.length - 1;
	shuffle(words);
}

function drawCloud(width, height, radius, color, style, text, textScale, pos) {
	let out = new PIXI.Container();
	// let rect = getRect(width, height, color, radius);
	let title = getText(text, style);
	title.scale.set(textScale);
	out.setText = (text) => { out.getChildByName('text').text = text; };
	let figure, w = width * DEFAULT_WIDTH, h = height * DEFAULT_WIDTH;
	switch (pos) {
		case 'up':
			figure = getPrimitivs([{
				type: 'shape',
				color: color,
				path:
					[new PIXI.Point(-.3 * w, 0),
					new PIXI.Point(.3 * w, 0),
					new PIXI.Point(0, -h * .75)]
			},
			{ type: 'rect', width: width, height: height, radius: radius, color: color }]);
			title.anchor.set(.5, .3);
			break;
		case 'down':
			figure = getPrimitivs([{
				type: 'shape',
				color: color,
				path:
					[new PIXI.Point(-.3 * w, 0),
					new PIXI.Point(.3 * w, 0),
					new PIXI.Point(0, h * .75)]
			},
			{ type: 'rect', width: width, height: height, radius: radius, color: color }]);
			title.anchor.set(.5, .7);
			break;
		case 'left':
			figure = getPrimitivs([{
				type: 'shape',
				color: color,
				path:
					[new PIXI.Point(0, -h * .4),
					new PIXI.Point(-w * .75, 0),
					new PIXI.Point(0, h * .4)]
			},
			{ type: 'rect', width: width, height: height, radius: radius, color: color }]);
			title.anchor.set(.35, .5);
			break;
		case 'right':
			figure = getPrimitivs([{
				type: 'shape',
				color: color,
				path:
					[new PIXI.Point(0, -h * .4),
					new PIXI.Point(w * .75, 0),
					new PIXI.Point(0, h * .4)]
			},
			{ type: 'rect', width: width, height: height, radius: radius, color: color }]);
			title.anchor.set(.65, .5);
			break;
	}
	// out.addChild(rect);
	out.addChild(figure);
	out.addChild(title);
	return out;
}