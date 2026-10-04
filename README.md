# ✿ rishu.blog

A cozy, colourful little blog built with [Astro](https://astro.build). Posts are plain Markdown files, so there's no database or CMS to manage.

## quick start

You'll need [Node.js](https://nodejs.org) 22.12 or newer.

```sh
npm install      # once, to grab the dependencies
npm run dev      # start a local server at http://localhost:4321
npm run build    # build the finished site into dist/
npm run preview  # preview the built site locally
```

## writing a post

Add a `.md` file to `src/content/blog/`. The file name becomes the URL, so `my-trip.md` turns into `/blog/my-trip/`.

Every post starts with a small settings block:

```yaml
---
title: 'my trip to the seaside'
description: 'a one-line summary that shows on the cards'
pubDate: 2026-10-04
emoji: '🌊'          # shown in the circle on the card (default 🌸)
color: sky           # pink, peach, lemon, mint, sky or lilac (default pink)
tags: ['travel', 'life']
draft: true          # optional: drafts only show up in `npm run dev`
---
```

The **a little markdown cheat sheet** post shows how every kind of formatting looks.

## what's where

```
src/
├── consts.ts              ← site name, description, nav links, social links
├── content.config.ts      ← the settings each post is allowed to have
├── content/blog/          ← ✏️ your posts live here
├── styles/global.css      ← colours, fonts, and post typography
├── components/            ← header, footer, post cards, logo, avatar, doodles
├── layouts/               ← page shell + the blog post layout
└── pages/
    ├── index.astro        ← home page
    ├── about.astro        ← about page (fill in the "quick facts"!)
    ├── blog/              ← post list + individual posts
    ├── tags/              ← tag list + one page per tag
    ├── 404.astro          ← "page not found"
    └── rss.xml.ts         ← RSS feed at /rss.xml
public/                    ← favicon, robots.txt, and any images you add
```

## making it yours

- [ ] Fill in your intro on the home page (`src/pages/index.astro`)
- [ ] Write your about page and quick facts (`src/pages/about.astro`)
- [ ] Swap the placeholder social links (`src/consts.ts`)
- [ ] Replace the blob avatar with a photo if you like (`src/components/Avatar.astro`)
- [ ] Delete the sample posts in `src/content/blog/` and write your own
- [ ] Tweak the colours in `:root` at the top of `src/styles/global.css`

## also included

- An RSS feed at `/rss.xml` and a sitemap at `/sitemap-index.xml`
- Tag pages generated automatically from your posts' `tags`
- Layouts that work on phones and desktops
- Animations that switch off for people who've asked their device to reduce motion

## publishing

`npm run build` outputs a plain static site in `dist/`, so it can go on any static host, such as Netlify, Vercel, Cloudflare Pages or GitHub Pages. Point the `rishu.blog` domain at whichever one you pick.

## moving this to its own repo

This lives on the `rishu-blog` branch for now. The branch has its own separate history, so when you're ready for a dedicated repo:

```sh
git push git@github.com:<you>/rishu.blog.git rishu-blog:main
```
