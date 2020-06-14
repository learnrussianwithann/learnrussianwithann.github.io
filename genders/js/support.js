const wordsF = ['морковь', 'пыль', 'лошадь', 'кровать', 'зелень', 'дверь', 'игра', 'пила', 'картина', 'туча', 'погода', 'ягода', 'голова', 'мечта', 'мысль', 'речь', 'ночь', 'дочь', 'ручка', 'причёска', 'юбка', 'футболка', 'бабушка', 'сестра', 'семья', 'вилка', 'сказка', 'книга', 'школа', 'улыбка', 'песня', 'музыка', 'каша', 'фея', 'комната', 'подруга', 'тень', 'помощь', 'дочь', 'вещь'];
const wordsN = ['поле', 'море', 'пальто', 'радио', 'кино', 'кафе', 'варенье', 'небо', 'одеяло', 'зеркало', 'стекло', 'слово', 'дупло', 'плечо', 'молоко ', 'метро', 'кимоно', 'пюре', 'пианино', 'блюдо', 'шоссе', 'желе', 'меню', 'яблоко', 'ухо', 'эхо', 'дерево', 'колено', 'лето', 'письмо', 'зерно', 'гнездо', 'платье', 'солнце', 'полотенце', 'время', 'племя', 'пламя', 'чтение', 'отражение'];
const wordsM = ['папа', 'дядя', 'друг', 'брат', 'урок', 'луч', 'меч', 'заяц', 'куст', 'лес', 'крик', 'сон', 'глаз', 'стол', 'карандаш', 'лист', 'вес', 'магазин', 'поход', 'дождь', 'день', 'ремень', 'огонь', 'шампунь', 'голубь', 'конь', 'мост', 'экран', 'герой', 'рассказ', 'воздух', 'ключ', 'медведь', 'снег', 'тюлень', 'мотоцикл', 'фонтан', 'путь', 'мужчина', 'ботинок'];

var indexN = Math.floor(Math.random() * wordsN.length);
var indexF = Math.floor(Math.random() * wordsF.length);
var indexM = Math.floor(Math.random() * wordsM.length);

function getDrawRect(w, h, r, color) {
	let out = new PIXI.Graphics();
	if (color) out.beginFill(color);
	else out.beginFill(0xff6868);
	out.drawRoundedRect(-w / 2, -h / 2, w, h, r);
	out.endFill();
	return out;
}

function dist(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function distElement(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function distToMouse(word, mouse) {
	return Math.abs(mouse.x - word.x) < word.width / 2 && Math.abs(mouse.y - word.y) < word.height;
}

// function onDragStart(event) {
// 	// store a reference to the data
// 	// the reason for this is because of multitouch
// 	// we want to track the movement of this particular touch
// 	this.data = event.data;
// 	// this.alpha = 0.5;
// 	this.dragging = true;
// 	this['offset'] = this.data.getLocalPosition(this.parent);
// 	this.offset.set(this.x - this.offset.x, this.y - this.offset.y);
// }

// function onDragEnd() {
// 	this.dragging = false;
// 	// set the interaction data to null
// 	this.data = null;
// 	let max_dist = 0.1 * viewGame.h;
// 	if (distToMouse(this, window.mouseF)) {
// 		if (curWordGender == 'f') correct(window.mouseF);
// 		else incorrect(window.mouseF);
// 	} else if (distToMouse(this, window.mouseN)) {
// 		if (curWordGender == 'n') correct(window.mouseN);
// 		else incorrect(window.mouseN);
// 	} else if (distToMouse(this, window.mouseM)) {
// 		if (curWordGender == 'm') correct(window.mouseM);
// 		else incorrect(window.mouseM);
// 	} else if (distToMouse(this, window.cat)) {
// 		window.catMeow();
// 	}
// }

// function onDragMove() {
// 	if (this.dragging) {
// 		const newPosition = this.data.getLocalPosition(this.parent);
// 		let x = newPosition.x + this.offset.x;
// 		let y = newPosition.y + this.offset.y;
// 		if (x > 50 && y > 10 && x < app.screen.width - 50 && y < app.screen.height - 10) {
// 			this.x = newPosition.x + this.offset.x;
// 			this.y = newPosition.y + this.offset.y;
// 		}
// 	}
// }

function writeNewWord(text) {
	text.text = getRandom();
}

function genCloud(texture, text, style, anchor, scale = 3.6) {
	let cloud = new PIXI.Container();
	cloud.name = 'cloud';
	cloud.addChild(genSprite(texture, 'cloud', { x: -.3, y: .5 }, scale));
	let cloudName = new PIXI.Text(text, style);
	cloudName.anchor.set(anchor.x, anchor.y);
	cloud.addChild(cloudName);
	cloud.alpha = 0;
	return cloud;
}

function genSprite(texture, name, anchor, scale, position) {
	let out = new PIXI.Sprite(texture);
	out.name = name;
	if (anchor != null) {
		if (anchor.hasOwnProperty('x')) {
			out.anchor.x = anchor.x;
			out.anchor.y = anchor.y;
		} else out.anchor.set(anchor);
	}
	if (scale != null) {
		if (scale.hasOwnProperty('x')) {
			out.scale.x = scale.x;
			out.scale.y = scale.y;
		} else out.scale.set(scale);
	}
	if (position != null) {
		out.x = position.x;
		out.y = position.y;
	}
	return out;
}

function genButton(text, style, bcolor) {
	let out = new Element();
	let t = new PIXI.Text(text, style);
	t.anchor.set(0.5);

	out.add(getDrawRect(1.2 * t.width, 2 * t.height, 2 * t.height, bcolor));
	out.add(t);
	return out;
}

function getRandom() {
	switch (Math.floor(Math.random() * 3)) {
		case 0:
			if (++indexF >= wordsF.length) indexF = 0;
			curWordGender = 'f';
			return wordsF[indexF];
		case 1:
			if (++indexN >= wordsN.length) indexN = 0;
			curWordGender = 'n';
			return wordsN[indexN];
		case 2:
			if (++indexM >= wordsM.length) indexM = 0;
			curWordGender = 'm';
			return wordsM[indexM];
	}
}

function setMoveable(element, onDragStart, onDragMove, onDragEnd, updateFunction) {
	element.on('pointerdown', onDragStart)
		.on('pointerdown', updateFunction)
		.on('pointerup', onDragEnd)
		.on('pointerup', updateFunction)
		.on('pointerupoutside', onDragEnd)
		.on('pointerupoutside', updateFunction)
		.on('pointermove', onDragMove)
		.on('pointermove', updateFunction);

	element.interactive = true;
	element.buttonMode = true;
}

function setButton(element, event) {
	element.on('pointerdown', event);
	element.interactive = true;
	element.buttonMode = true;
}

