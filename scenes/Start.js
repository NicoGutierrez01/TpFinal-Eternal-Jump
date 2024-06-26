export default class Start extends Phaser.Scene {
    constructor() {
        super("start");
    }

    preload() {

    }

    create() {
        this.add.image(750, 1334, 'sky').setOrigin(1);

        this.add.text(400, 300, 'Eternal Jump', { fontSize: '50px', fill: '#000000'}).setOrigin(0.5);
    
        this.plataformaInicial = this.physics.add.staticSprite(400, 1300, "platform").setScale(2);
        
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'a' || event.key === 'A' || event.key === 'w' || event.key === 'W' || event.key === 'd' || event.key === 'D') {
                this.scene.start('game');
            }
        });
    }
}
