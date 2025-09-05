export default {
  apps: [
    {
      name: 'taskmate-backend',
      script: 'server.js',
      interpreter: 'bash',
      args: "-c 'xvfb-run --auto-servernum node server.js'",
    },
  ],
};
