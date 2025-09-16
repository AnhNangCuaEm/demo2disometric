# 🎮 2D Isometric Game Development Guide

## 📋 Roadmap & Best Practices

### Phase 1: Foundation Setup

#### 1.1 Tiled Map Editor Integration
```bash
# Download Tiled từ https://www.mapeditor.org/
# Tạo tileset với isometric projection
```

**Tileset Specifications:**
- **Tile Size**: 64x32 pixels (isometric diamond)
- **Grid Type**: Isometric (staggered)
- **Export Format**: JSON (.json)

#### 1.2 Asset Structure
```
public/assets/
├── tilesets/
│   ├── ground.png          # Grass, stone, water
│   ├── buildings.png       # Booth structures
│   ├── decorations.png     # Festival items
│   └── characters.png      # NPCs, players
├── maps/
│   ├── festival_ground.json
│   └── venue_layout.tmx
└── audio/
    ├── bgm/
    └── sfx/
```

### Phase 2: Responsive Design Strategy

#### 2.1 Multi-Resolution Support
```typescript
// Responsive tile sizing based on screen
const getOptimalTileSize = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Base size cho desktop
  if (screenWidth >= 1920) return { width: 64, height: 32 };
  if (screenWidth >= 1366) return { width: 48, height: 24 };
  if (screenWidth >= 768) return { width: 32, height: 16 };
  return { width: 24, height: 12 }; // Mobile
};
```

#### 2.2 Camera & Viewport Management
```typescript
class IsometricScene extends Phaser.Scene {
  private mapLayer: Phaser.Tilemaps.TilemapLayer;
  private camera: Phaser.Cameras.Scene2D.Camera;
  
  create() {
    // Setup camera bounds
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, mapWidth, mapHeight);
    
    // Zoom levels cho different devices
    const zoomLevel = this.getZoomLevel();
    this.camera.setZoom(zoomLevel);
  }
  
  getZoomLevel(): number {
    const { width, height } = this.scale.gameSize;
    const aspectRatio = width / height;
    
    if (width >= 1920) return 1.0;
    if (width >= 1366) return 0.8;
    if (width >= 768) return 0.6;
    return 0.4; // Mobile
  }
}
```

### Phase 3: Booth & Interactive Elements

#### 3.1 Booth System Design
```typescript
interface Booth {
  id: string;
  type: 'food' | 'game' | 'merchandise' | 'performance';
  position: { x: number; y: number };
  size: { width: number; height: number };
  interactive: boolean;
  capacity: number;
  currentVisitors: number;
}

class BoothManager {
  private booths: Map<string, Booth> = new Map();
  
  createBooth(config: Booth) {
    // Tạo booth sprite với isometric perspective
    const booth = this.scene.add.container(config.position.x, config.position.y);
    
    // Base structure
    const base = this.scene.add.image(0, 0, 'booth_base');
    
    // Type-specific decorations
    const decoration = this.scene.add.image(0, -32, `booth_${config.type}`);
    
    // Interactive area
    const interactZone = this.scene.add.zone(0, 0, config.size.width, config.size.height);
    interactZone.setInteractive();
    
    booth.add([base, decoration, interactZone]);
    return booth;
  }
}
```

#### 3.2 Booth Types Implementation

**Food Booths:**
```typescript
class FoodBooth extends Booth {
  private menu: FoodItem[];
  private queue: Player[];
  
  interact(player: Player) {
    // Show menu UI
    this.showMenu();
    // Add to queue
    this.queue.push(player);
  }
}
```

**Game Booths:**
```typescript
class GameBooth extends Booth {
  private gameType: 'ring_toss' | 'goldfish' | 'shooting';
  private prizes: Prize[];
  
  startMiniGame(player: Player) {
    // Launch mini-game scene
    this.scene.scene.launch('MiniGameScene', { 
      gameType: this.gameType,
      player 
    });
  }
}
```

### Phase 4: Advanced Features

#### 4.1 Dynamic Loading System
```typescript
class AssetManager {
  private loadedChunks: Set<string> = new Set();
  
  async loadMapChunk(chunkId: string) {
    if (this.loadedChunks.has(chunkId)) return;
    
    // Load tilemap chunk
    await this.scene.load.tilemapTiledJSON(`chunk_${chunkId}`, 
      `/assets/maps/chunks/${chunkId}.json`);
    
    this.loadedChunks.add(chunkId);
  }
  
  unloadDistantChunks(playerPosition: Vector2) {
    // Unload chunks far from player
  }
}
```

#### 4.2 Performance Optimization
```typescript
class PerformanceManager {
  private cullingBounds: Phaser.Geom.Rectangle;
  
  update() {
    // Cull objects outside viewport
    this.cullObjects();
    
    // LOD system
    this.updateLevelOfDetail();
    
    // Batch sprite updates
    this.batchUpdates();
  }
  
  cullObjects() {
    this.scene.children.list.forEach(obj => {
      const inView = this.cullingBounds.contains(obj.x, obj.y);
      obj.setVisible(inView);
      obj.setActive(inView);
    });
  }
}
```

## 🛠️ Technical Implementation

### Device-Specific Configurations

#### Desktop (1920x1080+)
- Tile Size: 64x32
- Zoom: 1.0
- Render Distance: High
- Particle Effects: Full

#### Tablet (768-1366px)
- Tile Size: 48x24
- Zoom: 0.8
- Render Distance: Medium
- Particle Effects: Reduced

#### Mobile (<768px)
- Tile Size: 32x16
- Zoom: 0.6
- Render Distance: Low
- Particle Effects: Minimal

### Memory Management
```typescript
class MemoryManager {
  private textureCache: Map<string, Phaser.Textures.Texture> = new Map();
  private maxCacheSize: number;
  
  constructor() {
    // Set cache size based on device
    this.maxCacheSize = this.getMaxCacheSize();
  }
  
  getMaxCacheSize(): number {
    const memory = (navigator as any).deviceMemory || 4;
    return memory * 64; // MB
  }
}
```

## 📱 Mobile Optimization

### Touch Controls
```typescript
class TouchControls {
  private joystick: VirtualJoystick;
  private actionButtons: ActionButton[];
  
  setupMobileUI() {
    // Virtual joystick
    this.joystick = new VirtualJoystick({
      x: 100,
      y: this.scene.cameras.main.height - 100,
      radius: 50
    });
    
    // Action buttons
    this.createActionButtons();
  }
}
```

### UI Scaling
```typescript
const getUIScale = () => {
  const dpr = window.devicePixelRatio || 1;
  const baseScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  return Math.max(0.5, Math.min(1.5, baseScale * dpr));
};
```

## 🎨 Art Pipeline

### Tileset Creation
1. **Base Tiles**: Ground textures (grass, stone, water)
2. **Structure Tiles**: Building components
3. **Decoration Tiles**: Festival elements
4. **Animation Tiles**: Water, fire, flags

### Isometric Guidelines
- **Angle**: 30° (2:1 ratio)
- **Lighting**: Consistent top-left light source
- **Shadows**: Soft drop shadows
- **Color Palette**: Cohesive festival theme

## 🚀 Next Steps

1. **Setup Tiled Editor** với isometric template
2. **Create base tileset** 64x32 pixels
3. **Implement tilemap loader** trong Phaser
4. **Add responsive camera system**
5. **Build booth interaction system**
6. **Optimize for multiple devices**

Bạn muốn tôi implement phần nào trước?
