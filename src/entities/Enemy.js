import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  MAX_FALL_SPEED,
  COLORS,
  POINTS
} from '../utils/constants.js';

// Enemy type configurations
const ENEMY_TYPES = {
  BOUNDER: {
    texture: 'bounder',
    speed: 50,
    flapChance: 0.006,     // ~0.4 flaps/sec at 60fps
    flapPower: -110,
    chasePlayer: false,
    points: POINTS.BOUNDER
  },
  HUNTER: {
    texture: 'hunter',
    speed: 80,
    flapChance: 0.008,     // ~0.5 flaps/sec
    flapPower: -120,
    chasePlayer: true,
    points: POINTS.HUNTER
  },
  SHADOW_LORD: {
    texture: 'shadow_lord',
    speed: 110,
    flapChance: 0.010,     // ~0.6 flaps/sec
    flapPower: -130,
    chasePlayer: true,
    points: POINTS.SHADOW_LORD
  }
};

export default class Enemy {
  constructor(scene, x, y, type = 'BOUNDER') {
    this.scene = scene;
    this.type = type;
    this.config = ENEMY_TYPES[type];

    // Create the sprite using texture (mid frame)
    this.sprite = scene.add.sprite(x, y, `${this.config.texture}_mid`);
    scene.physics.add.existing(this.sprite);
    // Start glide animation
    this.sprite.play(`${this.config.texture}_glide`);

    // Physics settings
    this.sprite.body.setMaxVelocityY(MAX_FALL_SPEED);
    this.sprite.body.setCollideWorldBounds(false);
    this.sprite.body.setDragX(30);
    this.sprite.body.setGravityY(0);
    this.sprite.body.allowGravity = true;
    this.sprite.body.setSize(40, 32); // Hitbox size

    // Store reference to this enemy instance on the sprite
    this.sprite.enemyInstance = this;

    // AI state
    this.targetX = this.getRandomTargetX();
    this.targetY = this.getRandomTargetY();
    this.changeTargetTimer = 0;
    this.alive = true;
  }

  getRandomTargetX() {
    return Phaser.Math.Between(50, GAME_WIDTH - 50);
  }

  getRandomTargetY() {
    // Target full vertical range (above lava, below top)
    return Phaser.Math.Between(100, GAME_HEIGHT - 100);
  }

  update(player) {
    if (!this.alive) return;

    const body = this.sprite.body;

    // Update target periodically or if reached
    this.changeTargetTimer++;
    if (this.changeTargetTimer > 180 ||
        (Math.abs(this.sprite.x - this.targetX) < 30 && Math.abs(this.sprite.y - this.targetY) < 30)) {
      this.targetX = this.config.chasePlayer ? player.x : this.getRandomTargetX();
      this.targetY = this.config.chasePlayer ? player.y - 20 : this.getRandomTargetY();
      this.changeTargetTimer = 0;
    }

    // Move toward target
    if (this.sprite.x < this.targetX - 10) {
      body.setVelocityX(this.config.speed);
      this.sprite.flipX = false; // Face right
    } else if (this.sprite.x > this.targetX + 10) {
      body.setVelocityX(-this.config.speed);
      this.sprite.flipX = true; // Face left
    }

    // Only flap if below target Y (need to go up) or about to hit lava
    const needToRise = this.sprite.y > this.targetY + 20;
    const nearLava = this.sprite.y > GAME_HEIGHT - 80;

    if ((needToRise || nearLava) && Math.random() < this.config.flapChance && body.velocity.y > -30) {
      body.setVelocityY(this.config.flapPower);
      this.playFlapAnimation();
    }

    // Try to stay above player if chasing (tactical advantage)
    if (this.config.chasePlayer && player) {
      const belowPlayer = this.sprite.y > player.y + 10;
      const closeToPlayer = Math.abs(this.sprite.x - player.x) < 120;

      if (belowPlayer && closeToPlayer && Math.random() < 0.015 && body.velocity.y > -30) {
        body.setVelocityY(this.config.flapPower);
        this.playFlapAnimation();
      }
    }

    // Screen wrap
    if (this.sprite.x < -20) {
      this.sprite.x = GAME_WIDTH + 20;
    } else if (this.sprite.x > GAME_WIDTH + 20) {
      this.sprite.x = -20;
    }

    // Die if fall into lava zone
    if (this.sprite.y > GAME_HEIGHT - 40) {
      this.die(false); // No egg drop for lava death
    }
  }

  playFlapAnimation() {
    // Play flap animation, then return to glide
    this.sprite.play(`${this.config.texture}_flap`);
    this.sprite.once('animationcomplete', () => {
      if (this.alive) {
        this.sprite.play(`${this.config.texture}_glide`);
      }
    });
  }

  die(dropEgg = true) {
    if (!this.alive) return;

    this.alive = false;

    if (dropEgg) {
      // Emit event for egg drop
      this.scene.events.emit('enemyDefeated', {
        x: this.sprite.x,
        y: this.sprite.y,
        type: this.type,
        points: this.config.points
      });
    }

    // Remove sprite
    this.sprite.destroy();
  }

  getPoints() {
    return this.config.points;
  }
}

export { ENEMY_TYPES };
