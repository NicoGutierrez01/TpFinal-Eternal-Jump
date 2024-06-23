export default class Preload extends Phaser.Scene {
    constructor() {
      super("preload");
    }
  
    preload() {
      this.load.image("fondo-1", "../public/assets/fondo-1.png");
      this.load.image("fondo-2", "../public/assets/fondo-2.png");
      this.load.image("platform", "../public/assets/plataforma.png");
      this.load.spritesheet("player", "../public/assets/player.png", {
        frameWidth: 184,
        frameHeight: 325
      });
    }
  
    create() {
      // crear animaciones
      this.scene.start("game");
    }
  }