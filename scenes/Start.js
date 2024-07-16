export default class Start extends Phaser.Scene {
    constructor() {
        super("start");
    }

    create() {
        this.add.image(750, 1334, 'sky').setOrigin(1);
        this.add.image(375, 350, 'title').setOrigin(0.5);
        this.add.image(375, 730, 'press').setOrigin(0.5);
        this.add.image(375, 1000, 'any').setOrigin(0.5);
    
        this.plataformaInicial = this.physics.add.staticSprite(400, 1300, "platform").setScale(2);
        
        this.songStart = this.sound.add("songStart");
        this.songStart.play();

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'a' || event.key === 'A' || event.key === 'w' || event.key === 'W' || event.key === 'd' || event.key === 'D') {
                this.songStart.stop();
                this.scene.start('game');
            }
        });
    }
}
