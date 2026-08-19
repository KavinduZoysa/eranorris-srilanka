# Eran Orris Sri Lanka

Website for Eran Orris Sri Lanka villas and experiences.

## TODO

- [ ] Add separate links/references to each villa
- [ ] Redesign the villa card — the image currently takes up too much space
- [ ] Add TripAdvisor profile

## SEO validation

Run the repository's technical and international SEO checks with:

```bash
python3 scripts/validate-seo.py
```

The command exits non-zero for hard failures and reports duplicate titles or meta descriptions as warnings.

The preferred English homepage URL is `/`. If the hosting platform supports redirect rules, configure a real HTTP 301 redirect from `/index.html` to `/`.
