const clips = [
  ['meeting-stage-portrait', 'portrait', '/images/meeting/adaptive-layout-poster.webp'],
  ['meeting-stage-landscape', 'landscape', '/images/meeting/adaptive-layout-poster.webp'],
  ['meeting-whiteboard-portrait', 'portrait', '/images/meeting/whiteboard-multidevice.webp'],
  ['meeting-whiteboard-landscape', 'landscape', '/images/meeting/whiteboard-multidevice.webp'],
  ['meeting-web-transcription', 'landscape', '/images/meeting/whiteboard-multidevice.webp'],
  ['meeting-web-layout', 'landscape', '/images/meeting/device-comparison.webp'],
];

export const canonicalMeetingPublicationAssets = clips.map(
  ([id, orientation, poster]) => ({
    id,
    kind: 'video',
    source: `evidence/meeting/source/${id}.mp4`,
    output: `public/videos/meeting/${id}.mp4`,
    poster,
    orientation,
  }),
);

export function validateMeetingPublicationInventory(assets, { requireReady = false } = {}) {
  const errors = [];
  const canonicalIds = new Set(canonicalMeetingPublicationAssets.map(({ id }) => id));
  const recordsById = new Map();
  for (const asset of assets) {
    const records = recordsById.get(asset?.id) ?? [];
    records.push(asset);
    recordsById.set(asset?.id, records);
  }

  for (const expected of canonicalMeetingPublicationAssets) {
    const records = recordsById.get(expected.id) ?? [];
    if (records.length === 0) {
      errors.push(`Missing canonical Meeting publication asset: ${expected.id}`);
      continue;
    }
    if (records.length > 1) {
      errors.push(`Duplicate canonical Meeting publication asset: ${expected.id}`);
      continue;
    }
    const [asset] = records;
    if (asset.publicationRequired !== true) {
      errors.push(`Canonical Meeting asset must be publicationRequired: ${expected.id}`);
    }
    if (requireReady && asset.readiness !== 'ready') {
      errors.push(`Meeting Product Film record awaiting source inspection: ${expected.id}`);
    }
    for (const field of ['kind', 'source', 'output']) {
      if (asset[field] !== expected[field]) {
        errors.push(`Canonical Meeting asset ${field} mismatch: ${expected.id}`);
      }
    }
    if (expected.kind === 'video') {
      if (asset.poster !== expected.poster) {
        errors.push(`Canonical Meeting asset poster mismatch: ${expected.id}`);
      }
      if (asset.orientation !== expected.orientation) {
        errors.push(`Canonical Meeting asset orientation mismatch: ${expected.id}`);
      }
      if (Object.hasOwn(asset, 'captions')) {
        errors.push(`Canonical Meeting asset must not declare captions: ${expected.id}`);
      }
    }
  }
  for (const asset of assets) {
    if (asset?.publicationRequired === true && !canonicalIds.has(asset.id)) {
      errors.push(`Unexpected Meeting publication asset: ${asset.id ?? '(missing id)'}`);
    }
  }
  return errors;
}
