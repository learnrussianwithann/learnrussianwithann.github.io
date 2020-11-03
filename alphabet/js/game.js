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

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
const VOWELS = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
const ELetters = [];

for (let i = 0; i < LETTERS.length; i++) {
	let l = LETTERS[i];
	let e = new Element(l);
	e.isVowel = VOWELS.includes(l);
	ELetters.push(e);
}