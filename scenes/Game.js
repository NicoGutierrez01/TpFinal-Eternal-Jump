import { gameOptions } from "../utils/gameOptions.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.firstMove = true;
    this.platformTouched = false;
    this.score = 0;
    this.timeLeft = 60; 
    this.gameOver = false;
    this.maxScore = localStorage.getItem('maxScore') || 0;
    this.platformSpeed = gameOptions.platformSpeed;
  }

  create() {
    this.addBackground();

    this.plataformaInicial = this.physics.add.staticSprite(400, 1300, "platform").setScale(2);
    this.plataformaInicial.refreshBody();

    this.platformGroup = this.physics.add.group();
    this.powerUpGroup = this.physics.add.group();

    const positionX = this.game.config.width / 2;
    const positionY = this.game.config.height * gameOptions.firstPlatformPosition;

    let randomIndex = Phaser.Math.Between(0, 9);
    let platformToDisappearIndex = Phaser.Math.Between(0, 9);
    this.platformToDisappear = null;
    
    for (let i = 0; i < 10; i++) {
      let platform = this.platformGroup.create(0, 0, "platform");
      platform.setImmovable(true);
      this.positionPlatform(platform, i + 1);

      if (i === randomIndex) {
        this.tweens.add({
          targets: platform,
          x: platform.x - 150, 
          duration: 2000, 
          ease: 'Power1', 
          yoyo: true, 
          repeat: -1 
        });
      }

      if (i === platformToDisappearIndex) {
        this.platformToDisappear = platform;
      }
    }

    const playerStartY = this.game.config.height - 150; 
    this.player = this.physics.add.sprite(positionX, playerStartY, "player");
    this.player.setScale(0.5);
    this.player.setGravityY(gameOptions.gameGravity); 

    this.anims.create({
      key: 'jumpRight',
      frames: this.anims.generateFrameNumbers('player', { 
        start: 0, 
        end: 3
      }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'jumpLeft',
      frames: this.anims.generateFrameNumbers('player', { 
        start: 5, 
        end: 6
      }),
      frameRate: 8,
      repeat: 0
    });

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.textTimer = this.add.text(10, 10, "Time: 60 ", {
      fontSize: "40px",
      fill: "#ffd045",
    });

    this.textScore = this.add.text(this.game.config.width - 10, 10, "Score: 0", {
      fontSize: "40px",
      fill: "#ffd045",
    }).setOrigin(1, 0);
  

    this.physics.add.collider(this.platformGroup, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.plataformaInicial, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.platformGroup, this.powerUpGroup);

    this.physics.add.overlap(this.player, this.powerUpGroup, this.collectPowerUp, null, this);

    this.addTimer();
    this.addSpeedIncreaseTimer();
  }

  update() {
    const gameSpeedY = this.platformSpeed;

    this.platformGroup.getChildren().forEach((platform) => {
      platform.y += gameSpeedY;

      if (platform.getBounds().bottom > this.game.config.height) {
        this.positionPlatform(platform);
      }
    });

    this.moveParallax();

    if (this.firstMove) {
      this.firstMove = false;
      
    }

    if (this.keyA.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed);
      this.player.anims.play("jumpLeft", true);
    } else if (this.keyD.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed);
      this.player.anims.play("jumpRight", true);
    } else {
      this.player.setVelocityX(0); 
    }

    if (this.keyW.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-gameOptions.jumpForce); 

      if (this.plataformaInicial) {
        this.plataformaInicial.destroy();
      }

      this.handleJump();
    }

    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.gameOverHandler("fall");
    }
    
  }

  addSpeedIncreaseTimer() {
    this.time.addEvent({
      delay: 5000, // 5 segundos
      callback: this.increasePlatformSpeed,
      callbackScope: this,
      loop: true,
    });
  }
  
  increasePlatformSpeed() {
    this.platformSpeed += 1;
  }

  handleJump() {
    this.platformTouched = false; 
    this.score += 100; 
    this.updateScoreDisplay(); 
  }

  gameOverHandler(cause) {
    // Mostrar pantalla de gameOver con puntaje y verificar récord
    this.scene.start("gameOver", {
        cause: cause,
        score: this.score,
        maxScore: this.maxScore
    });

    // Actualizar puntaje máximo si se estableció un nuevo récord
    if (this.score > this.maxScore) {
        this.maxScore = this.score;
        localStorage.setItem('maxScore', this.maxScore);
    }
  }

  addBackground() {
    this.white = this.add.tileSprite(
      this.game.config.width / 2,
      this.game.config.height / 2,
      this.game.config.width,
      this.game.config.height,
      "sky"
    );

    this.parallaxLayers = [
      {
        speed: 2,
        sprite: this.white,
      },
    ];
  }

  moveParallax() {
    this.parallaxLayers.forEach((layer) => {
      layer.sprite.tilePositionY -= layer.speed;
    });
  }

  positionPlatform(platform, index = 0) {
    const altura = this.getHighesPlatform() === 0 ? index * 300 : this.getHighesPlatform();
    platform.y = altura - this.randomValue(gameOptions.platformVerticalDistanceRange);
    platform.x = this.game.config.width / 2 + this.randomValue(gameOptions.platformHorizontalDistanceRange) * Phaser.Math.RND.sign();
    platform.displayWidth = gameOptions.platformLengthRange[1];
    
    if (Phaser.Math.Between(0, 9) < 1) { 
      let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "watch");
      powerUp.setScale(1.5);
      powerUp.setGravityY(1200);
    }
    if (Phaser.Math.Between(0, 9) < 1) { 
      let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "spike");
      powerUp.setScale(1.5);
      powerUp.setGravityY(1200);
    }
  }

  randomValue(a) {
    return Phaser.Math.Between(a[0], a[1]);
  }

  getHighesPlatform() {
    let highesPlatform = this.game.config.height;
    const hijos = this.platformGroup.getChildren();

    hijos.forEach(function (platform) {
      highesPlatform = Math.min(highesPlatform, platform.y);
    });
    return highesPlatform;
  }

  addTimer() {
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.timeLeft--;
    this.textTimer.setText("Time: " + this.timeLeft);
    if (this.timeLeft <= 0) {
      this.gameOverHandler("time");
    }
  }

  handleCollision(player, platform) {
    if (!this.platformTouched) {
      this.platformTouched = true;
      this.score += 100; 
      this.updateScoreDisplay();
    }
    if (platform === this.platformToDisappear) {
      this.time.delayedCall(1000, () => {
        platform.destroy();
        this.platformToDisappear = null; // Para que no se destruya de nuevo
      });
    }
  }
  

  updateScoreDisplay() {
    this.tweens.addCounter({
        from: parseInt(this.textScore.text.split(': ')[1]),
        to: this.score,
        duration: 500,
        onUpdate: (tween) => {
            this.textScore.setText('Score: ' + Math.floor(tween.getValue()));
        }
    });
  }

  collectPowerUp(player, powerUp) {
    if (powerUp.texture.key === "watch") {
      this.timeLeft += 15;
      powerUp.destroy();
    } else if (powerUp.texture.key === "spike") {
      this.gameOverHandler("spike");
    }
  }
}
