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
    /open/,
    /^scoreboard--/,
    /^speech-bubble/,
    /active/,
    /^clue-modal/,
    /^run-category-screen/,
    /^pao-screen/,
  ]
};

