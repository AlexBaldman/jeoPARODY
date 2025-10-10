module.exports = {
  content: [
    'index.html',
    'src/**/*.js',
  ],
  css: [
    'dist/assets/**/*.css'
  ],
  safelist: [
    /visible/,
    /expanded/,
    /^scoreboard--/,
    /^speech-bubble/,
    /active/,
  ]
};

