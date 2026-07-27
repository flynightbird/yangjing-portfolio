import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const homeCss = readFileSync(
  path.resolve(process.cwd(), 'components/home/home.module.css'),
  'utf8',
);
const meetingMediaSource = readFileSync(
  path.resolve(process.cwd(), 'components/home/meeting-home-media.tsx'),
  'utf8',
);

describe('Meeting homepage accent', () => {
  it('uses the homepage fluorescent green for the local divider, states, and motion', () => {
    expect(homeCss).toMatch(/\.meetingBand\s*{[^}]*--meeting-accent:\s*#c7ff38;/);
    expect(homeCss).toMatch(/\.meetingBand\s*{[^}]*border-top:\s*6px solid var\(--meeting-accent\);/);
    expect(homeCss).toMatch(/\.meetingStates li\s*{[^}]*color:\s*var\(--meeting-accent\);/);
    expect(meetingMediaSource).toContain("color: 'var(--meeting-accent)'");
    expect(meetingMediaSource).not.toContain("color: '#ff654d'");
  });

  it('preserves the excluded browser controls and media background', () => {
    expect(homeCss).toMatch(/\.meetingBrowserLights i:first-child\s*{\s*background:\s*#ff7269;/);
    expect(homeCss).toMatch(/\.meetingBrowserLights i:nth-child\(2\)\s*{\s*background:\s*#f2bf49;/);
    expect(homeCss).toMatch(/\.meetingBrowserLights i:last-child\s*{\s*background:\s*#63c56f;/);
    expect(homeCss).toMatch(/\.meetingMediaColumn\s*{[^}]*background:\s*#17102d;/);
  });
});
