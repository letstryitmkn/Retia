# Next App Feeder

> Give this file to Claude at the start of a new app project. It explains how Retia was built, how we worked together, what I decided and changed along the way, and what to reuse or avoid next time.
> Written 2026-09-29, after Retia v7. Retia lives in `Desktop\Retia`, live at https://letstryitmkn.github.io/Retia/

---

## 1. Quick start for the next app

Paste something like this into a new session, with this file and the Retia folder available:

```
Read NEXTAPP_FEEDER.md in Desktop\Retia. I want a new app built the same way.
Name: <name>   Topic: <topic>   Look: <style idea>
Copy Retia's engine into a new Desktop folder, keep a PROJECT_NOTES.md updated as we talk,
and walk me through decisions the same way (options + your pick, mockups for design).
```

Order that worked well: **idea → name → folder + notes file → technical decisions → design → content plan → build in stages → publish → phone feedback → polish**.

---

## 2. How we work together (my preferences)

- **I decide, Claude proposes.** Give 2–4 options with a clear recommendation, then I pick, often with a tweak ("B but with the red button").
- **Show, don't describe, for anything visual.** Mockups of screens, icons, fonts and loading screens side by side were what made design decisions easy.
- **Keep a notes .md file updated live** as we talk (decisions, open questions, decision log with dates). I iterate on it later.
- **Plain language, no jargon.** When something technical came up that I didn't follow (e.g. a hand-edited `index.json` list), the answer was to explain it simply, or better, remove the need for it.
- **Short, direct messages.** I type fast and casually; answer the actual question first.
- **Explain trade-offs honestly** (e.g. the illustrated loading screen gets cropped on tall phones; offline mode can't be tested in the browser pane).
- **Fact-check content.** For learning content, check names/dates/numbers and say when a famous story is partly legend.
- **Test before handing over**, at phone size, and report what was actually tested.
- **Commit for me, I press Push origin** in GitHub Desktop. Then check whether it's live when I ask.

My taste, as it showed up:
- Classical / Renaissance aesthetic, Latin names; also a Warhammer 40k fan (liked the Adeptus Mechanicus vocabulary, but for this app chose Renaissance)
- Elegant but not theatrical: rejected "full Renaissance" wording as sounding "like cosplay"
- Readability over decoration: removed background sketches that got in the way, asked for more spacing, bigger text on the loading screen
- No gimmicks I didn't ask for: kept only the wax seal from the "extras"
- Content: bite-sized for the bus, but with real substance and examples a normal person gets

---

## 3. How the idea evolved (my iterations)

| Step | What I said | What it became |
|---|---|---|
| 1 | "Another personal app project" (after Phaeton) | Claude pitched 5 ideas (energy log, snap & sort, AI coach, two-person app, location nudges) |
| 2 | "An app for a jack of all trades, something to help learning" | Capture-first idea ("Fox"): save what you learn, AI makes flashcards |
| 3 | "An app that teaches me, and a friend can use it" | AI tutor with accounts (Supabase) |
| 4 | "No AI. I pre-plan a month of info, scroll offline on the bus" | **Packs**: I write content, app shows it offline |
| 5 | At least 5 concepts a day, track progress, look-up button | Daily concepts + progress + Look it up |
| 6 | Twice a month instead; "we use GitHub like my last project" | **Web app on GitHub Pages**, packs live in the repo |
| 7 | Name: Renaissance → Latin / 40k → **"Retia"** | Latin for "nets": a web of knowledge |
| 8 | 7 a day only, no more | **7 = goal and cap** |
| 9 | ABC quiz after the 7 → "too much work" | **Recollection**: "What is X?" → think → See answer → Remembered / Forgotten |
| 10 | Topics: history, philosophy, politics, persuasion, economics, art → "actually PPE" | **PPE**, all three subjects mixed every day (3/2/2) |
| 11 | "Bite-size but not just definitions, examples, normal-guy language" → "a bit more detail" | Notes = **In short / Explained / Example / Why it matters**, 110–150 words |
| 12 | Notes cramped on phone, scrolling | More spacing, then **two pages per note** (no scrolling) |

---

## 4. Design iterations (Retia)

- **Overall look:** 3 mockups (illuminated manuscript / Leonardo's notebook / candlelit study) → **Leonardo's notebook** (tan paper) with a **red** main button. No dark mode.
- **Buttons:** Save/bookmark dropped → **Ask AI** (ChatGPT / Claude, chosen in Settings). Gemini dropped because it can't open with the question pre-filled.
- **Font:** 6 options shown → **IM Fell English** (+ its small caps).
- **Icon:** astrolabe designs → green + wing → "bookplate" frame → tried adding a book (no) → olive branch → **I supplied my own artwork** (wing + olives in a green bookplate).
- **Loading screen:** Ovid's Phaethon epitaph (nod to my first app, Phaeton) → switched to the **Icarus** quote, "to fall means to once have soared" set as a motto → olive wreath ornament → finally **my own illustrated artwork** (clouds, sea, temple), with its drawn loading bar painted out and the app's sliding line + "Touch to continue" in its place. Timing ended at **3.5 s**, shown on every open.
- **Wording:** "light touch" Renaissance: Folio, Day III, Note, Recollection, "Day III sealed", "Unbroken for 5 days", "in arrears", "Return on the morrow." But plain buttons: **Understood**, Look it up, Ask AI, **See answer**. Progress in normal numbers (3 / 7).
- **Extras:** only the **wax seal** when a day is done.
- **Later fixes from real phone use:** more spacing, status bar colour, bigger quote, remove background circles, two pages per note, zoom locked, Galaxy Fold layout.

---

## 5. The engine (reuse this)

Plain HTML + CSS + JavaScript, no framework, no build step. Hosted free on GitHub Pages, installed via "Add to Home Screen".

| File | Job |
|---|---|
| `index.html` | All screens: loading, reading, Recollection, sealed, messages, pages (Contents/Progress/Library/Look up later/Settings) |
| `style.css` | The look. Colours are variables at the top; fonts are `@font-face` at the top |
| `app.js` | Everything else: reading, 7-a-day, Recollection, seal, progress, library, settings, offline lookups. Settings constants at the top (`DAILY_NOTES`, `SPLASH_MS`, `STORE_KEY`…) |
| `sw.js` | Offline mode (service worker) |
| `manifest.webmanifest` | Home-screen name, colours, icons |
| `packs/*.md` | The content, one file per Folio |
| `assets/` | Icons, loading artwork, fonts |
| `tools/serve.ps1` | Local test server (`http://localhost:8123`) |
| `tools/make-icons.ps1` | Artwork → square phone icons (180/192/512/32 + maskable) |
| `tools/make-splash.ps1` | Loading artwork → `splash.jpg` (paints out a drawn loading bar, trims border) |

Content format:
```
# Folio I
Philosophy: Thinking tools
Economics: Thinking like an economist
Politics: Core concepts

## Day I
### Philosophy | Argument vs opinion
**In short:** …
**Explained:** …
**Example:** …
**Why it matters:** …
```
Rules: 7 notes a day; each half (In short + Explained / Example + Why it matters) ≈ 75 words max so each page fits one screen; titles must be unique (the title is how progress is tracked).

Features already built: loading screen · two-page notes with swipe · 7/day cap · days in arrears · Recollection with spaced review (forgotten → back in 3 days) · wax seal · streak · Progress page with calendar · Library with re-reading · Look up later when offline · Settings (AI choice, text size) · offline mode · protected storage · zoom lock · works on Galaxy Fold/tablets.

---

## 6. Swap list for a new app

1. **Name:** `<title>` + apple title in `index.html`, `manifest.webmanifest`, splash `aria-label`
2. **Save name — must change:** `STORE_KEY` in `app.js` (e.g. `'newapp.v1'`). All my GitHub Pages apps share one web address (`letstryitmkn.github.io`), so the same key would mix progress between apps
3. **Offline cache name — must change:** `VERSION` prefix in `sw.js` (e.g. `'newapp-1'`), **and** make the clean-up only delete its own caches: `keys.filter((k) => k.startsWith('newapp-') && k !== VERSION)`. Retia's `sw.js` already does this (fixed in v8)
4. **Colours:** `:root` in `style.css`; status-bar colours in `show()` in `app.js` and `theme-color` in `index.html` + manifest
5. **Fonts:** download woff2 files into `assets/fonts/`, update `@font-face`, preload links in `index.html`, and `SHELL` in `sw.js`
6. **Icon:** put artwork in `assets/icon-source.webp`, run `tools/make-icons.ps1`
7. **Loading screen:** put artwork in `assets/splash-source.webp`, re-measure the loading-bar rectangle in `tools/make-splash.ps1` (or delete those lines if the art has no bar), run it; adjust `.splash-bottom { top: … }` and the aspect ratio `1032/1366` in `style.css` to the new art
8. **Wording:** labels in `index.html` and `app.js` (Folio, Recollection, "Return on the morrow.", etc.)
9. **Content:** new `packs/`, a plan file like `PPE_PLAN.md`, and a notes file like `PROJECT_NOTES.md`
10. **Daily rules:** `DAILY_NOTES`, `REVIEW_AFTER_DAYS`, `SPLASH_MS` at the top of `app.js`

---

## 7. Release routine

1. Change files → test locally (`powershell -ExecutionPolicy Bypass -File tools\serve.ps1`, open `http://localhost:8123/`; helpers `?reset`, `?today=2026-10-05`, `?nosplash`, `?sw`)
2. **If app files changed** (not just packs): bump `VERSION` in `sw.js` **and** `?v=` on `style.css` / `app.js` in `index.html` to the same number
3. Claude commits → **I press Push origin** in GitHub Desktop
4. Live in ~1–2 min; phones may keep the old copy up to ~10 min; updates show on the **second** open
5. New content only (a pack file) needs no version bump

---

## 8. Lessons learned (avoid next time)

- **Blank green loading screen after an update:** the phone mixed the new page with an old `style.css`. Fixed by versioned file names (`style.css?v=7`). Always do step 2 of the release routine.
- **iPhone home-screen app:** re-add it (delete + Add to Home Screen) to get new icons / full-screen mode. That deletes progress on iPhone, so do it early, while still testing.
- **Progress is only on the phone** (browser storage). Lost if the icon is deleted, browser data is cleared, used in a Safari tab instead of the icon, or a note title is renamed. I chose **no backup** for now; the app asks the browser to protect its storage.
- **Wide artwork on tall phones gets cropped at the sides.** For a loading screen, make the art phone-shaped (about 9:19.5, e.g. 1170×2532) from the start.
- **Measure page fit with real content** at phone size (375×812) and small/narrow screens (Galaxy Fold cover ≈ 344 wide; unfolded ≈ 884×736).
- **GitHub Pages address is case-sensitive:** `/Retia/` with a capital R.
- **A drawn loading bar in artwork** can be painted out by script, but it's easier to ask for art without one.

---

## 9. Tools & environment notes (for Claude)

- Windows 11, PowerShell 5.1. **No Python or Node installed.** Image work is done with PowerShell + WPF (can read WebP, write PNG/JPEG); see `tools/make-*.ps1`.
- Git: use GitHub Desktop's bundled git (`%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`). Committing works from the command line; **pushing doesn't** (the login lives in GitHub Desktop), so the user clicks Push origin.
- Check a deploy: `https://api.github.com/repos/letstryitmkn/<Repo>/actions/runs?per_page=1` (status of "pages build and deployment"), then fetch the live file with a random `?x=` to skip caches.
- Local server: start `tools/serve.ps1` in the background and open `http://localhost:8123` in the built-in browser (the `preview_start` launch config didn't pick up the project folder). The built-in browser pane **can't run service workers**, so offline mode must be tested on a real phone (Airplane mode).
- Pages with `?today=` let you time-travel to test streaks, arrears and spaced review.

---

## 10. What's next for Retia (so the next project doesn't forget it)

- ~~Fix `sw.js` cache clean-up before any second app on the same GitHub account~~ Done in v8 (2026-09-29), ahead of the second app, **Umbrarum** (`Desktop\Umbrarum`)
- Folio II planning when I'm about a week into Folio I (topics in `PPE_PLAN.md`, rounds 1 continues across Folios I–III)
- Feature backlog in `PROJECT_NOTES.md` §8c (Folio checker, See also links, Weekly Recollection…)
- Optional: phone-shaped version of the loading artwork so the temple isn't cropped
