import { gameOptions } from "../utils/gameOptions.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.firstMove = true;
    this.platformTouched = false;
    this.score = -1;
    this.timeLeft = 30; 
    this.gameOver = false;
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
    
    for (let i = 0; i < 10; i++) {
      let platform = this.platformGroup.create(0, 0, "platform");
      platform.setImmovable(true);
      this.positionPlatform(platform, i+1);

      // if (Phaser.Math.Between(0, 9) < 1) { 
      //   let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "watch");
      //   powerUp.setScale(1.5);
      //   powerUp.setGravityY(1200);
      // }
      // if (Phaser.Math.Between(0, 9) < 3) { 
      //   let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "spike");
      //   powerUp.setScale(1.5);
      //   powerUp.setGravityY(1200);
      // }

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
      
    }

    const playerStartY = this.game.config.height - 150; 
    this.player = this.physics.add.sprite(positionX, playerStartY, "player");
    this.player.setScale(0.5);
    this.player.setGravityY(gameOptions.gameGravity);

    this.anims.create({
      key: 'jumpLeft',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 8 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'jumpRight',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 0 }),
      frameRate: 8,
      repeat: 0
    });

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.textTimer = this.add.text(10, 10, "60", {
      fontSize: "32px",
      fill: "#fff",
    });

    this.textScore = this.add.text(this.game.config.width - 10, 10, "0", {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(1, 0);

    this.textFirstMove = this.add.text(positionX, 500, "Presiona A, D para moverte y W para saltar", {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0.5, 0);

    this.physics.add.collider(this.platformGroup, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.plataformaInicial, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.platformGroup, this.powerUpGroup);

    this.addTimer();
  }

  update() {
    const gameSpeedY = gameOptions.platformSpeed;

    this.platformGroup.getChildren().forEach((platform) => {
      platform.y += gameSpeedY;

      if (platform.getBounds().bottom > this.game.config.height) {
        console.log("update", platform.y)
        this.positionPlatform(platform);
      }
    });



    // if (this.platformGroup.getChildren().length < 10) {
    //   for (let i = this.platformGroup.getChildren().length; i < 10; i++) {
    //     let platform = this.platformGroup.create(0, 0, "platform");
    //     platform.setImmovable(true);
    //     this.positionPlatform(platform);
    //   }
    // }

    this.moveParallax();

    if (this.firstMove) {
      this.firstMove = false;
      this.textFirstMove.setText("");
    }

    if (this.keyA.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed);
      this.player.anims.play("jumpRight") 
    } else if (this.keyD.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed);
      this.player.anims.play("jumpLeft") 
    } else {
      this.player.setVelocityX(0); 
    }

    if (this.keyW.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-gameOptions.jumpForce); 

  
      if (this.plataformaInicial) {
        this.plataformaInicial.destroy();
      }
    }

    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.scene.start("gameOver");
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
        speed: 0.8,
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
    const altura = this.getHighesPlatform() === 0 ? index*300 : this.getHighesPlatform();
    platform.y =  altura - this.randomValue(gameOptions.platformVerticalDistanceRange);
    console.log("posicion", platform.y)
    platform.x = this.game.config.width / 2 + this.randomValue(gameOptions.platformHorizontalDistanceRange) * Phaser.Math.RND.sign();
    platform.displayWidth = gameOptions.platformLengthRange[1];
    if (Phaser.Math.Between(0, 9) < 1) { 
      let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "watch");
      powerUp.setScale(1.5);
      powerUp.setGravityY(1200);
    }
    if (Phaser.Math.Between(0, 9) < 3) { 
      let powerUp = this.powerUpGroup.create(platform.x, platform.y - platform.displayHeight / 2 - 20, "spike");
      powerUp.setScale(1.5);
      powerUp.setGravityY(1200);
    }
  }

  randomValue(a) {
    return Phaser.Math.Between(a[0], a[1]);
  }

  // getLowestPlatform() {
  //   let lowestPlatform = 0;
  //   const hijos = this.platformGroup.getChildren();

  //   hijos.forEach(function (platform) {
  //     lowestPlatform = Math.max(lowestPlatform, platform.y);
  //   });
  //   return lowestPlatform;
  // }
  
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
    this.textTimer.setText(this.timeLeft);
    if (this.timeLeft <= 0) {
      this.scene.start("gameOver");
    }
  }

  handleCollision(player, platform) {
    if (!this.platformTouched) {
      this.platformTouched = true;
      this.score += 1;
      this.textScore.setText(this.score);
    }
  }

  collectPowerUp(player, powerUp) {
    powerUp.disableBody(true, true); 
  }
}
