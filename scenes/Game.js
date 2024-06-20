import { gameOptions } from "../utils/gameOptions.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.firstMove = true;
    this.platformTouched = false;
    this.score = -1;
  }

  create() {
    this.addBackground();

    //creamos una plataforma incial en la parte inferior de la pantalla
    this.plataformas = this.physics.add.staticGroup();
    // al grupo de plataformas agregar una plataforma
    this.plataformas.create(400, 1300, "platform").setScale(2).refreshBody();

    this.platformGroup = this.physics.add.group();

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

    // Posicionamos al jugador abajo en lugar de arriba
    const playerStartY = this.game.config.height - 100; // Ajusta la posición inicial del jugador aquí
    this.player = this.physics.add.sprite(positionX, playerStartY, "player");
    this.player.setScale(0.2);
    this.player.setGravityY(gameOptions.gameGravity);

    // Configuramos controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    this.textTimer = this.add.text(10, 10, "0", {
      fontSize: "32px",
      fill: "#fff",
    });

    this.textScore = this.add.text(this.game.config.width - 10, 10, "0", {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(1, 0);

    this.textFirstMove = this.add.text(positionX, 500, "Presiona las flechas para empezar", {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0.5, 0);

    this.physics.add.collider(this.platformGroup, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.plataformas, this.player, this.handleCollision, null, this);
  }

  update() {
    const gameSpeedY = gameOptions.platformSpeed;

    this.platformGroup.getChildren().forEach(function (platform) {
      platform.y += gameSpeedY;

      
      if (platform.getBounds().top > this.game.config.height) {
        this.positionPlatform(platform);
      }
    }, this);

  
    if (this.firstMove) {
      this.firstMove = false;
      this.addTimer();
      this.textFirstMove.setText("");
    }

    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.player.body.touching.none) {
      this.platformTouched = false;
    }

    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.scene.start("game");
    }
  }

  addBackground() {
    this.centerX = this.game.config.width / 2;
    this.centerY = this.game.config.height / 2;
    this.background = this.add.image(this.centerX, this.centerY, "sky");
    this.background.displayWidth = this.game.config.width;
    this.background.displayHeight = this.game.config.height;
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
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer() {
    this.textTimer.setText(parseInt(this.textTimer.text) + 1);
  }

  handleCollision(player, platform) {
    if (!this.platformTouched) {
      this.platformTouched = true;
      this.score += 1;
      this.textScore.setText(this.score);
    }
  }
}
