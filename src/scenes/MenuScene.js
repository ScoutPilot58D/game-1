import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STORAGE_KEYS } from '../utils/constants.js';
import { createRiderAnimationFrames, SPRITE_COLORS } from '../utils/SpriteGenerator.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Create lava background at bottom
    const lava = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 60, 0xFF4500);
    this.tweens.add({
      targets: lava,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Lava glow
    const lavaGlow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 40, 0xFF6600, 0.3);
    this.tweens.add({
      targets: lavaGlow,
      alpha: 0.1,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Create sprite textures for preview
    createRiderAnimationFrames(this, SPRITE_COLORS.PLAYER.bird, SPRITE_COLORS.PLAYER.knight, 'player');
    createRiderAnimationFrames(this, SPRITE_COLORS.BOUNDER.bird, SPRITE_COLORS.BOUNDER.knight, 'bounder');

    // Create flap animations
    ['player', 'bounder'].forEach(type => {
      this.anims.create({
        key: `${type}_glide`,
        frames: [
          { key: `${type}_mid` },
          { key: `${type}_down` },
          { key: `${type}_mid` }
        ],
        frameRate: 4,
        repeat: -1
      });
    });

    // Title with shadow
    this.add.text(GAME_WIDTH / 2 + 3, 103, 'JOUST', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, 100, 'JOUST', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title pulse animation
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 160, 'Knights of the Sky', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#AAAAAA',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Animated player sprite flying across
    const playerPreview = this.add.sprite(100, 280, 'player_mid');
    playerPreview.play('player_glide');
    this.tweens.add({
      targets: playerPreview,
      x: GAME_WIDTH - 100,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: playerPreview,
      y: 260,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enemy sprite chasing
    const enemyPreview = this.add.sprite(GAME_WIDTH - 150, 320, 'bounder_mid');
    enemyPreview.play('bounder_glide');
    enemyPreview.flipX = true;
    this.tweens.add({
      targets: enemyPreview,
      x: 150,
      duration: 4500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: enemyPreview,
      y: 340,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start prompt with blinking
    const startText = this.add.text(GAME_WIDTH / 2, 400, 'PRESS SPACE TO START', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // High score
    const highScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || 0;
    this.add.text(GAME_WIDTH / 2, 460, `HIGH SCORE: ${highScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Controls info
    this.add.text(GAME_WIDTH / 2, 520, 'ARROWS or WASD to move | SPACE to flap', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 545, 'Defeat enemies by landing on them from above!', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    // Keyboard to start
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });

    // Click anywhere to start
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
