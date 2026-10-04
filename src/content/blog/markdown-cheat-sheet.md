---
title: 'a little markdown cheat sheet'
description: 'how to write a post here, plus a peek at how every kind of formatting looks.'
pubDate: 2026-10-03
emoji: '📝'
color: sky
tags: ['writing', 'meta']
---

Every post on this blog is a Markdown file in `src/content/blog/`. Make a new `.md` file there, start it with a little block of settings (the "frontmatter"), then write!

## the settings block

```yaml
---
title: 'my new post'
description: 'a one-line summary that shows on the cards'
pubDate: 2026-10-03
emoji: '🍰'        # shows in the circle on the card
color: peach       # pink, peach, lemon, mint, sky or lilac
tags: ['life', 'food']
draft: false       # true = only visible while running npm run dev
---
```

The file name becomes the link, so `my-new-post.md` lives at `/blog/my-new-post/`.

## text styles

You can write **bold**, *italic*, ~~strikethrough~~, `inline code`, and [links](https://rishu.blog).

### lists

- bullet points get little flowers
- like this one
  - and they can nest

1. numbered lists
2. work too

### quotes

> This is a quote. It gets its own lilac bubble.

### tables

| snack | rating |
| ----- | ------ |
| mango | 10/10  |
| toast | 8/10   |

### code

```js
function sayHi(name) {
  return `hi, ${name}! ✿`;
}
```

### images

Put the picture in the `public/` folder, then write `![a description of the picture](/my-photo.jpg)`.

### a squiggly divider

Three dashes on their own line:

---

And that's everything!
