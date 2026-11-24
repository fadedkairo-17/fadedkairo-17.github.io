# Portfolio

A static site: no build step, no dependencies. Open `index.html` or host it on GitHub Pages.

## Edit

Everything you are likely to change is in `config.js`:

- `name`, `handle`, `github`: shown in the header, hero, contact section and footer.
- `contact`: the link the Contact row opens. Rows left as `""` are hidden.
- `untitled.site`: adds a "Visit the site" link under Untitled.
- `combo.download`, `combo.discord`: add the two buttons under Combo Client.
- `combo.lead`: the large image at the top of the Combo Client section. A `.gif` works.
- `combo.gallery`: one line per screenshot. Put the file in `assets/combo/` and add an entry.

Text lives in `index.html`. Colours and type are the variables at the top of `style.css`.

The night sea behind the hero is drawn by `sea.js` on a canvas. The numbers at the top of
that file set how many rows of swell there are, how fast they roll in and how long a tide
takes. The moon is plain CSS (`.moon-disc`, `.moon-glow` in `style.css`).

## Publish on GitHub Pages

1. Create a public repository named `<your-username>.github.io`.
2. Push these files to the `main` branch, with `index.html` at the root.
3. In the repository, open Settings → Pages and set the source to the `main` branch, root folder.

The site is then served at `https://<your-username>.github.io`.
