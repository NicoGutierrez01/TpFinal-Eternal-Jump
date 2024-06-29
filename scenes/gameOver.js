export default class gameOver extends Phaser.Scene {
    constructor() {
      super("gameOver");
    }
  
    init(data) {
      this.causeOfDeath = data.cause;
      this.score = data.score;
      this.maxScore = data.maxScore;
    }
  
    create() {
      this.add.image(750, 1334, 'sky').setOrigin(1);

      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;

      this.add.text(centerX, centerY, `Your Score: ${this.score}`, {
        fontSize: "60px",
        fill: "#ffd045",
        align: "center"
    }).setOrigin(0.5);
    if (this.score > this.maxScore) {
        this.add.text(centerX, centerY + 50, "New Record!", {
            fontSize: "60px",
            fill: "#ffd045",
            align: "center"
        }).setOrigin(0.5);
    }
  
      let imageKey = this.causeOfDeath === "time" ? "time" : "died";
      this.add.image(375, 300, imageKey).setOrigin(0.5);
  
      const restartButton = this.add.image(375, 900, 'restart').setOrigin(0.5);
      
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
  