# DLSS 5 GPU compatibility data (machine-readable)

An independent, source-attributed dataset of **which GPUs have DLSS 5 features, and which have no official answer yet** — plus a second column nobody else publishes: whether *our own* local software can run on that card.

Published by [DLSS5NVIDIA](https://www.dlss5nvidia.com/dlss-checker). Maintained from one single source of truth; the table on the site and the files here are generated together, so they cannot drift apart.

- `data/gpus.json` — full records, with a source URL and a human-checked date per entry
- `data/gpus.csv` — flattened, one row per GPU
- `data/schema.json` — field reference
- `scripts/check.mjs` — one-line lookup, no dependencies

## What this is not

- **Not NVIDIA's data, and not published or endorsed by NVIDIA.** It is our compilation of what NVIDIA's own pages say, with the URL and the date we checked it.
- **Not a promise that a game runs.** A supported GPU does not enable anything inside a title: the game has to ship the feature. Those are two separate columns here on purpose.
- **Not complete.** 21 GPUs across GeForce RTX 50 / 40 / 30 / 20, GTX 10, Radeon and Arc. Missing hardware is missing, not "unsupported".

## The rule that makes this usable

> `unknown` means **we could not verify it from an official page**, not "no".

Six of the 21 entries are `unknown` and stay that way until NVIDIA says something citable. If you are building on this data, treat `unknown` exactly like that — the failure mode everyone else has is filling the gap with a guess.

Each feature record looks like this:

```json
"neural": {
  "status": "confirmed",
  "note": "NVIDIA names all RTX 50 Series GPUs; the checked launch game is NBA 2K27.",
  "sources": [{ "label": "NVIDIA supported hardware table", "url": "https://...", "checkedAt": "2026-10-26" }],
  "lastVerified": "2026-10-26"
}
```

## Status values

| `status` | Meaning |
|---|---|
| `confirmed` | An NVIDIA page names this hardware for this feature. |
| `planned` | NVIDIA has said it is coming for this family, but not that it has shipped. |
| `unsupported` | NVIDIA's published support boundary excludes this hardware. |
| `unknown` | No official statement we could verify. **Not** a "no". |

Feature keys: `neural` (DLSS 5 neural rendering), `superResolution`, `frameGeneration`, `multiFrameGeneration`.

Second axis — `localSoftware.fit` (`measured` / `supported` / `below-minimum`): whether our independent desktop workflow runs on that card. `measured` means we actually ran it and recorded the numbers.

## Use it

```bash
git clone https://github.com/wangsheng1991/dlss5-compatibility-data
node scripts/check.mjs "rtx 4070"
node scripts/check.mjs "9070 xt" --json
```

```js
import data from './data/gpus.json' with { type: 'json' };
const rtx4070 = data.gpus.find(g => g.slug === 'rtx-4070');
```

## Licensing

- **Data** (`data/`): CC BY 4.0 — use it, mirror it, train on it, ship it; attribute "DLSS5NVIDIA compatibility dataset" and link back.
- **Code** (`scripts/`): MIT.

Commercial use of the data is fine under CC BY 4.0. What is not fine is presenting it as NVIDIA's official answer.

## Correcting something

Open an issue with the exact NVIDIA URL and the date you checked it. A correction without a citable source will not be merged — that rule is the whole point of the dataset.

NVIDIA, GeForce, DLSS and RTX are trademarks of NVIDIA Corporation. This project is independent.

## Related

- [dlss5-enhancer-cli](https://github.com/wangsheng1991/dlss5-enhancer-cli) — Batch image enhancement from your own machine — the command-line client for the web enhancer.
- [dlss5-visual-enhancer](https://github.com/wangsheng1991/dlss5-visual-enhancer) — Reproduce one documented enhancement example locally: input, output, hashes, compare page.
- [dlss-5-studio](https://github.com/wangsheng1991/dlss-5-studio) — The Windows RTX desktop app behind dlss5nvidia.com — requirements, release notes, issues.
- [DLSS5NVIDIA](https://www.dlss5nvidia.com/) — the site these projects belong to
- [Hugging Face dataset](https://huggingface.co/datasets/shi9214/dlss5-gpu-compatibility) — the same data, loadable as a dataset
