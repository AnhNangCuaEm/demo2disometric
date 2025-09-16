'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

class VenueScene extends Phaser.Scene {
  private socket: Socket | null = null;
  private players: Map<string, Phaser.GameObjects.Container> = new Map();
  private currentPlayer: Player | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  constructor() {
    super({ key: 'VenueScene' });
  }

  preload() {
    // Create simple colored rectangles as tiles
    this.load.image('tile1', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#8B4513"/>
      </svg>
    `));
    
    this.load.image('tile2', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#90EE90"/>
      </svg>
    `));
    
    this.load.image('tile3', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#228B22"/>
      </svg>
    `));

    // Load avatar
    this.load.image('avatar', '/avatar.svg');
  }

  create() {
    // Create map background
    this.createMap();
    
    // Initialize input
    this.cursors = this.input.keyboard?.createCursorKeys() || null;
    
    // Initialize socket connection
    this.initSocket();
    
  }

  createMap() {
    const tileSize = 32;
    // Scale map based on screen size
    const mapWidth = Math.ceil(this.cameras.main.width / tileSize) + 2;
    const mapHeight = Math.ceil(this.cameras.main.height / tileSize) + 2;
    
    // Create a simple map pattern
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        let tileType = 'tile2'; // Default green
        
        // Border tiles
        if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
          tileType = 'tile1'; // Brown border
        }
        // Inner pattern
        else if (x > 2 && x < mapWidth - 3 && y > 2 && y < mapHeight - 3) {
          tileType = 'tile3'; // Dark green center
        }
        
        this.add.image(x * tileSize + tileSize/2, y * tileSize + tileSize/2, tileType);
      }
    }
    
    // Add festival decorations - centered on screen
    const centerX = this.cameras.main.width / 2;
    this.add.text(centerX, 50, '🎎 Japonism Festival', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.add.text(centerX, this.cameras.main.height - 50, 'Click to move or use arrow keys', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  initSocket() {
    // Get the current host and construct server URL
    const getServerUrl = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If accessing via IP, use that IP for server connection
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          return `http://${hostname}:3001`;
        }
      }
      return 'http://localhost:3001';
    };

    const serverUrl = getServerUrl();
    console.log('Venue connecting to server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    // Mark this connection as viewer only (not a player)
    this.socket.on('connect', () => {
      console.log('Venue connected to server successfully as viewer');
      // Tell server this is a viewer, not a player
      this.socket?.emit('setRole', 'viewer');
    });

    this.socket.on('playerData', (player: Player) => {
      this.currentPlayer = player;
      console.log('Received player data:', player);
    });

    this.socket.on('players', (playersData: Record<string, Player>) => {
      this.updatePlayers(playersData);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  updatePlayers(playersData: Record<string, Player>) {
    // Remove players that are no longer connected
    this.players.forEach((playerSprite, playerId) => {
      if (!playersData[playerId]) {
        playerSprite.destroy();
        this.players.delete(playerId);
      }
    });

    // Update or create player sprites
    Object.entries(playersData).forEach(([socketId, player]) => {
      let playerContainer = this.players.get(socketId);
      
      if (!playerContainer) {
        // Create new player
        playerContainer = this.add.container(player.x, player.y);
        
        // Avatar sprite
        const avatar = this.add.image(0, 0, 'avatar').setScale(1);
        avatar.setTint(parseInt(player.color.replace('#', ''), 16) || 0xffffff);
        
        // Name label
        const nameText = this.add.text(0, -25, player.name, {
          fontSize: '12px',
          color: '#000000',
          backgroundColor: '#ffffff',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        playerContainer.add([avatar, nameText]);
        this.players.set(socketId, playerContainer);
      } else {
        // Update position
        playerContainer.setPosition(player.x, player.y);
      }
    });
  }


  update() {
    if (this.cursors && this.socket && this.currentPlayer) {
      if (this.cursors.left?.isDown) {
        this.socket.emit('move', { direction: 'left' });
      } else if (this.cursors.right?.isDown) {
        this.socket.emit('move', { direction: 'right' });
      }
      
      if (this.cursors.up?.isDown) {
        this.socket.emit('move', { direction: 'up' });
      } else if (this.cursors.down?.isDown) {
        this.socket.emit('move', { direction: 'down' });
      }
    }
  }

  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default function VenuePage() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'phaser-game',
        backgroundColor: '#87CEEB',
        scene: VenueScene,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);

      // Handle window resize
      const handleResize = () => {
        if (gameRef.current) {
          gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Get the current host and construct server URL
    const getServerUrl = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If accessing via IP, use that IP for server connection
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          return `http://${hostname}:3001`;
        }
      }
      return 'http://localhost:3001';
    };

    const serverUrl = getServerUrl();
    console.log('Venue connecting to server:', serverUrl);

    const newSocket = io(serverUrl, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
    });

    newSocket.on('playerData', (player: Player) => {
      // Handle player data
    });

    newSocket.on('players', (playersData: Record<string, Player>) => {
      // Handle players data
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      <Link href="/" className="home-button" title="Go to Home">
        🏠
      </Link>

      <div className="game-container-fullscreen">
        <div id="phaser-game" style={{ width: '100%', height: '100%' }} />
      </div>
    </>
  );
}
