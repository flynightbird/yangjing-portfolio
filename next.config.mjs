import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-mdx-frontmatter'],
  },
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default withMDX({
  allowedDevOrigins: ['127.0.0.1'],
  basePath,
  output: 'export',
  experimental: { globalNotFound: true },
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
});
