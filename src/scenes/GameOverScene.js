import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { soundManager } from '../utils/SoundManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
    this.isNewHighScore = data.isNewHighScore || false;
    this.waveReached = data.wave || 1;
  }

  create() {
    // Dark overlay with lava at bottom
    const lava = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 60, 0xFF4500);
    this.tweens.add({
      targets: lava,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Game Over title with shadow
    this.add.text(GAME_WIDTH / 2 + 3, 103, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const gameOverText = this.add.text(GAME_WIDTH / 2, 100, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF4500',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Pulsing game over
    this.tweens.add({
      targets: gameOverText,
      scale: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Wave reached
    this.add.text(GAME_WIDTH / 2, 180, `WAVE ${this.waveReached} REACHED`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Score display
    this.add.text(GAME_WIDTH / 2, 250, 'SCORE', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    const scoreText = this.add.text(GAME_WIDTH / 2, 290, `${this.finalScore}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate score counting up
    let displayScore = 0;
    const scoreIncrement = Math.ceil(this.finalScore / 60);
    const scoreTimer = this.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        displayScore = Math.min(displayScore + scoreIncrement, this.finalScore);
        scoreText.setText(`${displayScore}`);
      }
    });

    // High score
    this.add.text(GAME_WIDTH / 2, 350, `HIGH SCORE: ${this.highScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    // New high score celebration
    if (this.isNewHighScore) {
      const newHighScoreText = this.add.text(GAME_WIDTH / 2, 400, 'NEW HIGH SCORE!', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00FF00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Flash animation
      this.tweens.add({
        targets: newHighScoreText,
        alpha: 0.3,
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: -1
      });

      // Celebratory particles
      for (let i = 0; i < 20; i++) {
        this.time.delayedCall(i * 100, () => {
          const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
          const star = this.add.text(x, GAME_HEIGHT + 20, '*', {
            fontSize: '24px',
            color: Phaser.Math.RND.pick(['#FFD700', '#00FF00', '#FFFFFF'])
          });
          this.tweens.add({
            targets: star,
            y: -20,
            alpha: 0,
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => star.destroy()
          });
        });
      }
    }

    // Play again prompt
    const playAgainY = this.isNewHighScore ? 470 : 430;
    const playAgainText = this.add.text(GAME_WIDTH / 2, playAgainY, 'PRESS SPACE TO PLAY AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: playAgainText,
      alpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Menu option
    this.add.text(GAME_WIDTH / 2, playAgainY + 40, 'ESC for Menu', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // Click to play again
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
