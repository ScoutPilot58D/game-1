// Game dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Physics - tuned for floaty Joust feel
export const GRAVITY = 150;           // Very light gravity for maximum hang time
export const FLAP_VELOCITY = -120;    // Gentle flaps
export const MAX_FALL_SPEED = 150;    // Slow, floaty descent
export const PLAYER_SPEED = 220;      // Responsive horizontal movement
export const PLAYER_DRAG = 10;        // Low drag = lots of glide/momentum

// Colors (hex values for Phaser)
export const COLORS = {
  BACKGROUND: 0x000000,
  PLATFORM: 0x8B4513,
  PLAYER_OSTRICH: 0xFFD700,
  PLAYER_KNIGHT: 0xC0C0C0,
  BOUNDER: 0x8B0000,
  HUNTER: 0x696969,
  SHADOW_LORD: 0x4169E1,
  LAVA: 0xFF4500,
  EGG: 0xF5F5DC,
  UI_TEXT: 0xFFFFFF
};

// Scoring
export const POINTS = {
  BOUNDER: 500,
  HUNTER: 750,
  SHADOW_LORD: 1000,
  EGG: 250,
  WAVE_BONUS_MULTIPLIER: 1000
};

// Game settings
export const STARTING_LIVES = 3;
export const EXTRA_LIFE_SCORE = 20000;
export const EGG_HATCH_TIME = 5000; // milliseconds

// Screen shake
export const SHAKE_INTENSITY = 0.01;
export const SHAKE_DURATION = 200;

// Local storage keys
export const STORAGE_KEYS = {
  HIGH_SCORE: 'joust_highscore'
};
