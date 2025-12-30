import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  POINTS,
  EGG_HATCH_TIME
} from '../utils/constants.js';

export default class Egg {
  constructor(scene, x, y, enemyType) {
    this.scene = scene;
    this.enemyType = enemyType;
    this.collected = false;
    this.hatched = false;

    // Create egg sprite
    this.sprite = scene.add.sprite(x, y, 'egg');
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setSize(14, 18);

    // Physics - egg falls and bounces
    this.sprite.body.setBounce(0.4);
    this.sprite.body.setCollideWorldBounds(false);
    this.sprite.body.setDragX(100);

    // Store reference
    this.sprite.eggInstance = this;

    // Start hatch timer
    this.hatchTimer = scene.time.delayedCall(EGG_HATCH_TIME, () => {
      this.hatch();
    });

    // Visual warning before hatching (shake at 1 second left)
    scene.time.delayedCall(EGG_HATCH_TIME - 1000, () => {
      if (!this.collected && !this.hatched) {
        this.startHatchWarning();
      }
    });
  }

  startHatchWarning() {
    // Shake the egg to warn it's about to hatch
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 2,
      duration: 50,
      yoyo: true,
      repeat: 10
    });
  }

  collect() {
    if (this.collected || this.hatched) return;

    this.collected = true;
    this.hatchTimer.remove();

    // Emit collection event
    this.scene.events.emit('eggCollected', {
      points: POINTS.EGG
    });

    // Collection animation - pop and fade
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  hatch() {
    if (this.collected || this.hatched) return;

    this.hatched = true;

    // Determine hatched enemy type (one tier higher)
    let hatchedType = this.enemyType;
    if (this.enemyType === 'BOUNDER') {
      hatchedType = 'HUNTER';
    } else if (this.enemyType === 'HUNTER') {
      hatchedType = 'SHADOW_LORD';
    }
    // SHADOW_LORD stays SHADOW_LORD

    // Emit hatch event
    this.scene.events.emit('eggHatched', {
      x: this.sprite.x,
      y: this.sprite.y,
      type: hatchedType
    });

    // Hatch animation - crack and disappear
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 0.5,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  update() {
    // Kill egg if it falls into lava
    if (this.sprite && this.sprite.y > GAME_HEIGHT - 40) {
      this.collected = true; // Prevent hatching
      this.hatchTimer.remove();
      this.sprite.destroy();
    }
  }
}
