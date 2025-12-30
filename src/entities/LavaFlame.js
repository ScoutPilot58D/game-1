import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { soundManager } from '../utils/SoundManager.js';

// Flame reach levels (Y coordinates)
const FLAME_LEVELS = {
  LOW: GAME_HEIGHT - 120,    // Just above lava
  MEDIUM: 380,               // Middle platforms
  HIGH: 250                  // Upper platforms
};

export default class LavaFlame {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.flames = []; // Active flame particles
    this.hitbox = null;

    // Flame position
    this.x = GAME_WIDTH / 2;
    this.targetY = FLAME_LEVELS.LOW;

    // Create warning bubbles
    this.bubbles = [];
    for (let i = 0; i < 5; i++) {
      const bubble = scene.add.circle(0, GAME_HEIGHT - 35, 4 + Math.random() * 4, 0xFFAA00, 0.8);
      bubble.setVisible(false);
      bubble.setDepth(4);
      this.bubbles.push(bubble);
    }

    // Create hitbox for collision (invisible)
    this.hitbox = scene.add.rectangle(this.x, GAME_HEIGHT, 50, 10, 0xFF0000, 0);
    scene.physics.add.existing(this.hitbox);
    this.hitbox.body.allowGravity = false;
    this.hitbox.body.setImmovable(true);
    this.hitbox.setDepth(5);

    // Start the cycle
    this.scheduleNextEruption();
  }

  scheduleNextEruption() {
    // Random delay between eruptions (6-12 seconds)
    const delay = Phaser.Math.Between(6000, 12000);

    this.nextEruptionTimer = this.scene.time.delayedCall(delay, () => {
      if (!this.destroyed) {
        this.startWarning();
      }
    });
  }

  startWarning() {
    // Pick random X position
    this.x = Phaser.Math.Between(80, GAME_WIDTH - 80);

    // Pick random intensity
    const intensities = ['LOW', 'MEDIUM', 'HIGH'];
    const weights = [0.4, 0.4, 0.2]; // 40% low, 40% medium, 20% high
    const rand = Math.random();
    let intensity;
    if (rand < weights[0]) {
      intensity = 'LOW';
    } else if (rand < weights[0] + weights[1]) {
      intensity = 'MEDIUM';
    } else {
      intensity = 'HIGH';
    }
    this.targetY = FLAME_LEVELS[intensity];
    this.intensity = intensity;

    // Position bubbles and show warning
    this.bubbles.forEach((bubble, i) => {
      bubble.x = this.x + Phaser.Math.Between(-20, 20);
      bubble.y = GAME_HEIGHT - 35;
      bubble.setVisible(true);
      bubble.setAlpha(0.8);

      // Animate bubbles rising with increasing urgency
      this.scene.tweens.add({
        targets: bubble,
        y: GAME_HEIGHT - 80 - (i * 10),
        alpha: 0,
        scale: 1.5,
        duration: 1200,
        delay: i * 150,
        ease: 'Sine.easeOut',
        onStart: () => {
          if (i < 3) soundManager.lavaBubble();
        }
      });
    });

    // After warning, erupt
    this.scene.time.delayedCall(1200, () => {
      this.erupt();
    });
  }

  erupt() {
    if (this.destroyed) return;
    this.isActive = true;
    soundManager.flameErupt();

    // Update hitbox position and size
    const flameHeight = GAME_HEIGHT - this.targetY;
    this.hitbox.x = this.x;
    this.hitbox.y = this.targetY + flameHeight / 2;
    this.hitbox.setSize(40, flameHeight);
    this.hitbox.body.setSize(40, flameHeight);

    // Create flame column particles
    this.createFlameColumn();

    // Flame lasts longer for higher intensity
    const duration = this.intensity === 'HIGH' ? 2500 : this.intensity === 'MEDIUM' ? 2000 : 1500;

    this.scene.time.delayedCall(duration, () => {
      this.extinguish();
    });
  }

  createFlameColumn() {
    const flameHeight = GAME_HEIGHT - this.targetY;
    const numParticles = Math.floor(flameHeight / 15);

    // Core flame particles
    for (let i = 0; i < numParticles; i++) {
      const y = GAME_HEIGHT - 30 - (i * 15);
      this.createFlameParticle(this.x, y, i * 30);
    }

    // Continuous flame particles during eruption
    this.flameTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: -1,
      callback: () => {
        if (!this.isActive) return;

        // Rising flame particles
        const particle = this.scene.add.circle(
          this.x + Phaser.Math.Between(-15, 15),
          GAME_HEIGHT - 30,
          Phaser.Math.Between(6, 12),
          Phaser.Math.RND.pick([0xFF4500, 0xFF6600, 0xFFAA00, 0xFFFF00]),
          0.9
        );
        particle.setDepth(5);

        this.scene.tweens.add({
          targets: particle,
          y: this.targetY + Phaser.Math.Between(-20, 20),
          x: particle.x + Phaser.Math.Between(-10, 10),
          scale: 0.3,
          alpha: 0,
          duration: 400 + Math.random() * 200,
          ease: 'Sine.easeOut',
          onComplete: () => particle.destroy()
        });
      }
    });
  }

  createFlameParticle(x, y, delay) {
    this.scene.time.delayedCall(delay, () => {
      if (!this.isActive) return;

      const colors = [0xFF4500, 0xFF6600, 0xFFAA00, 0xFFFF00];
      const size = Phaser.Math.Between(8, 16);

      const flame = this.scene.add.circle(
        x + Phaser.Math.Between(-10, 10),
        GAME_HEIGHT - 20,
        size,
        Phaser.Math.RND.pick(colors),
        0.9
      );
      flame.setDepth(5);
      this.flames.push(flame);

      // Animate rising
      this.scene.tweens.add({
        targets: flame,
        y: y,
        duration: 200,
        ease: 'Sine.easeOut'
      });

      // Flicker animation
      this.scene.tweens.add({
        targets: flame,
        scale: { from: 0.8, to: 1.2 },
        alpha: { from: 0.7, to: 1 },
        duration: 100,
        yoyo: true,
        repeat: -1
      });
    });
  }

  extinguish() {
    this.isActive = false;

    // Stop flame timer
    if (this.flameTimer) {
      this.flameTimer.destroy();
      this.flameTimer = null;
    }

    // Fade out all flame particles
    this.flames.forEach(flame => {
      this.scene.tweens.add({
        targets: flame,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => flame.destroy()
      });
    });
    this.flames = [];

    // Reset hitbox
    this.hitbox.y = GAME_HEIGHT + 100;

    // Schedule next eruption
    this.scheduleNextEruption();
  }

  // Check if a game object is hit by the flame
  checkHit(target) {
    if (!this.isActive) return false;

    const hitboxBounds = this.hitbox.getBounds();
    const targetBounds = target.getBounds();

    return Phaser.Geom.Intersects.RectangleToRectangle(hitboxBounds, targetBounds);
  }

  update() {
    if (this.hitbox.body) {
      this.hitbox.body.updateFromGameObject();
    }
  }

  destroy() {
    this.destroyed = true;
    this.isActive = false;

    if (this.flameTimer) {
      this.flameTimer.destroy();
    }
    if (this.nextEruptionTimer) {
      this.nextEruptionTimer.destroy();
    }
    this.flames.forEach(f => f.destroy());
    this.bubbles.forEach(b => b.destroy());
    if (this.hitbox) {
      this.hitbox.destroy();
    }
  }
}
