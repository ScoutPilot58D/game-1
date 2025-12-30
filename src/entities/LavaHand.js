import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { soundManager } from '../utils/SoundManager.js';

export default class LavaHand {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.isRising = false;

    // Hand position (random X each time it appears)
    this.x = GAME_WIDTH / 2;
    this.startY = GAME_HEIGHT + 30;  // Below screen
    this.raisedY = GAME_HEIGHT - 100; // How high it reaches

    // Create the hand sprite (rectangle for now)
    this.sprite = scene.add.rectangle(this.x, this.startY, 40, 80, 0xFF6B00);
    this.sprite.setDepth(5); // Above lava

    // Create warning bubbles (hidden initially)
    this.bubbles = [];
    for (let i = 0; i < 3; i++) {
      const bubble = scene.add.circle(this.x + (i - 1) * 20, GAME_HEIGHT - 40, 6, 0xFFFFFF, 0.7);
      bubble.setVisible(false);
      this.bubbles.push(bubble);
    }

    // Add physics for collision detection
    scene.physics.add.existing(this.sprite);
    this.sprite.body.allowGravity = false;
    this.sprite.body.setImmovable(true);

    // Store reference
    this.sprite.lavaHandInstance = this;

    // Start the cycle
    this.scheduleNextAppearance();
  }

  scheduleNextAppearance() {
    // Random delay between appearances (8-15 seconds)
    const delay = Phaser.Math.Between(8000, 15000);

    this.scene.time.delayedCall(delay, () => {
      this.startWarning();
    });
  }

  startWarning() {
    // Pick random X position
    this.x = Phaser.Math.Between(100, GAME_WIDTH - 100);
    this.sprite.x = this.x;

    // Position and show bubbles
    this.bubbles.forEach((bubble, i) => {
      bubble.x = this.x + (i - 1) * 20;
      bubble.setVisible(true);
      bubble.setAlpha(0.7);
    });

    // Animate bubbles rising with sound
    this.bubbles.forEach((bubble, i) => {
      this.scene.time.delayedCall(i * 200, () => soundManager.lavaBubble());
      this.scene.tweens.add({
        targets: bubble,
        y: GAME_HEIGHT - 80,
        alpha: 0,
        duration: 1500,
        delay: i * 200,
        ease: 'Sine.easeOut'
      });
    });

    // After warning, raise the hand
    this.scene.time.delayedCall(1500, () => {
      this.raise();
    });
  }

  raise() {
    this.isActive = true;
    this.isRising = true;
    soundManager.lavaHandRise();

    // Reset bubble positions for next time
    this.bubbles.forEach(bubble => {
      bubble.y = GAME_HEIGHT - 40;
      bubble.setVisible(false);
    });

    // Animate hand rising
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.raisedY,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.isRising = false;

        // Stay raised for 2 seconds, then lower
        this.scene.time.delayedCall(2000, () => {
          this.lower();
        });
      }
    });
  }

  lower() {
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.isActive = false;
        this.scheduleNextAppearance();
      }
    });
  }

  // Check if a game object is grabbed by the hand
  checkGrab(target) {
    if (!this.isActive) return false;

    const handBounds = this.sprite.getBounds();
    const targetBounds = target.getBounds();

    return Phaser.Geom.Intersects.RectangleToRectangle(handBounds, targetBounds);
  }

  update() {
    // Update sprite body position to match tween
    if (this.sprite.body) {
      this.sprite.body.updateFromGameObject();
    }
  }

  destroy() {
    this.sprite.destroy();
    this.bubbles.forEach(b => b.destroy());
  }
}
