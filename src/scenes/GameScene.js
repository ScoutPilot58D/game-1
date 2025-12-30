import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  FLAP_VELOCITY,
  MAX_FALL_SPEED,
  PLAYER_SPEED,
  COLORS,
  STARTING_LIVES,
  STORAGE_KEYS,
  SHAKE_INTENSITY,
  SHAKE_DURATION,
  EXTRA_LIFE_SCORE
} from '../utils/constants.js';
import Enemy from '../entities/Enemy.js';
import Egg from '../entities/Egg.js';
import LavaFlame from '../entities/LavaFlame.js';
import { soundManager } from '../utils/SoundManager.js';
import { createRiderAnimationFrames, createEggSprite, createPlatformTexture, SPRITE_COLORS } from '../utils/SpriteGenerator.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.score = 0;
    this.lives = STARTING_LIVES;
    this.wave = 1;
    this.nextExtraLife = EXTRA_LIFE_SCORE;
    this.isPlayerInvulnerable = false;
    this.waveInProgress = false; // Prevents multiple wave completions
  }

  create() {
    // Initialize sound and start music
    soundManager.init();
    soundManager.startMusic(1);

    // Generate sprite textures
    this.createSpriteTextures();

    // Arrays to track entities
    this.enemies = [];
    this.eggs = [];

    // Create platforms
    this.createPlatforms();

    // Create player
    this.createPlayer();

    // Create lava
    this.createLava();

    // Create lava flame hazard
    this.lavaFlame = new LavaFlame(this);

    // Create enemy group for collisions
    this.enemySprites = this.physics.add.group();
    this.eggSprites = this.physics.add.group();

    // Setup collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemySprites, this.platforms);
    this.physics.add.collider(this.eggSprites, this.platforms);
    this.physics.add.overlap(this.player, this.lava, this.onPlayerHitLava, null, this);
    this.physics.add.overlap(this.player, this.enemySprites, this.onPlayerEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.eggSprites, this.onPlayerEggCollision, null, this);

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Pause menu state
    this.isPaused = false;
    this.pauseMenu = null;

    // Track key states for tap-only input (no holding)
    this.canFlap = true;
    this.canThrustLeft = true;
    this.canThrustRight = true;

    // Create HUD
    this.createHUD();

    // Setup event listeners
    this.events.on('enemyDefeated', this.onEnemyDefeated, this);
    this.events.on('eggCollected', this.onEggCollected, this);
    this.events.on('eggHatched', this.onEggHatched, this);

    // Start first wave
    this.startWave();
  }

  createSpriteTextures() {
    // Generate all sprite textures with animation frames
    createRiderAnimationFrames(this, SPRITE_COLORS.PLAYER.bird, SPRITE_COLORS.PLAYER.knight, 'player');
    createRiderAnimationFrames(this, SPRITE_COLORS.BOUNDER.bird, SPRITE_COLORS.BOUNDER.knight, 'bounder');
    createRiderAnimationFrames(this, SPRITE_COLORS.HUNTER.bird, SPRITE_COLORS.HUNTER.knight, 'hunter');
    createRiderAnimationFrames(this, SPRITE_COLORS.SHADOW_LORD.bird, SPRITE_COLORS.SHADOW_LORD.knight, 'shadow_lord');
    createEggSprite(this);

    // Generate platform textures for each size used across all configs
    createPlatformTexture(this, 120, 20);
    createPlatformTexture(this, 150, 20);
    createPlatformTexture(this, 180, 20);
    createPlatformTexture(this, 250, 20);

    // Create flap animations for each rider type
    this.createFlapAnimations();
  }

  createFlapAnimations() {
    const riderTypes = ['player', 'bounder', 'hunter', 'shadow_lord'];

    riderTypes.forEach(type => {
      // Flap animation: mid -> up -> mid -> down -> mid
      this.anims.create({
        key: `${type}_flap`,
        frames: [
          { key: `${type}_mid` },
          { key: `${type}_up` },
          { key: `${type}_mid` },
          { key: `${type}_down` },
          { key: `${type}_mid` }
        ],
        frameRate: 12,
        repeat: 0
      });

      // Glide animation (continuous wing movement while airborne)
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

      // Idle animation (standing still)
      this.anims.create({
        key: `${type}_idle`,
        frames: [
          { key: `${type}_mid` }
        ],
        frameRate: 1,
        repeat: 0
      });
    });
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platformSprites = [];
    this.platformsMoving = false;
    this.platformMoveSpeed = 0.075; // Start very slow

    // Platform configurations - different layouts for variety
    this.platformConfigs = [
      // Config 0: Default layout
      [
        { x: 120, y: 150, width: 150, height: 20 },
        { x: 680, y: 150, width: 150, height: 20 },
        { x: 400, y: 250, width: 250, height: 20 },
        { x: 100, y: 380, width: 120, height: 20 },
        { x: 700, y: 380, width: 120, height: 20 },
        { x: 400, y: 480, width: 180, height: 20 }
      ],
      // Config 1: Shifted middle
      [
        { x: 150, y: 150, width: 150, height: 20 },
        { x: 650, y: 150, width: 150, height: 20 },
        { x: 200, y: 280, width: 180, height: 20 },
        { x: 600, y: 280, width: 180, height: 20 },
        { x: 400, y: 380, width: 250, height: 20 },
        { x: 400, y: 500, width: 120, height: 20 }
      ],
      // Config 2: Staggered
      [
        { x: 100, y: 180, width: 120, height: 20 },
        { x: 700, y: 120, width: 120, height: 20 },
        { x: 300, y: 250, width: 150, height: 20 },
        { x: 500, y: 320, width: 150, height: 20 },
        { x: 150, y: 420, width: 180, height: 20 },
        { x: 650, y: 450, width: 180, height: 20 }
      ],
      // Config 3: Wide gaps
      [
        { x: 100, y: 150, width: 120, height: 20 },
        { x: 700, y: 150, width: 120, height: 20 },
        { x: 400, y: 220, width: 180, height: 20 },
        { x: 200, y: 350, width: 150, height: 20 },
        { x: 600, y: 350, width: 150, height: 20 },
        { x: 400, y: 480, width: 250, height: 20 }
      ]
    ];

    this.currentPlatformConfig = 0;
    this.createPlatformsFromConfig(this.platformConfigs[0]);
  }

  createPlatformsFromConfig(config) {
    config.forEach((data, index) => {
      const textureKey = `platform_${data.width}_${data.height}`;
      const platform = this.add.sprite(data.x, data.y, textureKey);
      this.platforms.add(platform);
      platform.body.setSize(data.width, data.height);
      platform.body.setOffset(0, 0);
      platform.platformIndex = index;
      platform.platformData = { ...data };
      // Movement properties - alternate directions, vary range
      platform.moveDirection = index % 2 === 0 ? 1 : -1;
      platform.moveRange = 80 + (index * 15); // Larger movement range
      platform.baseX = data.x;
      this.platformSprites.push(platform);
    });
  }

  updatePlatformMovement() {
    if (!this.platformsMoving) return;

    this.platformSprites.forEach(platform => {
      // Move platform
      platform.x += this.platformMoveSpeed * platform.moveDirection;

      // Reverse direction at range limits
      if (platform.x > platform.baseX + platform.moveRange) {
        platform.moveDirection = -1;
      } else if (platform.x < platform.baseX - platform.moveRange) {
        platform.moveDirection = 1;
      }

      // Update physics body position
      platform.body.reset(platform.x, platform.y);
    });
  }

  transitionPlatforms() {
    // Pick a new random config (different from current)
    let newConfig;
    do {
      newConfig = Phaser.Math.Between(0, this.platformConfigs.length - 1);
    } while (newConfig === this.currentPlatformConfig && this.platformConfigs.length > 1);

    this.currentPlatformConfig = newConfig;
    const targetConfig = this.platformConfigs[newConfig];

    // Animate platforms to new positions
    this.platformSprites.forEach((platform, index) => {
      const target = targetConfig[index];
      const oldWidth = platform.platformData.width;
      const newWidth = target.width;

      // Fade out, move, change texture if needed, fade in
      this.tweens.add({
        targets: platform,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          // Update texture if size changed
          if (oldWidth !== newWidth) {
            const newKey = `platform_${target.width}_${target.height}`;
            platform.setTexture(newKey);
            platform.body.setSize(target.width, target.height);
          }

          // Move to new position
          platform.x = target.x;
          platform.y = target.y;
          platform.baseX = target.x; // Update base position for movement
          platform.body.reset(target.x, target.y);
          platform.platformData = { ...target };

          // Fade back in
          this.tweens.add({
            targets: platform,
            alpha: 1,
            duration: 300
          });
        }
      });
    });
  }

  createPlayer() {
    this.player = this.add.sprite(400, 440, 'player_mid');
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(false);
    this.player.body.setMaxVelocityY(MAX_FALL_SPEED);
    this.player.body.setDragX(80);
    this.player.body.setSize(40, 32); // Hitbox size
    this.player.setScale(1);
    this.player.flipX = false; // Facing right by default
    // Start with glide animation
    this.player.play('player_glide');
  }

  createLava() {
    this.lava = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 15, GAME_WIDTH, 30, COLORS.LAVA);
    this.physics.add.existing(this.lava, true);

    this.tweens.add({
      targets: this.lava,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Create lava spark particles
    this.createLavaSparks();
  }

  createLavaSparks() {
    // Create spark particles rising from lava
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const spark = this.add.circle(x, GAME_HEIGHT - 25, 3, 0xFF6600);

        this.tweens.add({
          targets: spark,
          y: GAME_HEIGHT - 60,
          alpha: 0,
          scale: 0.3,
          duration: Phaser.Math.Between(400, 800),
          ease: 'Sine.easeOut',
          onComplete: () => spark.destroy()
        });
      }
    });
  }

  // Emit feather particles at a location
  emitFeathers(x, y) {
    const colors = [0xFFFFFF, 0xCCCCCC, 0x8B4513]; // white, gray, brown

    for (let i = 0; i < 8; i++) {
      const color = Phaser.Math.RND.pick(colors);
      const feather = this.add.ellipse(x, y, 6, 10, color);

      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(50, 150);
      const vx = Math.cos(angle * Math.PI / 180) * speed;
      const vy = Math.sin(angle * Math.PI / 180) * speed - 50; // slight upward bias

      this.tweens.add({
        targets: feather,
        x: feather.x + vx,
        y: feather.y + vy + 100, // add gravity effect
        alpha: 0,
        rotation: Phaser.Math.Between(-3, 3),
        duration: 600,
        ease: 'Sine.easeOut',
        onComplete: () => feather.destroy()
      });
    }
  }

  // Emit egg shell particles
  emitEggShell(x, y) {
    for (let i = 0; i < 5; i++) {
      const shell = this.add.arc(x, y, 5, 0, Phaser.Math.Between(90, 180), false, 0xF5F5DC);

      const angle = Phaser.Math.Between(200, 340); // mostly upward
      const speed = Phaser.Math.Between(30, 80);
      const vx = Math.cos(angle * Math.PI / 180) * speed;
      const vy = Math.sin(angle * Math.PI / 180) * speed;

      this.tweens.add({
        targets: shell,
        x: shell.x + vx,
        y: shell.y + vy + 40,
        alpha: 0,
        rotation: Phaser.Math.Between(-2, 2),
        duration: 400,
        ease: 'Sine.easeOut',
        onComplete: () => shell.destroy()
      });
    }
  }

  createHUD() {
    const textStyle = {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    };

    this.scoreText = this.add.text(20, 20, `SCORE: ${this.score}`, textStyle);
    this.waveText = this.add.text(GAME_WIDTH / 2, 20, `WAVE: ${this.wave}`, textStyle).setOrigin(0.5, 0);
    this.livesText = this.add.text(GAME_WIDTH - 20, 20, `LIVES: ${this.getLivesDisplay()}`, textStyle).setOrigin(1, 0);

    // Extra life progress bar
    const barWidth = 100;
    const barHeight = 6;
    const barX = 20;
    const barY = 45;

    this.extraLifeBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333);
    this.extraLifeBarBg.setOrigin(0, 0);
    this.extraLifeBarFill = this.add.rectangle(barX, barY, 0, barHeight, 0x00FF00);
    this.extraLifeBarFill.setOrigin(0, 0);
    this.extraLifeLabel = this.add.text(barX + barWidth + 8, barY - 2, '1UP', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#00FF00'
    });

    this.updateExtraLifeBar();
  }

  updateExtraLifeBar() {
    const prevThreshold = this.nextExtraLife - EXTRA_LIFE_SCORE;
    const progress = (this.score - prevThreshold) / EXTRA_LIFE_SCORE;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.extraLifeBarFill.width = clampedProgress * 100;
  }

  getLivesDisplay() {
    return '♦ '.repeat(this.lives).trim();
  }

  startWave() {
    // Don't start checking for completion until enemies spawn
    this.waveInProgress = false;

    // Enable platform movement starting wave 4
    if (this.wave >= 4 && !this.platformsMoving) {
      this.platformsMoving = true;
    }

    // Increase platform speed gradually each wave after 4
    if (this.wave >= 4) {
      // Starts at 0.075, increases by 0.025 per wave, caps at 0.25
      this.platformMoveSpeed = Math.min(0.25, 0.075 + (this.wave - 4) * 0.025);
    }

    // Update music intensity for this wave
    soundManager.updateMusicIntensity(this.wave);

    // Show wave announcement
    const waveAnnounce = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `WAVE ${this.wave}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: waveAnnounce,
      alpha: 0,
      duration: 1500,
      onComplete: () => waveAnnounce.destroy()
    });

    // Spawn enemies based on wave number
    this.time.delayedCall(1000, () => {
      const totalSpawnTime = this.spawnWaveEnemies();
      // Wait until all enemies have spawned before checking for completion
      this.time.delayedCall(totalSpawnTime + 500, () => {
        this.waveInProgress = true;
      });
    });
  }

  spawnWaveEnemies() {
    // Wave composition
    const waveConfig = this.getWaveConfig(this.wave);

    // Build enemy list
    const enemies = [];
    for (let i = 0; i < waveConfig.bounders; i++) enemies.push('BOUNDER');
    for (let i = 0; i < waveConfig.hunters; i++) enemies.push('HUNTER');
    for (let i = 0; i < waveConfig.shadowLords; i++) enemies.push('SHADOW_LORD');

    // Pick spawn pattern - cycles through patterns, wave 1 always uses standard
    const patterns = ['standard', 'allAtOnce', 'fromSides', 'fromLava'];
    const pattern = this.wave === 1 ? 'standard' : patterns[(this.wave - 1) % patterns.length];

    return this.executeSpawnPattern(pattern, enemies);
  }

  executeSpawnPattern(pattern, enemies) {
    let delay = 0;

    switch (pattern) {
      case 'allAtOnce':
        // Enemies spawn in quick succession from the top (but not all at once)
        const topPoints = [
          { x: 100, y: 50 }, { x: 200, y: 50 }, { x: 300, y: 50 },
          { x: 500, y: 50 }, { x: 600, y: 50 }, { x: 700, y: 50 }
        ];
        enemies.forEach((type, i) => {
          const spawn = topPoints[i % topPoints.length];
          this.time.delayedCall(i * 300, () => {
            this.spawnEnemy(spawn.x + Phaser.Math.Between(-20, 20), spawn.y, type);
          });
          delay = i * 300;
        });
        delay += 400;
        break;

      case 'fromSides':
        // Enemies fly in from left and right edges
        enemies.forEach((type, i) => {
          const fromLeft = i % 2 === 0;
          const x = fromLeft ? -30 : GAME_WIDTH + 30;
          const y = 80 + (i % 4) * 80; // Stagger vertically
          this.time.delayedCall(i * 400, () => {
            const enemy = this.spawnEnemyWithVelocity(x, y, type, fromLeft ? 150 : -150, 0);
          });
          delay = i * 400;
        });
        delay += 500;
        break;

      case 'fromLava':
        // Enemies rise up from the lava
        const lavaSpawnX = [120, 250, 400, 550, 680];
        enemies.forEach((type, i) => {
          const x = lavaSpawnX[i % lavaSpawnX.length];
          this.time.delayedCall(i * 300, () => {
            this.spawnEnemyFromLava(x, type);
          });
          delay = i * 300;
        });
        delay += 800;
        break;

      case 'standard':
      default:
        // Original staggered spawn from top
        const spawnPoints = [
          { x: 150, y: 50 },
          { x: 400, y: 50 },
          { x: 650, y: 50 }
        ];
        enemies.forEach((type, i) => {
          const spawn = spawnPoints[i % spawnPoints.length];
          this.time.delayedCall(i * 500, () => {
            this.spawnEnemy(spawn.x + Phaser.Math.Between(-30, 30), spawn.y, type);
          });
          delay = i * 500;
        });
        delay += 500;
        break;
    }

    return delay;
  }

  spawnEnemyWithVelocity(x, y, type, vx, vy) {
    const enemy = new Enemy(this, x, y, type);
    this.enemies.push(enemy);
    this.enemySprites.add(enemy.sprite);
    // Give initial velocity
    if (enemy.sprite.body) {
      enemy.sprite.body.setVelocity(vx, vy);
    }
    return enemy;
  }

  spawnEnemyFromLava(x, type) {
    const y = GAME_HEIGHT - 50;
    const enemy = new Enemy(this, x, y, type);
    this.enemies.push(enemy);
    this.enemySprites.add(enemy.sprite);
    // Launch upward from lava
    if (enemy.sprite.body) {
      enemy.sprite.body.setVelocity(Phaser.Math.Between(-50, 50), -300);
    }
    // Visual effect - flash of fire
    const fireFlash = this.add.circle(x, GAME_HEIGHT - 40, 20, 0xFF4500, 0.8);
    fireFlash.setDepth(5);
    this.tweens.add({
      targets: fireFlash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => fireFlash.destroy()
    });
  }

  getWaveConfig(wave) {
    // Progressively harder waves
    if (wave === 1) {
      return { bounders: 3, hunters: 0, shadowLords: 0 };
    } else if (wave === 2) {
      return { bounders: 4, hunters: 1, shadowLords: 0 };
    } else if (wave === 3) {
      return { bounders: 3, hunters: 2, shadowLords: 0 };
    } else if (wave === 4) {
      return { bounders: 3, hunters: 2, shadowLords: 1 };
    } else {
      // Wave 5+: gets progressively harder
      const base = wave - 4;
      return {
        bounders: 2 + base,
        hunters: 2 + Math.floor(base / 2),
        shadowLords: 1 + Math.floor(base / 2)
      };
    }
  }

  spawnEnemy(x, y, type) {
    const enemy = new Enemy(this, x, y, type);
    this.enemies.push(enemy);
    this.enemySprites.add(enemy.sprite);
  }

  spawnEgg(x, y, enemyType) {
    const egg = new Egg(this, x, y, enemyType);
    this.eggs.push(egg);
    this.eggSprites.add(egg.sprite);
  }

  update() {
    // Check for escape key to show quit confirmation
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (this.isPaused) {
        this.hidePauseMenu();
      } else {
        this.showPauseMenu();
      }
    }

    // Don't update game if paused
    if (this.isPaused) return;

    this.handlePlayerMovement();
    this.handleScreenWrap();
    this.updatePlatformMovement();

    // Update all enemies
    this.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.update(this.player);
      }
    });

    // Update all eggs
    this.eggs.forEach(egg => {
      egg.update();
    });

    // Update lava flame and check for hits
    this.lavaFlame.update();
    if (this.lavaFlame.isActive && !this.isPlayerInvulnerable) {
      if (this.lavaFlame.checkHit(this.player)) {
        this.playerDeath();
      }
    }
    // Check if lava flame hits enemies
    this.enemies.forEach(enemy => {
      if (enemy.alive && this.lavaFlame.isActive && this.lavaFlame.checkHit(enemy.sprite)) {
        enemy.die(false); // No egg drop when hit by flame
      }
    });

    // Clean up dead enemies and collected eggs
    this.enemies = this.enemies.filter(e => e.alive);
    this.eggs = this.eggs.filter(e => !e.collected && !e.hatched && e.sprite.active);

    // Check for wave completion (only if wave is in progress and has started)
    if (this.waveInProgress && this.enemies.length === 0 && this.eggs.length === 0) {
      this.waveInProgress = false; // Prevent multiple triggers
      this.completeWave();
    }
  }

  handlePlayerMovement() {
    const body = this.player.body;
    const THRUST_POWER = 60;  // Horizontal thrust per tap
    const MAX_HORIZONTAL_SPEED = 250;

    const leftDown = this.cursors.left.isDown || this.wasd.left.isDown;
    const rightDown = this.cursors.right.isDown || this.wasd.right.isDown;
    const flapDown = this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown;

    // Thrust left (requires release between presses)
    if (leftDown && this.canThrustLeft) {
      body.setVelocityX(Math.max(-MAX_HORIZONTAL_SPEED, body.velocity.x - THRUST_POWER));
      this.canThrustLeft = false;
      this.player.flipX = true; // Face left
    } else if (!leftDown) {
      this.canThrustLeft = true;
    }

    // Thrust right (requires release between presses)
    if (rightDown && this.canThrustRight) {
      body.setVelocityX(Math.min(MAX_HORIZONTAL_SPEED, body.velocity.x + THRUST_POWER));
      this.canThrustRight = false;
      this.player.flipX = false; // Face right
    } else if (!rightDown) {
      this.canThrustRight = true;
    }

    // Flap (requires release between presses)
    if (flapDown && this.canFlap) {
      body.setVelocityY(FLAP_VELOCITY);
      this.canFlap = false;
      soundManager.flap();
      // Play flap animation, then return to glide
      this.player.play('player_flap');
      this.player.once('animationcomplete', () => {
        this.player.play('player_glide');
      });
    } else if (!flapDown) {
      this.canFlap = true;
    }
  }

  handleScreenWrap() {
    if (this.player.x < -20) {
      this.player.x = GAME_WIDTH + 20;
    } else if (this.player.x > GAME_WIDTH + 20) {
      this.player.x = -20;
    }
  }

  onPlayerEnemyCollision(player, enemySprite) {
    if (this.isPlayerInvulnerable) return;

    const enemy = enemySprite.enemyInstance;
    if (!enemy || !enemy.alive) return;

    // Height-based combat: whoever's center is higher wins
    const playerCenterY = player.y;
    const enemyCenterY = enemySprite.y;

    if (playerCenterY < enemyCenterY - 5) {
      // Player wins - player is higher
      this.cameras.main.shake(SHAKE_DURATION, SHAKE_INTENSITY * 0.5);
      soundManager.enemyDefeat();
      enemy.die(true);
    } else if (playerCenterY > enemyCenterY + 5) {
      // Enemy wins - enemy is higher
      this.playerDeath();
    } else {
      // Tie - both bounce away
      player.body.setVelocityY(-150);
      player.body.setVelocityX(player.x < enemySprite.x ? -100 : 100);
      enemySprite.body.setVelocityY(-150);
      enemySprite.body.setVelocityX(player.x < enemySprite.x ? 100 : -100);
      // Feathers fly on collision
      this.emitFeathers((player.x + enemySprite.x) / 2, (player.y + enemySprite.y) / 2);
    }
  }

  onPlayerEggCollision(player, eggSprite) {
    const egg = eggSprite.eggInstance;
    if (egg && !egg.collected && !egg.hatched) {
      egg.collect();
    }
  }

  onPlayerHitLava() {
    if (!this.isPlayerInvulnerable) {
      this.playerDeath();
    }
  }

  onEnemyDefeated(data) {
    this.addScore(data.points);
    this.spawnEgg(data.x, data.y, data.type);
    this.emitFeathers(data.x, data.y);
  }

  onEggCollected(data) {
    this.addScore(data.points);
    soundManager.eggCollect();
  }

  onEggHatched(data) {
    soundManager.eggHatch();
    this.emitEggShell(data.x, data.y);
    this.spawnEnemy(data.x, data.y - 20, data.type);
  }

  playerDeath() {
    if (this.isPlayerInvulnerable) return;

    soundManager.playerDeath();
    this.cameras.main.shake(SHAKE_DURATION, SHAKE_INTENSITY);
    this.lives--;
    this.livesText.setText(`LIVES: ${this.getLivesDisplay()}`);

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.respawnPlayer();
    }
  }

  respawnPlayer() {
    this.player.x = 400;
    this.player.y = 250; // Spawn higher up, safely above lava
    this.player.body.setVelocity(0, 0);

    // Invulnerability period
    this.isPlayerInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 15,
      onComplete: () => {
        this.player.alpha = 1;
        this.isPlayerInvulnerable = false;
      }
    });
  }

  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.updateExtraLifeBar();

    // Check for extra life
    if (oldScore < this.nextExtraLife && this.score >= this.nextExtraLife) {
      this.lives++;
      this.livesText.setText(`LIVES: ${this.getLivesDisplay()}`);
      this.nextExtraLife += EXTRA_LIFE_SCORE;
      soundManager.extraLife();

      // Screen flash effect
      const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x00FF00, 0.3);
      flash.setDepth(100);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy()
      });

      // Big "EXTRA LIFE!" text
      const extraLifeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'EXTRA LIFE!', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#00FF00',
        fontStyle: 'bold',
        stroke: '#004400',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(101);

      this.tweens.add({
        targets: extraLifeText,
        scale: { from: 0.5, to: 1.2 },
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: extraLifeText,
            alpha: 0,
            y: extraLifeText.y - 80,
            duration: 1200,
            onComplete: () => extraLifeText.destroy()
          });
        }
      });

      // Pulse the lives display
      this.tweens.add({
        targets: this.livesText,
        scale: { from: 1, to: 1.5 },
        duration: 150,
        yoyo: true,
        repeat: 2
      });

      // Reset the progress bar
      this.updateExtraLifeBar();
    }
  }

  completeWave() {
    soundManager.waveComplete();

    // Wave bonus
    const waveBonus = this.wave * 1000;
    this.addScore(waveBonus);

    // Transition platforms every 2 waves (starting wave 2)
    if (this.wave >= 2 && this.wave % 2 === 0) {
      this.transitionPlatforms();
    }

    // Show wave complete message
    const completeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `WAVE ${this.wave} COMPLETE!\n+${waveBonus} BONUS`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00FF00',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        completeText.destroy();
        this.wave++;
        this.waveText.setText(`WAVE: ${this.wave}`);
        this.startWave();
      }
    });
  }

  showPauseMenu() {
    this.isPaused = true;
    this.physics.pause();
    soundManager.stopMusic();

    // Create dark overlay
    this.pauseOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.pauseOverlay.setDepth(200);

    // Create pause menu container
    this.pauseMenu = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.pauseMenu.setDepth(201);

    const titleText = this.add.text(0, -80, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const quitText = this.add.text(0, 0, 'Quit to Menu?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const yesButton = this.add.text(-60, 60, 'YES', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FF4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const noButton = this.add.text(60, 60, 'NO', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#44FF44',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const escHint = this.add.text(0, 120, '(or press ESC to resume)', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    // Button hover effects
    yesButton.on('pointerover', () => yesButton.setScale(1.2));
    yesButton.on('pointerout', () => yesButton.setScale(1));
    noButton.on('pointerover', () => noButton.setScale(1.2));
    noButton.on('pointerout', () => noButton.setScale(1));

    // Button click handlers
    yesButton.on('pointerdown', () => {
      this.hidePauseMenu();
      this.quitToMenu();
    });

    noButton.on('pointerdown', () => {
      this.hidePauseMenu();
    });

    this.pauseMenu.add([titleText, quitText, yesButton, noButton, escHint]);
  }

  hidePauseMenu() {
    this.isPaused = false;
    this.physics.resume();
    soundManager.startMusic(this.wave);

    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }
  }

  quitToMenu() {
    // Clean up
    soundManager.stopMusic();
    if (this.lavaFlame) {
      this.lavaFlame.destroy();
    }
    this.events.off('enemyDefeated', this.onEnemyDefeated, this);
    this.events.off('eggCollected', this.onEggCollected, this);
    this.events.off('eggHatched', this.onEggHatched, this);

    this.scene.start('MenuScene');
  }

  gameOver() {
    // Stop music
    soundManager.stopMusic();

    // Clean up lava flame (has timers that need stopping)
    if (this.lavaFlame) {
      this.lavaFlame.destroy();
    }

    // Stop platform movement
    this.platformsMoving = false;

    // Clean up event listeners
    this.events.off('enemyDefeated', this.onEnemyDefeated, this);
    this.events.off('eggCollected', this.onEggCollected, this);
    this.events.off('eggHatched', this.onEggHatched, this);

    const highScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || 0;
    if (this.score > highScore) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.score);
    }

    this.scene.start('GameOverScene', {
      score: this.score,
      highScore: Math.max(this.score, parseInt(highScore)),
      isNewHighScore: this.score > parseInt(highScore),
      wave: this.wave
    });
  }
}
