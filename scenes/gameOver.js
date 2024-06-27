export default class gameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }
  
    create(){
        this.add.image(750, 1334, 'sky').setOrigin(1);

        this.add.text(400, 300, 'Game Over', { fontSize: '50px', fill: '#000000'}).setOrigin(0.5);

        const restartButton = this.add.image(150, 700, 'restart').setOrigin(0.1);
    
        restartButton.setInteractive({ cursor: 'pointer' });
        restartButton.setScale(0.4); 
     
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.35); 
        });
    
        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4); 
        });

        restartButton.on('pointerdown', () => {
        
        this.scene.start('start'); 
    }); 
    }
}