import { siSpotify, siApplemusic } from 'simple-icons';
import { writeFileSync } from 'node:fs';
const marks = {
  spotify: { path: siSpotify.path, color: '#' + siSpotify.hex, source: siSpotify.source },
  apple: { path: siApplemusic.path, color: '#' + siApplemusic.hex, source: siApplemusic.source },
};
writeFileSync('src/design/provider-marks.ts', '// Provider vector paths from Simple Icons, linked to official identity guidelines.\nexport const providerMarks = ' + JSON.stringify(marks, null, 2) + ' as const;\n');
