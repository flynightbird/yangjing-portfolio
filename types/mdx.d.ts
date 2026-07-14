declare module '*.md' {
  const MDXComponent: import('react').ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module '*.mdx' {
  const MDXComponent: import('react').ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
