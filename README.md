# Yangjing Portfolio · Call Agent

Responsive Chinese case study for Agora Call Agent V1.0. The page is designed for browser reading and A4 PDF export.

## Local review

```bash
npm install
npm run assets
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Verification

```bash
npm test
npm run validate
npm run test:e2e
npm run build
```

## PDF export

Open the production preview, select `导出 PDF`, choose A4 portrait, enable background graphics, use 100% scale, and save the PDF.

## Privacy

Only processed files from `public/images/` may be deployed. Never place source screenshots directly in `public/`. The source screenshot containing an authorization token is explicitly excluded from `assets/manifest.json`.

## Evidence boundary

The public version does not claim scaled business impact, engineering-efficiency gains, or prototype-to-production fidelity metrics. Add design/prototype comparisons or anonymized engineering feedback only when those materials can be verified and safely published.
