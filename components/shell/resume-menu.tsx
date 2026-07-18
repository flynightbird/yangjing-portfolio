import { Download } from 'lucide-react';

import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

interface ResumeMenuProps {
  readonly locale: Locale;
}

export function ResumeMenu({ locale }: ResumeMenuProps) {
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;

  return (
    <details>
      <summary>{dictionary.actions.viewResume}</summary>
      <ul>
        <li>
          <a href="/files/yang-jing-resume-en.pdf" download>
            <Download aria-hidden="true" size={18} />
            <span>{dictionary.resume.englishPdf}</span>
          </a>
        </li>
        <li>
          <a href="/files/yang-jing-resume-zh.pdf" download>
            <Download aria-hidden="true" size={18} />
            <span>{dictionary.resume.chinesePdf}</span>
          </a>
        </li>
      </ul>
    </details>
  );
}
