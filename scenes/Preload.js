export default class Preload extends Phaser.Scene {
    constructor() {
      super("preload");
    }
  
    preload() {
      this.load.image("sky", "./public/assets/sky.png");
      this.load.image("platform", "./public/assets/platform.png");
      this.load.image("watch", "./public/assets/watch.png")
      this.load.image("spike", "./public/assets/spike.png")
      this.load.image("restart", "./public/assets/restart.png")
      this.load.image("title", "./public/assets/title.png")
      this.load.image("press", "./public/assets/press.png")
      this.load.image("any", "./public/assets/any.png")
      this.load.spritesheet("player", "./public/assets/player.png", {
        frameWidth: 158,
        frameHeight: 262
      });
    }
  
    create() {
      // crear animaciones
      this.scene.start("start");
    }
  }