// ✿ Site-wide settings. Change these and the whole site follows along.

export const SITE = {
  title: 'rishu.blog',
  description: 'a cozy, colourful little corner of the internet ✿',
  author: 'Rishu',
  url: 'https://rishu.blog',
};

// The six candy colours used across the site (defined in src/styles/global.css).
export const COLORS = ['pink', 'peach', 'lemon', 'mint', 'sky', 'lilac'] as const;
export type Color = (typeof COLORS)[number];

export const NAV_LINKS: { href: string; label: string; color: Color }[] = [
  { href: '/', label: 'home', color: 'pink' },
  { href: '/blog/', label: 'blog', color: 'sky' },
  { href: '/tags/', label: 'tags', color: 'mint' },
  { href: '/about/', label: 'about', color: 'lemon' },
];

// TODO: swap these placeholders for your real links.
export const SOCIALS: { label: string; href: string; emoji: string; color: Color }[] = [
  { label: 'email', href: 'mailto:hello@rishu.blog', emoji: '💌', color: 'pink' },
  { label: 'instagram', href: '#', emoji: '📸', color: 'peach' },
  { label: 'github', href: '#', emoji: '🐙', color: 'lilac' },
];
