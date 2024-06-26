import Start from "./scenes/Start.js";
import Game from "./scenes/Game.js";
import Preload from "./scenes/Preload.js";
import gameOver from "./scenes/gameOver.js";


const config = {
  type: Phaser.AUTO,
  width: 750,
  height: 1334,
  backgroundColor: 0x444444,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preload, Start, Game, gameOver],
};

window.game = new Phaser.Game(config);