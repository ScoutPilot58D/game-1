// Generates pixel-art style sprites using Phaser Graphics
// Creates knight-on-bird characters for player and enemies

// Helper to lighten a color by a factor (0-1)
function lightenColor(color, factor) {
  const r = (color >> 16) & 0xFF;
  const g = (color >> 8) & 0xFF;
  const b = color & 0xFF;
  const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
  const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
  const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
  return (newR << 16) | (newG << 8) | newB;
}

// Helper to darken a color by a factor (0-1)
function darkenColor(color, factor) {
  const r = (color >> 16) & 0xFF;
  const g = (color >> 8) & 0xFF;
  const b = color & 0xFF;
  const newR = Math.floor(r * (1 - factor));
  const newG = Math.floor(g * (1 - factor));
  const newB = Math.floor(b * (1 - factor));
  return (newR << 16) | (newG << 8) | newB;
}

// Wing positions for animation: 'up', 'mid', 'down'
export function createRiderSprite(scene, x, y, birdColor, knightColor, key, wingPosition = 'mid') {
  // Create a graphics object to draw the sprite
  const graphics = scene.add.graphics();

  // Center offset - draw everything relative to center of 64x48 texture
  const cx = 32;
  const cy = 24;

  // Bird body (oval shape)
  graphics.fillStyle(birdColor, 1);
  graphics.fillEllipse(cx, cy + 8, 28, 16);

  // Bird head
  graphics.fillEllipse(cx + 12, cy + 2, 12, 10);

  // Beak
  graphics.fillStyle(0xFFA500, 1);
  graphics.fillTriangle(cx + 18, cy + 2, cx + 26, cy, cx + 26, cy + 4);

  // Eye
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(cx + 14, cy, 2);
  graphics.fillStyle(0xFFFFFF, 1);
  graphics.fillCircle(cx + 14, cy - 1, 1);

  // Bird legs
  graphics.fillStyle(0xFFA500, 1);
  graphics.fillRect(cx - 6, cy + 14, 4, 12);
  graphics.fillRect(cx + 2, cy + 14, 4, 12);
  // Feet
  graphics.fillRect(cx - 8, cy + 24, 8, 3);
  graphics.fillRect(cx, cy + 24, 8, 3);

  // Bird tail feathers
  graphics.fillStyle(birdColor, 1);
  graphics.fillTriangle(cx - 14, cy + 6, cx - 26, cy + 2, cx - 14, cy + 14);
  graphics.fillTriangle(cx - 14, cy + 4, cx - 24, cy - 2, cx - 14, cy + 10);

  // Knight body (on top of bird)
  graphics.fillStyle(knightColor, 1);
  graphics.fillRect(cx - 6, cy - 12, 12, 16);

  // Knight head/helmet
  graphics.fillStyle(knightColor, 1);
  graphics.fillCircle(cx, cy - 18, 8);

  // Helmet plume
  graphics.fillStyle(0xFF0000, 1);
  graphics.fillEllipse(cx, cy - 26, 4, 6);

  // Helmet visor
  graphics.fillStyle(0x222222, 1);
  graphics.fillRect(cx - 5, cy - 20, 10, 4);

  // Lance/Weapon
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(cx + 6, cy - 10, 20, 3);
  // Lance tip
  graphics.fillStyle(0xC0C0C0, 1);
  graphics.fillTriangle(cx + 26, cy - 10, cx + 32, cy - 8, cx + 26, cy - 7);

  // Wing - drawn LAST so it appears in front of knight and bird body
  // Lighten the wing color for contrast
  const wingColor = lightenColor(birdColor, 0.3);
  graphics.fillStyle(wingColor, 1);
  if (wingPosition === 'up') {
    // Wing raised high
    graphics.fillEllipse(cx - 2, cy - 6, 18, 12);
    // Wing tip pointing up
    graphics.fillTriangle(cx - 10, cy - 6, cx - 8, cy - 20, cx + 4, cy - 6);
    // Wing edge detail (darker)
    graphics.fillStyle(darkenColor(birdColor, 0.2), 1);
    graphics.fillRect(cx - 8, cy - 5, 14, 2);
  } else if (wingPosition === 'down') {
    // Wing down low
    graphics.fillEllipse(cx - 4, cy + 16, 20, 10);
    // Wing tip pointing down
    graphics.fillTriangle(cx - 14, cy + 16, cx - 10, cy + 28, cx, cy + 16);
    // Wing edge detail (darker)
    graphics.fillStyle(darkenColor(birdColor, 0.2), 1);
    graphics.fillRect(cx - 10, cy + 15, 16, 2);
  } else {
    // Mid position (neutral)
    graphics.fillEllipse(cx - 4, cy + 6, 20, 12);
    // Wing edge detail (darker)
    graphics.fillStyle(darkenColor(birdColor, 0.2), 1);
    graphics.fillRect(cx - 10, cy + 5, 16, 2);
  }

  // Generate texture from graphics
  graphics.generateTexture(key, 64, 48);
  graphics.destroy();

  return key;
}

