#!/usr/bin/env python3
"""Validate the static site's core technical and international SEO signals."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://eranorrissrilanka.com"
LANGS = {"en", "de", "ru"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.titles: list[str] = []
        self.canonicals: list[str] = []
        self.descriptions: list[str] = []
        self.hreflangs: dict[str, list[str]] = {}
        self.h1_count = 0
        self.jsonld: list[str] = []
        self.internal_index_links: list[str] = []
        self.villa_cards = 0
        self._capture: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        if tag == "title":
            self._capture, self._buffer = "title", []
        elif tag == "script" and attrs.get("type") == "application/ld+json":
            self._capture, self._buffer = "jsonld", []
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        elif tag == "link" and attrs.get("rel") == "alternate" and attrs.get("hreflang"):
            self.hreflangs.setdefault(attrs["hreflang"], []).append(attrs.get("href", ""))
        elif tag == "meta" and attrs.get("name", "").lower() == "description":
            self.descriptions.append(attrs.get("content", "").strip())
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "a" and attrs.get("href") == "index.html":
            self.internal_index_links.append("index.html")
        if tag == "div" and "villa-card-full" in (attrs.get("class") or "").split():
            self.villa_cards += 1

    def handle_endtag(self, tag: str) -> None:
        if (tag == "title" and self._capture == "title") or (tag == "script" and self._capture == "jsonld"):
            value = "".join(self._buffer).strip()
            (self.titles if self._capture == "title" else self.jsonld).append(value)
            self._capture, self._buffer = None, []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)


def local_path(url: str) -> Path | None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "eranorrissrilanka.com":
        return None
    return ROOT / ("index.html" if parsed.path in ("", "/") else parsed.path.lstrip("/"))


def objects(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from objects(child)


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages: dict[Path, PageParser] = {}
    canon_to_page: dict[str, Path] = {}
    title_counts: Counter[str] = Counter()
    description_counts: Counter[str] = Counter()

    for path in sorted(ROOT.glob("*.html")):
        if path.name.startswith("yandex_"):
            continue
        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        pages[path] = parser
        label = path.name
        if len(parser.titles) != 1 or not parser.titles[0]:
            errors.append(f"{label}: expected one non-empty title, found {len(parser.titles)}")
        else:
            title_counts[parser.titles[0]] += 1
        if len(parser.canonicals) != 1:
            errors.append(f"{label}: expected one canonical, found {len(parser.canonicals)}")
        else:
            canonical = parser.canonicals[0]
            if local_path(canonical) is None:
                errors.append(f"{label}: invalid canonical {canonical!r}")
            elif canonical in canon_to_page:
                errors.append(f"{label}: canonical duplicates {canon_to_page[canonical].name}: {canonical}")
            canon_to_page[canonical] = path
        if len(parser.descriptions) != 1 or not parser.descriptions[0]:
            errors.append(f"{label}: expected one non-empty meta description")
        else:
            description_counts[parser.descriptions[0]] += 1
        if parser.h1_count != 1:
            errors.append(f"{label}: expected one H1, found {parser.h1_count}")
        if parser.internal_index_links:
            errors.append(f"{label}: contains href=\"index.html\"")
        for raw in parser.jsonld:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError as exc:
                errors.append(f"{label}: invalid JSON-LD: {exc}")
                continue
            for obj in objects(data):
                if obj.get("@type") == "ItemList" and label.startswith("villas"):
                    count = len(obj.get("itemListElement", []))
                    if count != parser.villa_cards:
                        errors.append(f"{label}: ItemList has {count} items but page has {parser.villa_cards} villa cards")
                if obj.get("@type") == "FAQPage":
                    text = json.dumps(obj, ensure_ascii=False)
                    if re.search(r"Both villas|Beide Villen|обеих виллах", text, re.I):
                        errors.append(f"{label}: FAQ schema contains stale two-villa wording")

    for value, count in title_counts.items():
        if count > 1:
            warnings.append(f"duplicate title ({count} pages): {value}")
    for value, count in description_counts.items():
        if count > 1:
            warnings.append(f"duplicate meta description ({count} pages): {value}")

    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = [node.text.strip() for node in sitemap.findall("s:url/s:loc", ns) if node.text]
    for node in sitemap.findall("s:url", ns):
        loc = node.findtext("s:loc", default="(missing URL)", namespaces=ns).strip()
        lastmod = node.findtext("s:lastmod", default="", namespaces=ns).strip()
        if lastmod:
            try:
                date.fromisoformat(lastmod)
            except ValueError:
                errors.append(f"sitemap.xml: invalid ISO lastmod for {loc}: {lastmod}")
    if len(sitemap_urls) != len(set(sitemap_urls)):
        errors.append("sitemap.xml: duplicate URLs")
    sitemap_set = set(sitemap_urls)
    for url in sitemap_urls:
        target = local_path(url)
        if target is None or not target.exists():
            errors.append(f"sitemap.xml: URL has no local page: {url}")
        if url not in canon_to_page:
            errors.append(f"sitemap.xml: URL is not a page canonical: {url}")
    for canonical in canon_to_page:
        if canonical not in sitemap_set:
            errors.append(f"sitemap.xml: missing canonical page: {canonical}")

    for path, parser in pages.items():
        required = LANGS | {"x-default"}
        if set(parser.hreflangs) != required:
            errors.append(f"{path.name}: hreflang set is {sorted(parser.hreflangs)}, expected {sorted(required)}")
        for lang, urls in parser.hreflangs.items():
            if len(urls) != 1:
                errors.append(f"{path.name}: expected one {lang} hreflang, found {len(urls)}")
                continue
            target = local_path(urls[0])
            if target is None or not target.exists() or urls[0] not in sitemap_set:
                errors.append(f"{path.name}: invalid or unsitemapped {lang} hreflang target {urls[0]}")
                continue
            target_parser = pages.get(target)
            own_canonical = parser.canonicals[0] if len(parser.canonicals) == 1 else ""
            reciprocal = target_parser and own_canonical in sum(target_parser.hreflangs.values(), [])
            if lang != "x-default" and not reciprocal:
                errors.append(f"{path.name}: {lang} hreflang target is not reciprocal")

    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")
    print(f"Checked {len(pages)} HTML pages and {len(sitemap_urls)} sitemap URLs: "
          f"{len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
