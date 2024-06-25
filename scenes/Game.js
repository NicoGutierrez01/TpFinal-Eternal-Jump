import { gameOptions } from "../utils/gameOptions.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.firstMove = true;
    this.platformTouched = false;
    this.score = -1;
    this.timeLeft = 60; 
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

    const platform = this.platformGroup.create(positionX, positionY, "platform");
    platform.setScale(0.3, 1);
    platform.setImmovable(true);

    for (let i = 0; i < 10; i++) {
      let platform = this.platformGroup.create(0, 0, "platform");
      platform.setImmovable(true);
      this.positionPlatform(platform);
    }

    if (Phaser.Math.Between(0, 9) === 0) { 
      let powerUp = this.powerUpGroup.create(0, 0, "watch");
      powerUp.setScale(1.5);
      powerUp.setImmovable(true);
      powerUp.y = platform.y - platform.displayHeight / 2 - 20; 
      powerUp.x = platform.x;
    }
    if (Phaser.Math.Between(0, 9) === 0) { 
      let powerUp = this.powerUpGroup.create(0, 0, "spike");
      powerUp.setScale(1.5);
      powerUp.setImmovable(true);
      powerUp.y = platform.y - platform.displayHeight / 2 - 20; 
      powerUp.x = platform.x;
    }

    const playerStartY = this.game.config.height - 100; 
    this.player = this.physics.add.sprite(positionX, playerStartY, "player");
    this.player.setScale(0.2);
    this.player.setGravityY(gameOptions.gameGravity);

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

    this.addTimer();
  }

  update() {
    const gameSpeedY = gameOptions.platformSpeed;

    this.platformGroup.getChildren().forEach((platform) => {
      platform.y += gameSpeedY;

      if (platform.getBounds().bottom > this.game.config.height) {
        this.positionPlatform(platform);
      }
    });

    if (this.platformGroup.getChildren().length < 10) {
      for (let i = this.platformGroup.getChildren().length; i < 10; i++) {
        let platform = this.platformGroup.create(0, 0, "platform");
        platform.setImmovable(true);
        this.positionPlatform(platform);
      }
    }

    this.moveParallax();

    if (this.firstMove) {
      this.firstMove = false;
      this.textFirstMove.setText("");
    }

    if (this.keyA.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed); 
    } else if (this.keyD.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed); 
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
      this.scene.start("game");
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

  positionPlatform(platform) {
    platform.y = this.getLowestPlatform() + this.randomValue(gameOptions.platformVerticalDistanceRange);
    platform.x = this.game.config.width / 2 + this.randomValue(gameOptions.platformHorizontalDistanceRange) * Phaser.Math.RND.sign();
    platform.displayWidth = gameOptions.platformLengthRange[1];
  }

  randomValue(a) {
    return Phaser.Math.Between(a[0], a[1]);
  }

  getLowestPlatform() {
    let lowestPlatform = 0;
    const hijos = this.platformGroup.getChildren();

    hijos.forEach(function (platform) {
      lowestPlatform = Math.max(lowestPlatform, platform.y);
    });
    return lowestPlatform;
  }

  addTimer() {
    this.time.addEvent({
      delay: 1000, // 1 segundo
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
