const scriptPolicy = process.env.NODE_ENV === 'development'
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  scriptPolicy,
  "connect-src 'self'",
  "frame-src 'self' https://flynightbird.github.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

export function SecurityMeta() {
  return (
    <>
      <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </>
  );
}
