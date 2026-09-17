#!/usr/bin/env python3
"""Monta o index.html (arquivo único) a partir de src/shell.html + chapters/*.html.

Uso: python3 build.py
- numera cada caixa de gatilho (data-tid) pra estrela de "Meus gatilhos" funcionar
- gera o kit de bolso (todos os gatilhos) e o capítulo de tabelas
- calcula tempo de leitura
- carimba a versão do cache no sw.js
"""
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
CH = ROOT / "chapters"
WPM = 180  # leitura com pausa pra tabela e caixa

book = json.loads((SRC / "book.json").read_text(encoding="utf-8"))
shell = (SRC / "shell.html").read_text(encoding="utf-8")

TRIGGER_RE = re.compile(r'<div class="box trigger">(.*?)</div>', re.S)
TABLE_RE = re.compile(r'<div class="table-wrap">.*?</div>', re.S)
TAG_RE = re.compile(r"<[^>]+>")


def words(html: str) -> int:
    return len(TAG_RE.sub(" ", html).split())


bodies, triggers, tables = {}, {}, {}
for c in book["chapters"]:
    path = CH / c["file"]
    html = path.read_text(encoding="utf-8").strip() if path.exists() else ""
    if "—" in html or "–" in html:
        raise SystemExit(f"travessão encontrado em {c['file']}")
    n = 0

    def tag(m, cid=c["id"]):
        global n
        n += 1
        tid = f"{cid}-{n}"
        triggers.setdefault(cid, []).append((tid, m.group(1)))
        return f'<div class="box trigger" data-tid="{tid}">{m.group(1)}</div>'

    html = TRIGGER_RE.sub(tag, html)
    tables[c["id"]] = TABLE_RE.findall(html)
    bodies[c["id"]] = html

by_id = {c["id"]: c for c in book["chapters"]}
generated = {"16", "17"}


def kit_triggers() -> str:
    out = []
    for cid, items in triggers.items():
        if cid in generated:
            continue
        c = by_id[cid]
        out.append(f'<h3>Cap. {c["num"]} · {c["title"]}</h3>')
        for tid, inner in items:
            out.append(f'<div class="box trigger" data-tid="{tid}">{inner}</div>')
        out.append(f'<p class="kit-src"><a href="#/c/{cid}">Reler o capítulo {c["num"]}</a></p>')
    return "\n".join(out)


def kit_tables() -> str:
    out = []
    for cid, items in tables.items():
        if cid == "17" or not items:
            continue
        c = by_id[cid]
        out.append(f'<h2>{c["num"]} · {c["title"]}</h2>')
        out.extend(items)
        out.append(f'<p class="kit-src"><a href="#/c/{cid}">Ver no contexto do capítulo {c["num"]}</a></p>')
    return "\n".join(out)


bodies["16"] = bodies["16"].replace("<!--ALL_TRIGGERS-->", kit_triggers())
bodies["17"] = bodies["17"].replace("<!--ALL_TABLES-->", kit_tables())

meta, templates, total_words = [], [], 0
for c in book["chapters"]:
    w = words(bodies[c["id"]])
    total_words += w
    meta.append({"id": c["id"], "num": c["num"], "part": c["part"], "title": c["title"],
                 "sub": c.get("sub", ""), "min": max(1, math.ceil(w / WPM))})
    templates.append(f'<template id="ch-{c["id"]}">\n{bodies[c["id"]]}\n</template>')

data = {"title": book["title"], "tagline": book["tagline"], "parts": book["parts"], "chapters": meta}
html = shell.replace("<!--TEMPLATES-->", "\n".join(templates))
html = html.replace("/*BOOK_JSON*/null", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
(ROOT / "index.html").write_text(html, encoding="utf-8")

version = hashlib.sha256(html.encode("utf-8")).hexdigest()[:10]
sw = (SRC / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", version)
(ROOT / "sw.js").write_text(sw, encoding="utf-8")

n_trig = sum(len(v) for k, v in triggers.items() if k not in generated)
n_tab = sum(len(v) for k, v in tables.items() if k not in generated)
print(f"index.html: {len(html)/1024:.0f} KB · {len(meta)} capítulos · {total_words} palavras · "
      f"{n_trig} gatilhos · {n_tab} tabelas · cache {version}")
for m in meta:
    print(f'  {m["num"]:>2} {m["title"]:<42} {m["min"]:>3} min')
