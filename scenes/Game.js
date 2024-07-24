import { gameOptions } from "../utils/gameOptions.js";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    // Variables de estado inicial del juego
    this.firstMove = true; // Indica si es el primer movimiento del jugador
    this.platformTouched = false; // Indica si el jugador ha tocado una plataforma recientemente
    this.score = 0; // Puntaje actual del jugador
    this.timeLeft = 60; // Tiempo restante en segundos
    this.gameOver = false; // Indica si el juego ha terminado
    this.maxScore = localStorage.getItem('maxScore') || 0; // Puntaje máximo guardado en localStorage
    this.platformSpeed = gameOptions.platformSpeed; // Velocidad inicial de las plataformas

    // Inicialización y gestión de la música del juego
    if (!this.songGame || !this.songGame.isPlaying) {
      this.songGame = this.sound.add('songGame');
      this.songGame.play();
    } else if (this.songGame.isPaused) {
      this.songGame.resume();
    }
  }

  create() {
    // Configuración inicial de la escena del juego
    this.addBackground(); // Añade el fondo y configura el parallax

    // Creación de la plataforma inicial estática
    this.plataformaInicial = this.physics.add.staticSprite(400, 1300, "platform").setScale(2);
    this.plataformaInicial.refreshBody();

    // Temporizador para desaparecer la plataforma inicial después de 3 segundos
    this.time.delayedCall(3000, () => {
      if (this.plataformaInicial) {
        this.plataformaInicial.destroy();
        this.plataformaInicial = null;
      }
    });

    // Grupos de físicas para las plataformas y los power-ups
    this.platformGroup = this.physics.add.group();
    this.powerUpGroup = this.physics.add.group();

    // Configuración de las plataformas y power-ups iniciales
    const positionX = this.game.config.width / 2;
    let randomIndex = Phaser.Math.Between(0, 9);
    let platformToDisappearIndex = Phaser.Math.Between(0, 9);
    this.platformToDisappear = null;

    for (let i = 0; i < 10; i++) {
      let platform = this.platformGroup.create(0, 0, "platform");
      platform.setImmovable(true);
      platform.body.checkCollision.down = false;
      platform.body.checkCollision.left = false;
      platform.body.checkCollision.right = false;
      this.positionPlatform(platform, i + 1);

      // Animación de oscilación para una plataforma aleatoria
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

      // Marca la plataforma que desaparecerá más adelante
      if (i === platformToDisappearIndex) {
        this.platformToDisappear = platform;
      }
    }

    // Creación del jugador y configuración de animaciones
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

    // Configuración de teclas para controlar al jugador
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    // Texto para mostrar el temporizador y el puntaje
    this.textTimer = this.add.text(10, 10, "Time: 60 ", {
      fontSize: "40px",
      fill: "#ffd045",
    });

    this.textScore = this.add.text(this.game.config.width - 10, 10, "Score: 0", {
      fontSize: "40px",
      fill: "#ffd045",
    }).setOrigin(1, 0);

    // Colisiones y superposiciones entre objetos físicos
    this.physics.add.collider(this.platformGroup, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.plataformaInicial, this.player, this.handleCollision, null, this);
    this.physics.add.collider(this.platformGroup, this.powerUpGroup);
    this.physics.add.overlap(this.player, this.powerUpGroup, this.collectPowerUp, null, this);

    // Añadir eventos de temporizador para la velocidad de las plataformas y actualización del juego
    this.addTimer();
    this.addSpeedIncreaseTimer();
  }

  update() {
    // Lógica de actualización del juego en cada fotograma
    const gameSpeedY = this.platformSpeed;

    // Movimiento de las plataformas hacia abajo y reciclaje
    this.platformGroup.getChildren().forEach((platform) => {
      platform.y += gameSpeedY;

      if (platform.getBounds().bottom > this.game.config.height) {
        this.positionPlatform(platform);
      }
    });

    // Movimiento del fondo parallax
    this.moveParallax();

    // Control del primer movimiento del jugador
    if (this.firstMove) {
      this.firstMove = false;
    }

    // Control del movimiento del jugador con las teclas A, D y W
    if (this.keyA.isDown) {
      this.player.setVelocityX(-gameOptions.heroSpeed);
      this.player.anims.play("jumpLeft", true);
    } else if (this.keyD.isDown) {
      this.player.setVelocityX(gameOptions.heroSpeed);
      this.player.anims.play("jumpRight", true);
    } else {
      this.player.setVelocityX(0);
    }

    // Control del salto del jugador con la tecla W
    if (this.keyW.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-gameOptions.jumpForce);

      if (this.plataformaInicial) {
        this.plataformaInicial.destroy();
        this.plataformaInicial = null;
      }

      this.handleJump();
    }

    // Control del fin de juego si el jugador cae fuera de la pantalla
    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.gameOverHandler("fall");
    }

    // Pausa la música si el juego ha terminado
    if (this.gameOver) {
      this.songGame.pause();
    }
  }

  // Función para añadir un temporizador de aumento de velocidad de las plataformas
  addSpeedIncreaseTimer() {
    this.time.addEvent({
      delay: 5000, // Cada 5 segundos
      callback: this.increasePlatformSpeed,
      callbackScope: this,
      loop: true,
    });
  }
  
  // Función para aumentar la velocidad de las plataformas
  increasePlatformSpeed() {
    this.platformSpeed += 1;
  }

  // Función para manejar el salto del jugador
  handleJump() {
    this.platformTouched = false;
    this.score += 100;
    this.updateScoreDisplay();
  }

  // Función para manejar el fin del juego
  gameOverHandler(cause) {
    // Mostrar pantalla de gameOver con puntaje y verificar récord
    this.scene.start("gameOver", {
      cause: cause,
      score: this.score,
      maxScore: this.maxScore
    });

    // Pausar la música al activar la escena gameOver
    this.songGame.pause();

    // Actualizar puntaje máximo si se estableció un nuevo récord
    if (this.score > this.maxScore) {
      this.maxScore = this.score;
      localStorage.setItem('maxScore', this.maxScore);
    }
  }

  // Función para añadir el fondo y configurar el parallax
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

  // Función para mover el fondo parallax
  moveParallax() {
    this.parallaxLayers.forEach((layer) => {
      layer.sprite.tilePositionY -= layer.speed;
    });
  }

  // Función para posicionar las plataformas con variación aleatoria
  positionPlatform(platform, index = 0) {
    const altura = this.getHighesPlatform() === 0 ? index * 300 : this.getHighesPlatform();
    platform.y = altura - this.randomValue(gameOptions.platformVerticalDistanceRange);
    platform.x = this.game.config.width / 2 + this.randomValue(gameOptions.platformHorizontalDistanceRange) * Phaser.Math.RND.sign();
    platform.displayWidth = gameOptions.platformLengthRange[1];
    
    // Creación de power-ups con probabilidades
    if (Phaser.Math.Between(0, 9) < 1) {
      let powerUp = this.powerUpGroup.create(
        platform.x,
        platform.y - platform.displayHeight / 2 - 20,
        "watch"
      );
      powerUp.setScale(1.5);
      this.events.on("postupdate", () => {
        Phaser.Display.Align.To.TopCenter(powerUp, platform);
      });
    }
    if (Phaser.Math.Between(0, 9) < 1) {
      let powerUp = this.powerUpGroup.create(
        platform.x,
        platform.y - platform.displayHeight / 2 - 20,
        "spike"
      );
      powerUp.setScale(1.5);
      this.events.on("postupdate", () => {
        Phaser.Display.Align.To.TopCenter(powerUp, platform);
      });
    }
  }

  // Función para generar un valor aleatorio dentro de un rango
  randomValue(range) {
    return Phaser.Math.Between(range[0], range[1]);
  }

  // Función para obtener la plataforma más alta
  getHighesPlatform() {
    let highesPlatform = this.game.config.height;
    const hijos = this.platformGroup.getChildren();

    hijos.forEach(function (platform) {
      highesPlatform = Math.min(highesPlatform, platform.y);
    });
    return highesPlatform;
  }

  // Función para añadir un temporizador de cuenta regresiva
  addTimer() {
    this.time.addEvent({
      delay: 1000, // Cada 1 segundo
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  // Función para actualizar el temporizador
  updateTimer() {
    this.timeLeft--;
    this.textTimer.setText("Time: " + this.timeLeft);
    if (this.timeLeft <= 0) {
      this.gameOverHandler("time");
    }
  }

  // Función para manejar la colisión entre el jugador y las plataformas
  handleCollision(player, platform) {
    if (player.body.touching.down && platform.body.touching.up) {
      // Incremento de puntaje al tocar una nueva plataforma
      if (!this.platformTouched) {
        this.platformTouched = true;
        this.score += 100;
        this.updateScoreDisplay();
      }
      // Eliminación de la plataforma marcada para desaparecer
      if (platform === this.platformToDisappear) {
        this.time.delayedCall(1000, () => {
          platform.destroy();
          this.platformToDisappear = null; // Evitar que se destruya de nuevo
        });
      }
    }
  }

  // Función para actualizar el puntaje mostrado en pantalla con una animación
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

  // Función para recolectar power-ups y aplicar efectos
  collectPowerUp(player, powerUp) {
    if (powerUp.texture.key === "watch") {
      this.timeLeft += 15; // Añade tiempo al temporizador
      powerUp.destroy(); // Elimina el power-up
    } else if (powerUp.texture.key === "spike") {
      this.gameOverHandler("spike"); // Termina el juego por contacto con el spike
    }
  }
}
