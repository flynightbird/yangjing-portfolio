# Yang Jing Bilingual Portfolio

Static bilingual portfolio built with Next.js and MDX. The production registry currently publishes the English and Chinese Call Agent case study.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Evidence assets

Approved public evidence is already stored under `public/images/call-agent/` and `public/files/`. Rebuild it only when the private source captures or redaction instructions change:

```bash
CALL_AGENT_SOURCE_ROOT="/absolute/path/to/source-captures" npm run prepare:assets
```

`CALL_AGENT_SOURCE_ROOT` must be a readable directory. The preparation script rejects sources that resolve outside it and replaces public image output only after every asset passes preflight and processing.

## Verification

```bash
npm run validate:content
npm run lint
npm test
npm run verify:export
npm run test:e2e
```

Run the complete current publication pipeline with:

```bash
npm run verify:publish
```

## PDF

The Call Agent page provides localized controls to view or download the existing approved Chinese PDF at `public/files/call-agent-case-study-zh.pdf`.

## Privacy and evidence boundary

Only files covered by `evidence/call-agent/checksums.json` may be published as Call Agent evidence. Source screenshots never belong in `public/`; the manifest explicitly excludes the capture containing an authorization token.

The public case does not claim scaled business impact, engineering-efficiency gains, or prototype-to-production fidelity metrics. Add comparisons or anonymized engineering feedback only when they can be verified and safely published.
