import stylelint from 'stylelint';

const escapeData = value => String(value)
  .replaceAll('%', '%25')
  .replaceAll('\r', '%0D')
  .replaceAll('\n', '%0A');

const escapeProperty = value => escapeData(value)
  .replaceAll(':', '%3A')
  .replaceAll(',', '%2C');

const result = await stylelint.lint({ files: ['src/**/*.css'] });
let errorCount = 0;
let warningCount = 0;

for (const file of result.results) {
  for (const warning of file.warnings) {
    const level = warning.severity === 'error' ? 'error' : 'warning';
    if (level === 'error') errorCount += 1;
    else warningCount += 1;

    const properties = [
      `file=${escapeProperty(file.source)}`,
      warning.line ? `line=${warning.line}` : null,
      warning.column ? `col=${warning.column}` : null,
      warning.rule ? `title=${escapeProperty(`stylelint ${warning.rule}`)}` : null
    ].filter(Boolean).join(',');

    console.log(`::${level} ${properties}::${escapeData(warning.text)}`);
  }
}

console.log(`Stylelint: ${errorCount} error(s), ${warningCount} warning(s).`);
process.exitCode = result.errored ? 2 : 0;
