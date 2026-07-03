module.exports = {
  apps: [
    {
      name: 'busqr-backend',
      cwd: './backend',
      script: 'server.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M'
    },
    {
      name: 'busqr-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: { NODE_ENV: 'production' },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M'
    }
  ]
};
