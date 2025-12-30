# Game Design Document: Joust Clone

## 1. Overview

### 1.1 Concept
A faithful recreation of the 1982 Williams Electronics arcade game Joust. Players control a knight riding a flying ostrich, battling enemy knights on buzzards through flapping-based flight mechanics.

### 1.2 Target Platform
- Web browsers (desktop)
- Minimum resolution: 800x600
- Target resolution: 1280x720 (scales to fit)

### 1.3 Scope
Minimum Viable Product (MVP) - single player, core mechanics, 5+ waves

---

## 2. Gameplay

### 2.1 Core Loop
1. Wave starts → enemies spawn
2. Player defeats enemies by colliding from above
3. Defeated enemies drop eggs → collect before they hatch
4. All enemies defeated → next wave begins
5. Player loses all lives → game over → high score check

### 2.2 Controls
| Action | Key |
|--------|-----|
| Flap (gain altitude) | Spacebar or W |
| Move left | A or Left Arrow |
| Move right | D or Right Arrow |

### 2.3 Win/Lose Conditions
- **Wave complete:** All enemies defeated
- **Life lost:** Collision with enemy from below/side, falling in lava, grabbed by lava hand
- **Game over:** All lives lost (start with 3 lives)
- **Extra life:** Every 20,000 points

---

## 3. Player Character

### 3.1 The Knight (on Ostrich)
- **Sprite:** Knight in armor riding yellow ostrich
- **Size:** ~32x32 pixels
- **Animation states:**
  - Idle (standing on platform)
  - Flying (wings up/down cycle)
  - Walking (when moving on platform)

### 3.2 Physics
```
Gravity: 600 pixels/sec²
Flap impulse: -250 pixels/sec (upward velocity)
Max fall speed: 400 pixels/sec
Horizontal speed: 200 pixels/sec
Horizontal drag: 50 (slight momentum)
```

### 3.3 Screen Wrap
Player wraps horizontally - exiting left side appears on right side (and vice versa)

---

## 4. Enemies

### 4.1 Enemy Types

| Type | Color | Speed | Behavior | Points |
|------|-------|-------|----------|--------|
| Bounder | Red | Slow | Wanders, rarely flies high | 500 |
| Hunter | Gray | Medium | Actively pursues player | 750 |
| Shadow Lord | Blue | Fast | Aggressive, hard to hit | 1000 |

### 4.2 Enemy AI
- **Patrol:** Move toward random platform, flap to reach it
- **Chase (Hunter/Shadow Lord):** Move toward player position
- **Avoidance:** Attempt to position higher than player when close

### 4.3 Spawning
- Enemies spawn from spawn points at top of screen
- Wave 1: 3 Bounders
- Wave 2: 4 Bounders, 1 Hunter
- Wave 3+: Increase count and difficulty mix

---

## 5. Eggs

### 5.1 Behavior
1. Enemy defeated → egg drops with small bounce
2. Egg sits on platform for 5 seconds
3. If not collected → egg hatches into same enemy type
4. Hatched enemy is one tier higher (Bounder → Hunter)

### 5.2 Scoring
- Collect egg: 250 points
- Let egg hatch: 0 points, harder enemy spawns

---

## 6. Environment

### 6.1 Platforms
- 5-7 stone platforms at various heights
- Player and enemies can land and walk on platforms
- Platforms do NOT wrap (unlike player/enemies)

### 6.2 Lava Pit
- Bottom of screen is lava
- Instant death if player falls in
- **Lava Hand:** Periodically rises up and grabs nearby players/enemies
  - Warning: bubbles appear before hand emerges
  - Hand active for 2 seconds, then recedes

### 6.3 Screen Layout (ASCII representation)
```
┌────────────────────────────────────────┐
│    [spawn]         [spawn]    [spawn]  │
│                                        │
│   ████████              ████████       │
│                                        │
│        ████████████████                │
│                                        │
│   ██████                    ██████     │
│                                        │
│            ██████████                  │
│                                        │
│~~~~~~~~~~~~~ LAVA ~~~~~~~~~~~~~~~~~~~~~│
└────────────────────────────────────────┘
```

---

## 7. Collision System

### 7.1 Combat Resolution
When player collides with enemy:

```
if (player.y + player.height/2 < enemy.y + enemy.height/2)
    → Player wins (player center is higher)
    → Enemy dies, drops egg
    → 500-1000 points based on enemy type
else if (player.y + player.height/2 > enemy.y + enemy.height/2)
    → Enemy wins (enemy center is higher)
    → Player loses life
else
    → Tie: both bounce away, no damage
```

