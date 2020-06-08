const gamefield = document.getElementById('game');
const app = new PIXI.Application({ resizeTo: gamefield, backgroundColor: 0x1e99bb, antialias: true });

const vport = new Viewport(app.stage, 16 / 9);

const holes = [new PIXI.Sprite(), new PIXI.Sprite(), new PIXI.Sprite()];
const cheese = new PIXI.Sprite();
const mouseF = new Element();
const mouseM = new Element()
const mouseN = new Element()
const cat = new Element();

const word = new PIXI.Container();
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 100,
    fontStyle: 'italic',
	fontWeight: 'bold',
	fill: '#ffffff',
    wordWrap: false,
});
const text = new PIXI.Text(getRandom(), style);

const loader = PIXI.Loader.shared;
loader.add('hole', 'img/hole.png')
	.add('m1', 'img/m1.png')
	.add('m2', 'img/m2.png')
	.add('m3', 'img/m3.png')
	.add('cat', 'img/cat.png')
	.add('cheese', 'img/cheese.png')
	.add('cheese_texture', 'img/cheese_texture.png')
	.load((loader, resources) => {
		mouseF.put(genSprite(resources.m1.texture, 'body', .5));
		mouseN.put(genSprite(resources.m2.texture, 'body', .5));
		mouseM.put(genSprite(resources.m3.texture, 'body', .5));

		holes[0].texture = resources.hole.texture;
		holes[1].texture = resources.hole.texture;
		holes[2].texture = resources.hole.texture;

		cheese.texture = resources.cheese.texture;

		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(686, 1076, 750, 167)), 'leg'));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(0, 0, 1436, 1021)), 'body'));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(186, 1021, 445, 133)), 'eyes_close'));
		cat.put(genSprite(new PIXI.Texture(resources.cat.texture.baseTexture, new PIXI.Rectangle(192, 1154, 439, 194)), 'eyes_open'));
		cat.getByName('leg').position.set(-65, 626);
		cat.getByName('eyes_close').position.set(114, 326);
		cat.getByName('eyes_open').position.set(118, 288);

		cat.hide('eyes_open');

		cheese_texture = new PIXI.TilingSprite(resources.cheese_texture.texture, 1000, 500);
		cheese_texture.texture = resources.cheese_texture.texture;

		init();
		resize();
	});

var scale = 1;
var cheese_texture;


window.addEventListener('resize', resize);

function resize() {
	text.text = app.screen.width + ' ' + app.screen.height + ' ' + window.devicePixelRatio;
	vport.resize();
}

function init() {
	gamefield.appendChild(app.view);

	vport.add(holes[0], -.38, -.32, .14);
	vport.add(holes[1], -.38, -.02, .14);
	vport.add(holes[2], -.38,  .28, .14);
	holes[0].anchor.set(0.5);
	holes[1].anchor.set(0.5);
	holes[2].anchor.set(0.5);

	vport.add(cheese, -.05,0.3, .3);
	cheese.anchor.set(0.5);

	vport.add(mouseF.container, -.38, -.3, .10);
	vport.add(mouseN.container, -.38, -.0, .10);
	vport.add(mouseM.container, -.38,  .3, .10);

	vport.add(cat.container, .13, .0, .35);


	cheese_texture.anchor.set(.5);
	text.anchor.set(.5);
	word.addChild(cheese_texture);
	word.addChild(text);
	cheese_texture.mask = text;
	vport.add(word, .0, -.2, .1, true);

	setMoveable(word);

	setButton(cheese, function() { newWord(text);});

	app.stage.sortChildren();
}