// Helper to create all animation frames for a rider
export function createRiderAnimationFrames(scene, birdColor, knightColor, baseKey) {
  createRiderSprite(scene, 0, 0, birdColor, knightColor, `${baseKey}_up`, 'up');
  createRiderSprite(scene, 0, 0, birdColor, knightColor, `${baseKey}_mid`, 'mid');
  createRiderSprite(scene, 0, 0, birdColor, knightColor, `${baseKey}_down`, 'down');
  return baseKey;
}

export function createEggSprite(scene) {
  const graphics = scene.add.graphics();

  const cx = 12;
  const cy = 14;

  // Egg shape
  graphics.fillStyle(0xF5F5DC, 1);
  graphics.fillEllipse(cx, cy, 16, 22);

  // Egg highlight
  graphics.fillStyle(0xFFFFFF, 0.3);
  graphics.fillEllipse(cx - 3, cy - 4, 6, 8);

  // Spots
  graphics.fillStyle(0xD4D4AA, 1);
  graphics.fillCircle(cx - 4, cy - 2, 3);
  graphics.fillCircle(cx + 3, cy + 4, 2);
  graphics.fillCircle(cx - 2, cy + 6, 2);

  graphics.generateTexture('egg', 24, 28);
  graphics.destroy();

  return 'egg';
}

export function createPlatformTexture(scene, width, height) {
  const graphics = scene.add.graphics();
  const key = `platform_${width}_${height}`;

  // Base rock layer (dark)
  graphics.fillStyle(0x4A3728, 1);
  graphics.fillRect(0, 0, width, height);

  // Middle dirt layer
  graphics.fillStyle(0x6B4423, 1);
  graphics.fillRect(0, 0, width, height - 6);

  // Top soil layer
  graphics.fillStyle(0x8B5A2B, 1);
  graphics.fillRect(0, 0, width, height - 10);

  // Grass/moss top
  graphics.fillStyle(0x3D5C1F, 1);
  graphics.fillRect(0, 0, width, 4);

  // Grass blades
  graphics.fillStyle(0x4A7023, 1);
  for (let x = 2; x < width - 2; x += 6) {
    const bladeHeight = 2 + Math.floor(Math.random() * 3);
    graphics.fillRect(x, 0, 2, bladeHeight);
  }

  // Rock details on sides
  graphics.fillStyle(0x3D2817, 1);
  // Left edge
  graphics.fillTriangle(0, height, 0, height - 8, 6, height);
  // Right edge
  graphics.fillTriangle(width, height, width, height - 8, width - 6, height);

  // Stone/rock highlights
  graphics.fillStyle(0x7A6452, 1);
  for (let i = 0; i < 4; i++) {
    const rx = 8 + Math.floor(Math.random() * (width - 20));
    const ry = 6 + Math.floor(Math.random() * (height - 14));
    graphics.fillCircle(rx, ry, 3 + Math.floor(Math.random() * 3));
  }

  // Darker cracks/details
  graphics.fillStyle(0x2A1A10, 1);
  graphics.fillRect(width * 0.3, height - 4, 2, 4);
  graphics.fillRect(width * 0.7, height - 6, 2, 6);

  // Bottom rough edge (stalactite-like)
  graphics.fillStyle(0x4A3728, 1);
  for (let x = 4; x < width - 4; x += 8) {
    const dropHeight = 2 + Math.floor(Math.random() * 4);
    graphics.fillTriangle(x, height, x + 4, height, x + 2, height + dropHeight);
  }

  graphics.generateTexture(key, width, height + 6);
  graphics.destroy();

  return key;
}

// Color schemes
export const SPRITE_COLORS = {
  PLAYER: {
    bird: 0xFFD700,    // Gold ostrich
    knight: 0xC0C0C0   // Silver knight
  },
  BOUNDER: {
    bird: 0xAA2222,    // Red buzzard
    knight: 0x881111   // Darker red knight
  },
  HUNTER: {
    bird: 0x808080,    // Gray buzzard
    knight: 0x505050   // Darker gray knight
  },
  SHADOW_LORD: {
    bird: 0x4444DD,    // Blue buzzard
    knight: 0x2222AA   // Darker blue knight
  }
};