### 7.2 Platform Collision
- Standard platformer physics
- Land on top: stop falling, can walk
- Hit from side: blocked
- Hit from below: blocked (can't pass through)

---

## 8. Visual Effects (MVP)

### 8.1 Screen Shake
- **Trigger:** Player death, enemy collision
- **Intensity:** 5-10 pixels displacement
- **Duration:** 200ms
- **Style:** Decreasing sine wave

### 8.2 Particle Effects
- **Feathers:** Burst of 5-10 particles on any collision
  - Colors: white, gray, brown
  - Fade out over 500ms
- **Lava sparks:** Continuous small orange/red particles rising from lava
- **Egg crack:** Small shell particles when egg hatches

---

## 9. Audio

### 9.1 Sound Effects
| Event | Sound Description |
|-------|-------------------|
| Flap | Quick whoosh/wing flap |
| Enemy defeat | Thud + squawk |
| Player death | Dramatic descending tone |
| Egg drop | Light thunk |
| Egg hatch | Crack + chirp |
| Egg collect | Positive chime |
| Lava bubble | Gurgling |
| Lava hand | Dramatic rising sound |
| Wave complete | Triumphant jingle |

### 9.2 Music
- No background music (authentic to original)
- OR: Optional retro chiptune loop (toggle in menu)

---

## 10. UI/Menus

### 10.1 Title Screen
```
        JOUST

   [START GAME]

   HIGH SCORE: 12500

   Controls: Arrow keys + Space
```

### 10.2 Game HUD
```
SCORE: 00000    WAVE: 1    LIVES: ♦ ♦ ♦
```

### 10.3 Game Over Screen
```
      GAME OVER

   SCORE: 15750
   HIGH SCORE: 15750
   NEW HIGH SCORE!

   [PLAY AGAIN]
```

---

## 11. Scoring

| Action | Points |
|--------|--------|
| Defeat Bounder | 500 |
| Defeat Hunter | 750 |
| Defeat Shadow Lord | 1000 |
| Collect egg | 250 |
| Complete wave (survival bonus) | 1000 × wave number |

**Extra life:** Every 20,000 points

---

## 12. Color Palette

Authentic arcade colors:

| Element | Color (Hex) |
|---------|-------------|
| Background | #000000 (black) |
| Platforms | #8B4513 (saddle brown) |
| Player ostrich | #FFD700 (gold) |
| Player knight | #C0C0C0 (silver) |
| Bounder buzzard | #8B0000 (dark red) |
| Hunter buzzard | #696969 (dim gray) |
| Shadow Lord | #4169E1 (royal blue) |
| Lava | #FF4500 (orange red) |
| Eggs | #F5F5DC (beige) |
| UI text | #FFFFFF (white) |

---

## 13. Technical Notes

### 13.1 Performance Targets
- 60 FPS on modern browsers
- Max 20 active entities (players + enemies + eggs)
- Efficient particle pooling (reuse particle objects)

### 13.2 Local Storage
```javascript
// High score persistence
localStorage.setItem('joust_highscore', score);
localStorage.getItem('joust_highscore');
```

### 13.3 Responsive Scaling
- Game renders at 800x600 logical pixels
- Scales to fit browser window (maintain aspect ratio)
- Center with black letterboxing if needed

---

## 14. Development Phases

### Phase 1: Foundation
- [ ] Project setup (Phaser + Vite)
- [ ] Basic scene structure (Menu, Game, GameOver)
- [ ] Player movement and flapping physics
- [ ] Platform collisions

### Phase 2: Combat
- [ ] Enemy spawning and basic AI
- [ ] Collision detection (height-based combat)
- [ ] Egg drop and collection
- [ ] Life system

### Phase 3: Environment
- [ ] Lava pit (instant death)
- [ ] Lava hand hazard
- [ ] Screen wrap

### Phase 4: Polish
- [ ] All sound effects
- [ ] Particle effects
- [ ] Screen shake
- [ ] Score and high score system
- [ ] Wave progression

### Phase 5: Release
- [ ] Title screen and game over
- [ ] Final balance tuning
- [ ] GitHub Pages deployment

---

## 15. Reference Material

- Original Joust gameplay videos for timing and feel
- Phaser 3 arcade physics documentation
- Arcade sprite style guides (16-32px characters)
