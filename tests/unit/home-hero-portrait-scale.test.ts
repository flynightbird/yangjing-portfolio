import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const homeStyles = fs.readFileSync(
  path.join(process.cwd(), 'components/home/home.module.css'),
  'utf8',
);

describe('home hero portrait scale', () => {
  it('renders the shared desktop and mobile portraits at 80% of their previous size', () => {
    expect(homeStyles).toMatch(/\.heroPortrait\s*{[^}]*width:\s*min\(39\.6vw,\s*33\.75rem\)/s);
    expect(homeStyles).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*?\.heroPortrait\s*{[^}]*width:\s*min\(104\.4vw,\s*27\.36rem\)/,
    );
  });
});
