/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  trailingSlash: false,
  
  // Configure for Phaser 3 and Socket.io
  webpack: (config) => {
    // Externals for socket.io
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // Resolve for Phaser 3
    config.resolve.alias = {
      ...config.resolve.alias,
      phaser: 'phaser/dist/phaser.min.js'
    };
    
    return config;
  },
  
  // Disable image optimization for simplicity  
  images: {
    unoptimized: true
  },
  
  // Headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
