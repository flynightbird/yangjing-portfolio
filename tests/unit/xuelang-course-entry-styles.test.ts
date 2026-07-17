import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const styles = fs.readFileSync(
  path.join(process.cwd(), 'components/xuelang/xuelang-course-entry.module.css'),
  'utf8',
);

describe('Xuelang Course Entry print styles', () => {
  it('preserves the full mobile screens in print', () => {
    const printStyles = styles.slice(styles.indexOf('@media print'));

    expect(printStyles).toMatch(
      /\.printGrid img\s*\{[\s\S]*?object-fit:\s*contain\s*!important;/,
    );
  });
});
