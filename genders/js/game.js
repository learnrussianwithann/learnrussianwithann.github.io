const gamefield = document.getElementById('game');
const app = new PIXI.Application({ resizeTo: gamefield });

const vport = new Viewport(app.stage, 16 / 9);

const floor = new PIXI.Sprite();
const wall = new PIXI.Sprite();
const holes = new PIXI.Sprite();
const mouseF = new Element();
const mouseM = new Element()
const mouseN = new Element()
const maskF = new PIXI.Sprite();
const maskM = new PIXI.Sprite();
const maskN = new PIXI.Sprite();
const cat = new Element();
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 100,
    fontStyle: 'italic',
	fontWeight: 'bold',
	fill: '#ffffff',
    wordWrap: false,
});

const word = new PIXI.Container();
const text = new PIXI.Text('test', style);

const loader = PIXI.Loader.shared;
loader.add('holes', 'img/holes.png')
	.add('m1', 'img/m1.png')
	.add('m2', 'img/m2.png')
	.add('m3', 'img/m3.png')
	.add('mask', 'img/mask.png')
	.add('cat', 'img/cat.png')
	.add('cat_leg', 'img/cat_leg.png')
	.add('wordsBack', 'img/cheese.png')
	.load((loader, resources) => {
		mouseF.put(new PIXI.Sprite(resources.m3.texture));
		mouseN.put(new PIXI.Sprite(resources.m2.texture));
		mouseM.put(new PIXI.Sprite(resources.m1.texture));

		floor.texture = new PIXI.Texture(resources.holes.texture.baseTexture, new PIXI.Rectangle(resources.holes.texture.orig.width - 1, resources.holes.texture.orig.height - 1, 1, 1));
		wall.texture = new PIXI.Texture(resources.holes.texture.baseTexture, new PIXI.Rectangle(0, 0, 1, 1));
		holes.texture = resources.holes.texture;

		maskM.texture = resources.mask.texture;
		maskF.texture = resources.mask.texture;
		maskN.texture = resources.mask.texture;

		cat.put(genSprite(resources.cat_leg.texture, 'leg'));
		cat.put(genSprite(resources.cat.texture, 'body'));
		cat.getByName('leg').position.set(100, .65 * cat.container.height);

		wordsBack = new PIXI.TilingSprite(resources.wordsBack.texture, 1000, 500);
		wordsBack.texture = resources.wordsBack.texture;

		init();
		resize();
	});

var scale = 1;
var wordsBack;


window.addEventListener('resize', resize);

function resize() {
	vport.resize();
}

function init() {
	gamefield.appendChild(app.view);

	vport.add(floor, 0, 0, 5);
	floor.anchor.set(0.5);
	floor.zIndex = -10;

	vport.add(wall, -.2, -1.949, 2);
	wall.rotation = -0.401;
	wall.anchor.set(0.5);
	wall.zIndex = -9;

	vport.add(holes, -.27, -.1, .5);
	holes.anchor.set(0.5);
	holes.zIndex = 0;

	vport.add(mouseF.container, -.25, -.25, .2);
	vport.add(mouseN.container, -.37, -.18, .22);
	vport.add(mouseM.container, -.5, -.15, .25);

	vport.add(maskM, -.226, -.02, .44);
	maskM.anchor.set(.5);
	mouseM.setMask(maskM);

	vport.add(maskN, -.08, -.11, .44);
	maskN.anchor.set(.5);
	mouseN.setMask(maskN);

	vport.add(maskF, .025, -.125, .44);
	maskF.anchor.set(.5);
	mouseF.setMask(maskF);

	vport.add(cat.container, .06, -.5, .6);


	wordsBack.anchor.set(.5);
	text.anchor.set(.5);
	word.addChild(wordsBack);
	word.addChild(text);
	wordsBack.mask = text;
	vport.add(word, 0, 0, .1, true);

	setMoveable(word);

	app.stage.sortChildren();
}
