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

    // Creamos una plataforma inicial en la parte inferior de la pantalla
    this.plataformaInicial = this.physics.add.staticSprite(400, 1300, "platform").setScale(2);
    this.plataformaInicial.refreshBody();

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
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.textTimer = this.add.text(10, 10, "0", {
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

    // Popup para iniciar el juego
    this.textStart = this.add.text(this.game.config.width / 2, this.game.config.height / 2, "Presiona SPACE para iniciar", {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0.5);
    this.textStart.setVisible(true); // Lo mostramos inicialmente

    // Colocamos colisiones
    this.physics.add.collider(this.platformGroup, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.plataformaInicial, this.player, this.handleCollision, null, this);
  }

  update() {
    const gameSpeedY = gameOptions.platformSpeed;

    // Mover las plataformas hacia abajo y reposicionarlas si es necesario
    this.platformGroup.getChildren().forEach((platform) => {
      platform.y += gameSpeedY;

      // Si una plataforma se mueve fuera de la pantalla, reposicionarla
      if (platform.getBounds().bottom > this.game.config.height) {
        this.positionPlatform(platform);
      }
    });

    // Generar nuevas plataformas si no hay suficientes visibles
    if (this.platformGroup.getChildren().length < 10) {
      for (let i = this.platformGroup.getChildren().length; i < 10; i++) {
        let platform = this.platformGroup.create(0, 0, "platform");
        platform.setImmovable(true);
        this.positionPlatform(platform);
      }
    }

    // Mover el fondo parallax
    this.moveParallax();

    if (this.firstMove) {
      this.firstMove = false;
      this.addTimer();
      this.textFirstMove.setText("");
    }

    // Ocultar el texto de inicio cuando se presiona SPACE
    if (this.keySPACE.isDown && this.firstMove) {
      this.textStart.setVisible(false);
    }

    // Manejo de las teclas A, D y W para movimiento y salto
    if (this.keyA.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed); // Mover a la izquierda
    } else if (this.keyD.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed); // Mover a la derecha
    } else {
      this.player.setVelocityX(0); // Detenerse si ninguna tecla de movimiento está presionada
    }

    if (this.keyW.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-gameOptions.jumpForce); // Saltar si está en contacto con una plataforma y se presiona W

      // Eliminar la plataforma inicial cuando el jugador salte
      if (this.plataformaInicial) {
        this.plataformaInicial.destroy();
      }
    }

    // Reiniciar el juego si el jugador sale de la pantalla
    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.scene.start("game");
    }
  }

  addBackground() {
    this.gray = this.add.tileSprite(
      this.game.config.width / 2,
      this.game.config.height / 2,
      this.game.config.width,
      this.game.config.height,
      "fondo-2"
    );
    this.white = this.add.tileSprite(
      this.game.config.width / 2,
      this.game.config.height / 2,
      this.game.config.width,
      this.game.config.height,
      "fondo-1"
    );

    this.parallaxLayers = [
      {
        speed: 0.2,
        sprite: this.gray,
      },
      {
        speed: 0.6,
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
