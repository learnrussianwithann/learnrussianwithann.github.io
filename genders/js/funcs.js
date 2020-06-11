const wordsF = ['морковь', 'пыль', 'лошадь', 'кровать', 'зелень', 'дверь', 'игра', 'пила', 'картина', 'туча', 'погода', 'ягода', 'голова', 'мечта', 'мысль', 'речь', 'ночь', 'дочь', 'ручка', 'причёска', 'юбка', 'футболка', 'бабушка', 'сестра', 'семья', 'вилка', 'сказка', 'книга', 'школа', 'улыбка', 'песня', 'музыка', 'каша', 'фея', 'комната', 'подруга', 'тень', 'помощь', 'дочь', 'вещь'];
const wordsN = ['поле', 'море', 'пальто', 'радио', 'кино', 'кафе', 'варенье', 'небо', 'одеяло', 'зеркало', 'стекло', 'слово', 'дупло', 'плечо', 'молоко ', 'метро', 'кимоно', 'пюре', 'пианино', 'блюдо', 'шоссе', 'желе', 'меню', 'яблоко', 'ухо', 'эхо', 'дерево', 'колено', 'лето', 'письмо', 'зерно', 'гнездо', 'платье', 'солнце', 'полотенце', 'время', 'племя', 'пламя', 'чтение', 'отражение'];
const wordsM = ['папа', 'дядя', 'друг', 'брат', 'урок', 'луч', 'меч', 'заяц', 'куст', 'лес', 'крик', 'сон', 'глаз', 'стол', 'карандаш', 'лист', 'вес', 'магазин', 'поход', 'дождь', 'день', 'ремень', 'огонь', 'шампунь', 'голубь', 'конь', 'мост', 'экран', 'герой', 'рассказ', 'воздух', 'ключ', 'медведь', 'снег', 'тюлень', 'мотоцикл', 'фонтан', 'путь', 'мужчина', 'ботинок'];

var indexN = Math.floor(Math.random() * wordsN.length);
var indexF = Math.floor(Math.random() * wordsF.length);
var indexM = Math.floor(Math.random() * wordsM.length);

function genMask() {
	let mask = new PIXI.Graphics();
	mask.beginFill(0xff5555);
	mask.drawEllipse(0, 0, 20, 20);
	mask.endFill();
	return mask;
}

function dist(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function distElement(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function onDragStart(event) {
	// store a reference to the data
	// the reason for this is because of multitouch
	// we want to track the movement of this particular touch
	this.data = event.data;
	// this.alpha = 0.5;
	this.dragging = true;
	this['offset'] = this.data.getLocalPosition(this.parent);
	this.offset.set(this.x - this.offset.x, this.y - this.offset.y);
}

function onDragEnd() {
	this.dragging = false;
	// set the interaction data to null
	this.data = null;
	let max_dist = 0.1 * vport.h;
	if (distElement(this, mouseF) < max_dist && current_word == 'f') {
		correct(mouseF);
	} else if (distElement(this, mouseN) < max_dist && current_word == 'n') {
		correct(mouseN);
	} else if (distElement(this, mouseM) < max_dist && current_word == 'm') {
		correct(mouseM);
	}
}

function onDragMove() {
	if (this.dragging) {
		const newPosition = this.data.getLocalPosition(this.parent);
		let x = newPosition.x + this.offset.x;
		let y = newPosition.y + this.offset.y;
		if (x > 50 && y > 10 && x < app.screen.width - 50 && y < app.screen.height - 10) {
			this.x = newPosition.x + this.offset.x;
			this.y = newPosition.y + this.offset.y;
		}
	}
}

function newWord(text) {
	text.text = getRandom();
}

function genSprite(texture, name, anchor, scale, position) {
	let out = new PIXI.Sprite(texture);
	out.name = name;
	if (anchor != null) out.anchor.set(anchor);
	if (scale != null) out.scale.set(scale);
	if (position != null) {
		out.x = position.x;
		out.y = position.y;
	}
	return out;
}

function getRandom() {
	switch (Math.floor(Math.random() * 3)) {
		case 0:
			if (++indexF >= wordsF.length) indexF = 0;
			current_word = 'f';
			return wordsF[indexF];
		case 1:
			if (++indexN >= wordsN.length) indexN = 0;
			current_word = 'n';
			return wordsN[indexN];
		case 2:
			if (++indexM >= wordsM.length) indexM = 0;
			current_word = 'm';
			return wordsM[indexM];
	}
}

function setMoveable(element, updFunc) {
	element.on('pointerdown', onDragStart)
		.on('pointerdown', updFunc)
		.on('pointerup', onDragEnd)
		.on('pointerup', updFunc)
		.on('pointerupoutside', onDragEnd)
		.on('pointerupoutside', updFunc)
		.on('pointermove', onDragMove)
		.on('pointermove', updFunc);

	element.interactive = true;
	element.buttonMode = true;
}

function setButton(element, event) {
	element.on('pointerdown', event);
	element.interactive = true;
	element.buttonMode = true;
}

function appering(element, start, end, time) {
	element.scale.set(time / (this.counter * PIXI.Ticker.shared.deltaMS))
	this.couter++;
}

function correct(mouse) {
	word.interactive = false;
	animator.addNewAnimationMove(word, null, mouse.position, .3);
	animator.addNewAnimationScale(word, new Point(-.4), new Point(0), .3, function () {
		text.text = '';
		new_word = true;
	});
	let body = mouse.getChildByName('body');
	let scale = new Point(body.scale.x);
	setTimeout(function () {
		animator.addNewAnimationScale(body, null, new Point(.95 * scale.x, 1.1 * scale.y), .1, function () {
			animator.addNewAnimationScale(body, null, new Point(1.1 * scale.x, .95 * scale.y), .1, function () {
				animator.addNewAnimationScale(body, null, scale, 0.1);
			});
		});
	});

}

function fmove(element, arg, steps) {
	element.x += arg.x * steps;
	element.y += arg.y * steps;
}

function falpha(element, arg, steps) {
	element.alpha += arg * steps;
	console.log('alpha', element.alpha);
}

function fscale(element, arg, steps) {
	element.scale.x += arg.x * steps;
	element.scale.y += arg.y * steps;
}