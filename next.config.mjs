import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-mdx-frontmatter'],
  },
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default withMDX({
  basePath,
  output: 'export',
  experimental: { globalNotFound: true },
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
});
