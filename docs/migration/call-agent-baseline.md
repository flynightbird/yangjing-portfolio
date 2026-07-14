# Call Agent Migration Baseline

This document records the immutable Call Agent case-study baseline before the Next.js migration.

## Source Commit

`75b47fc00489d56f2ead1f4b755811d480374d55`

## Chapter IDs

The source page contains these eight chapter IDs, in document order:

1. `overview`
2. `context-role`
3. `design-thesis`
4. `decision-path`
5. `decision-preview`
6. `decision-operate`
7. `system-delivery`
8. `outcome-learnings`

## Processed Images

| File | SHA-256 |
| --- | --- |
| `public/images/after-call-history-filters.png` | `7925ccd1dcb95645f1164d875700798b0d4021b6d1544bc3e8f15b87fdd11466` |
| `public/images/after-resource-management.png` | `8ebd00de296362f0c48b3bd47ae1245bb5f20f7c8808a270b2d9397e6e02b85f` |
| `public/images/ai-preview-live.png` | `ab1676c09e8ae997c9b9963c17b65d86ed850e6944b42d7b1513a69e6f7d78fc` |
| `public/images/before-call-history.png` | `cfd882f8b268b9c9b3ed09936a7215318d000a4c1ecca8f8472c2a7a65f5e285` |
| `public/images/before-resource-management.jpg` | `b08a0f770d1272b776e84b0580489b067d6a381d4dcf6b5ae039b402ff6879b1` |
| `public/images/outbound-task-creation.png` | `ad2460f796027c168635cbd9bc095b535ba01e0dab573ff5125748befb356c8d` |
| `public/images/product-switcher.png` | `fbad19d8fb06a40de9e5ebadeb1ac672ef6cb87896bf36dd9ce98f18cddbe92a` |

## Case-Study PDF

| File | SHA-256 |
| --- | --- |
| `portfolio/call-agent-case-study.pdf` | `a46c9fb22780c5241e9edd1cd3c74b30f797b84a72700619214094a98b1f8aeb` |

The checksums above were generated with:

```sh
shasum -a 256 portfolio/call-agent-case-study.pdf public/images/*
```

## Baseline Verification

The baseline was verified with these exact commands:

```sh
npm test
npm run validate
npm run build
npm run test:e2e
```

Recorded results at the source commit:

- `npm test`: 2 tests passed.
- `npm run validate`: content validation passed.
- `npm run build`: production build completed successfully.
- `npm run test:e2e`: 18 tests passed and 3 conditional tests were skipped.
