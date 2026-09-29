# Retia — Project Notes

> Living notes for the Retia app. Updated as we discuss. Last updated: 2026-09-29

---

## 1. Name

**Retia**: Latin for "nets / networks" (plural of *rete*).
- Fits a jack of all trades: a web of knowledge where lots of topics connect.
- Bonus: the *rete* is the lace-like star-map plate of an astrolabe, a Renaissance scholar's instrument.
- Second personal app project after **Phaeton**.

---

## 2. The idea in one line

A phone app that **teaches me what I planned in advance**, as bite-sized concepts I can **scroll offline anywhere** (bus, café, on the go). A friend can use it too.

---

## 3. Core requirements (decided)

| # | Requirement | Notes |
|---|---|---|
| 1 | **No AI**: I write the content myself | Pre-planned "info dumps" |
| 2 | **Packs twice a month** | ~15 days per pack → ~24 packs a year. App should also accept packs of any length |
| 3 | **7 concepts a day** (goal and cap) | ~105 concepts per 15-day pack. No more than 7 a day |
| 4 | **Fully offline** | Everything stored on the phone after download |
| 5 | **Seamless scrolling** | One concept per screen, swipe up for next |
| 6 | **Progress tracking** | Marking a concept done updates progress |
| 7 | **Look-it-up + Ask AI buttons** | Search the concept online, or open it in my preferred AI chat (ChatGPT or Claude) |
| 8 | **Friend can use it too** | Same app, own progress |
| 9 | **Built with GitHub** | Same workflow as Phaeton |
| 10 | **Daily recall round** | After reading all 7: "What is X?" → I recall it in my head → tap **See answer**. No extra writing needed |

---

## 4. Pack format (how I write content)

Plain text / Markdown file, one per Folio. Content = **PPE, all three subjects mixed every day** (full plan in [PPE_PLAN.md](PPE_PLAN.md)).

```
# Folio I
Philosophy: Thinking tools
Economics: Thinking like an economist
Politics: Core concepts

## Day I

### Philosophy | Valid vs sound
**In short:** An argument is valid if the conclusion follows from the premises. It's sound if it's valid and the premises are actually true.
**Example:** "All fish can fly. A salmon is a fish. So salmon can fly." Valid logic, false premise, so not sound.
**Why it matters:** Good logic with bad facts still gives you a wrong answer. Always check both.

### Economics | Opportunity cost
**In short:** ...
**Example:** ...
**Why it matters:** ...

(7 notes per day: 3 / 2 / 2 split, rotating which subject gets 3)

## Day II
...
```

- `#` = Folio title; the lines under it name each subject's current theme
- `##` = a new day
- `### Subject | Title` = a new note. The app shows the subject + theme as the small line above the title (e.g. "Philosophy · Thinking tools"), and the title is the search term for Look it up / Ask AI
- **In short / Explained / Example / Why it matters** = the four parts of every note. The app shows the labels in bold (supports simple **bold** and *italics*)
- **No questions to write.** The Recollection round is built automatically from the note titles

**Writing rules**
- Bite-sized but not just a definition: **what it is + how it works + a real example + why it matters**, in plain words a normal person gets
- About **110–150 words** per note (about a minute to read). A note may need a small scroll; the **Understood button stays pinned** at the bottom of the screen
- It's fine to write a Folio in weekly chunks; the app should accept a partly filled Folio

---

## 5. Phone experience

```
┌─────────────────────────────┐
│ Day 1 · ●●●○○○○ 3 of 7 today│
│                             │
│ THE FOUR-STROKE CYCLE       │
│                             │
│ Intake, compression, power, │
│ exhaust — repeated          │
│ thousands of times a        │
│ minute...                   │
│                             │
│ [ 🔍 Look it up ] [ ✦ Ask AI]│
│                             │
│      [ Understood — next ]  │
└─────────────────────────────┘
      swipe up for next ↑
```

- Opens right where I left off, with no menus or login
- Swipe up = next concept
- **After the 7th concept → the day's recall round**: each of today's 7 titles shown one at a time ("What is *the four-stroke cycle*?") → I recall it in my head → tap **See answer** → the concept text is revealed

```
┌─────────────────────────────┐
│ Recall · 2 of 7             │
│                             │
│ What is…                    │
│ THE FOUR-STROKE CYCLE?      │
│                             │
│ (think about it first)      │
│                             │
│      [ 👁 See answer ]       │
└─────────────────────────────┘
```
- Adjustable text size (no dark mode, always tan paper)
- Missed a day? Unfinished concepts carry forward, no guilt (still max 7 a day)

---

## 6. Progress tracking

Tapping **Understood** marks a concept done. Progress shows as:
- **Today**: ring or dots (3/7), then the recall round, then a small celebration when the day is complete
- **This pack**: progress bar (e.g. 42 of 105 concepts, Day 6 of 15)
- **Streak**: days in a row completing the day (7 read + recall round done)
- **Calendar**: each day shaded by how much I finished (GitHub-style)
- **All-time**: total concepts learned across every pack

---

## 7. Look-it-up button

- **Online**: menu to search the concept on **Google / Wikipedia / YouTube**; opens in the phone's browser, and the app keeps my place
- **Offline**: adds the concept to a **"Look up later"** list, with a gentle reminder when back online

### Ask AI button
- Opens my preferred AI chat with a ready-made question about the concept, e.g. *"Explain 'The four-stroke cycle' (topic: How Cars Work) in more depth with examples. Here's what I already know: <concept text>"*
- **Choose the AI in Settings**: **ChatGPT or Claude**. Each person picks their own (stored on their phone)
- Both open with the question already filled in: ChatGPT via `chatgpt.com/?q=…`, Claude via `claude.ai/new?q=…`
- Gemini dropped: it can't open with the question pre-filled
- Offline: goes to the "Look up later" list like Look it up
- This doesn't break the "no AI" rule: the app itself has no AI, and this button just opens an outside chat

---

## 8. Tech plan

**Web app (PWA) hosted free on GitHub Pages**, the same approach as Phaeton (to confirm).

- Open the link on the phone → *Add to Home Screen* → it gets its own app icon
- Service worker (`sw.js`) caches the app and packs, so it **works offline**
- **Packs live in the GitHub repo**: upload a new pack file and both phones download it automatically next time they're online
- **Progress is stored on each phone** (browser storage), so there are no accounts, no server and no cost
- Friend installs from the same link and gets their own separate progress

### Repo layout (draft)
```
Retia/
├── index.html        ← the app itself
├── app.js            ← swiping, progress, look-up button
├── style.css
├── sw.js             ← offline support
├── manifest.json     ← app name/icon for "Add to Home Screen"
└── packs/
    ├── 2026-10-a.md  ← Oct 1–15
    └── 2026-10-b.md  ← Oct 16–31
```

### Twice-a-month routine
1. Write the next pack on my computer
2. Put it in `packs/` on GitHub (upload or push)
3. Phones pick it up next time they're on wifi
4. Swipe, ✓, 🔍 on the go

### Technical details (under discussion)

**Building blocks**
- Plain HTML + CSS + JavaScript, **no framework and no build step**. GitHub Pages serves the files as they are, and every line stays readable
- Swiping uses the browser's built-in **scroll-snap** (smooth, native feel, no library)

**How the app finds packs**
- Adding a pack = **just drop the `.md` file in `packs/` and push**. Nothing else to edit
- When online, the app asks GitHub for the list of files in `packs/` (GitHub's public API, no key needed for a public repo)
- Offline, or if GitHub doesn't answer, it uses the last list it saved
- (Dropped: a hand-maintained `packs/index.json` list, which was an extra step for no benefit)

**Offline**
- A service worker saves the app + every pack onto the phone
- When online, it quietly checks for new packs and app updates in the background; changes show the next time the app is opened

**Where progress lives**
- In the phone's own storage (IndexedDB). Each person/phone tracks separately
- Each concept is identified by *pack file + concept title*, so fixing a typo in the text keeps progress. **Renaming a concept title resets that one concept**
- ⚠️ Known risk: deleting the home-screen app or clearing browser data wipes progress. **Accepted for now, no backup feature** (could add Export/Import later)
- iPhone: install via Safari → Share → Add to Home Screen. The installed app has its own storage, separate from Safari tabs

**Pacing: how "Day" and the daily limit work** (decided)
- A pack starts the day I first open it (Day 1)
- The feed is always **the next unfinished concepts, in order**
- **7 concepts a day: goal and cap.** After the 7th → the recall round → "come back tomorrow" screen (can still re-read today's concepts)
- Since goal = cap, I can't get ahead, only on track or behind; the pack screen shows how many days behind
- Writing guideline: **exactly 7 concepts per day**, nothing else to write
- Day boundary = local midnight
- One active pack at a time; the library lets me switch or start the next one

**Look-it-up links**
- Google: `google.com/search?q=<concept>`, Wikipedia search, YouTube search
- Offline check → adds to "Look up later" instead

**Update routine (me)**
1. Write pack → save in `Retia/packs/`
2. Add a line to `packs/index.json`
3. GitHub Desktop → Commit → Push
4. GitHub Pages redeploys in ~1 minute → phones pick it up next time they're online

**Testing**
- On the computer: run a local preview and check it in a browser
- On the phone: the GitHub Pages link (`<username>.github.io/retia`)

---

## 8b. Build status

**Stage 1 (core): DONE, 2026-09-29.** Tested in the browser, no errors.
- Files: `index.html` (screens), `style.css` (look), `app.js` (logic), `packs/folio-01.md` (Folio I, Days I–III = 21 notes), `tools/serve.ps1` (local test server)
- Works: loading screen (5 s → Touch to continue) → reading notes → Understood (or **swipe left** like turning a page) → 7-a-day limit → Recollection (shuffled; See answer → Remembered / Forgotten) → wax seal "Day I sealed" → "Return on the morrow." + Revisit today's notes
- Also working: "N days in arrears", streak ("Unbroken for N days"), forgotten notes return 3 days later ("from an earlier day"), unfinished days' notes carry into the next Recollection, Look it up (Google) and Ask AI (ChatGPT for now)
- Changed from plan: progress saved with **localStorage** instead of IndexedDB (simpler, enough for this size)

**How to test on the computer**
1. Run: `powershell -ExecutionPolicy Bypass -File tools\serve.ps1`
2. Open `http://localhost:8123/`
3. Test helpers in the address bar: `?reset` (wipe progress), `?today=2026-10-05` (pretend it's another day), `?nosplash` (skip loading screen). Combine with `&`

**Stage 2 (next):** Settings (ChatGPT/Claude, text size), Look up later list when offline, Library of Folios, progress/stats screen, offline support (service worker), web app manifest + icon sizes
**Stage 3:** GitHub repo → GitHub Pages → install on phones

**LIVE: https://letstryitmkn.github.io/Retia/** (repo: github.com/letstryitmkn/Retia, published 2026-09-29, checked working)

**Uploading to GitHub (GitHub Desktop)**
1. File → Add local repository → choose `Desktop\Retia` → "create a repository" → Name `retia` → Create repository
2. Summary box (bottom left): "First version" → **Commit to main**
3. **Publish repository** → untick "Keep this code private" → Publish
4. github.com → the `retia` repo → **Settings → Pages** → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save
5. After ~1–2 min the app is live at `https://<username>.github.io/retia/`
6. Later changes: GitHub Desktop → Commit → **Push origin**. The site updates in about a minute
- Note: the repo is public, so everything in the folder (including these notes) is readable by anyone who finds it

## 9. Build order

- **v1: core**: load a pack → swipe concepts → remember where I stopped → mark done
- **v2: progress + recall**: daily 7 ring, end-of-day recall round, pack progress bar, streak
- **v3: extras**: Look it up + Ask AI buttons (with AI choice in Settings), look-up-later list, library of past packs, calendar view
- **Later / maybe**: see my friend's streak (would need a server), images in packs

---

## 10a. Design: Renaissance look (in discussion)

**Chosen: B · Leonardo's notebook**, with changes:
- **Understood button (formerly "Got it") in manuscript red** (`#9B2D20`, parchment-coloured text), and the progress dots in the same red
- **No Save/bookmark button**; replaced by **Ask AI**
- **Bigger topic line and concept title** (topic ~17px italic, title ~30px)
- Colours: tan paper `#E6D3AE`, brown ink `#3E2A1A`, faded ink `#6B4E32`, sketch lines `#8A6A45`, red `#9B2D20`
- Font: **IM Fell English** (titles and text)

Font options that were considered (all free Google Fonts):
1. IM Fell English: old printed book, rough ink (in the first mockup)
2. EB Garamond: classic 1500s typeface, very readable
3. Cormorant Garamond (titles) + EB Garamond (text): elegant, high contrast
4. Cinzel (titles) + Cardo (text): Roman carved capitals, scholarly
5. Italianno (titles) + Alegreya (text): handwritten titles, like Leonardo's pen
6. Alegreya: calligraphic but crisp on small screens

Original three style directions (mocked up in chat):
- **A · Illuminated manuscript**: cream parchment, dark ink, **red** headings, a large drop capital on each concept. Font: EB Garamond
- **B · Leonardo's notebook**: tan paper, brown ink, faint compass/astrolabe sketches in the margins, hand-set feel. Font: IM Fell English
- **C · Candlelit study** (dark): walnut-black background, warm parchment text, **gold** accents, carved-stone capitals. Fonts: Cinzel (titles) + EB Garamond (text)
- Idea: **A or B for light mode + C for dark mode** (the phone switches automatically)

**App icon: FINAL.** My own artwork, saved as `assets/icon-source.webp` (1254×1254)
- Engraved-style wing with two olive branches (with olives), inside a double-line bookplate frame, on faded sage green, dark green ink
- To do when building: export PNG sizes for phones (**180×180** for iPhone, **192×192** and **512×512** for Android)
- To do: make a **square, full-bleed version** (fill the corners with the sage green). iPhone and Android round the corners themselves, so the artwork's own rounded corners and dark edge would show as a black rim otherwise. Keep the double frame inside the safe area

- Confirmed plan: square sage-filled version + 180/192/512 px exports, done during the build (no image tools on this PC yet; will do it in the browser or with a small script)

**Loading screen (splash)**: a short "fake" loading screen when the app opens
- **Quote (final): *"Icarus laughed as he fell, for he knew to fall means to once have soared."*** Ties to the wing in the icon
  - Layout: "Icarus laughed as he fell, for he knew" in italics → ❦ between thin rules → **"To fall means to once have soared."** large, in small caps, set apart like a motto (emphasis option 3) → closing rule → sliding progress line
  - Credit: none shown for now (this quote is widely shared online without a reliable source)
- Earlier quote (replaced): *"Here Phaethon lies who in the sun-god's chariot fared. And though greatly he failed, more greatly he dared."* (Ovid, *Metamorphoses* II)
- Layout: icon → "Retia" in IM Fell English small caps → ornament ❦ → quote in italics → "Ovid, Metamorphoses II" → thin sliding progress line
- **Chosen: A · sage green `#B3BA93`, English only**, with **bigger text**: quote ~24px italic (two lines, one per sentence), "Retia" ~30px, attribution ~16px
- (B · tan paper with the Latin above the English was not chosen)
- Emphasis style: **3 · motto between thin rules** (chosen over small caps on its own line, or large red italic)
- **Timing: shows ~3.5 seconds (changed from 5) → then a "Touch to continue" prompt appears → tap → into the app**
- Shows **every time** the app is opened (confirmed)
- **Ornament: 3 · Olive wreath** (chosen). Two olive branches (leaves `#9DA57F`, olives + stems `#3D4B37`) curve up from below and cradle the motto; thin single-line frame around the screen; "Touch to continue" in small caps at the bottom
- Options that were mocked up:
  1. Bookplate frame: double border like the icon, ❦ fleurons breaking the frame top and bottom
  2. Title page: thick-thin frame with diamond corners, Latin subtitle *liber de omnibus rebus* ("a book about all things"), diamond rules, year **MMXXVI**
  3. Olive wreath: two olive branches cradling the motto (echoes the icon), thin single frame
  4. Arched tablet: quote inside a double-lined arch, like a stone inscription

Earlier icon exploration: wing in old / faded greens, "sophisticated":
1. Terre verte: parchment line-engraved wing on old green `#56644A` (terre verte = the green earth pigment Renaissance painters used under skin tones)
2. Faded sage: deep green ink wing `#2F3B2A` on faded sage `#A9B293`
3. Verdigris + brass: brass wing `#C9A45C` over a thin ring on deep verdigris `#33463B` (verdigris = the green patina on old brass/copper; the ring nods to the rete)
4. Bookplate: dark green wing inside a thin double frame on pale faded green `#C6CAAA`, like an old library stamp

**Chosen base: 4 (Bookplate)**, wing only (the book idea was tried and dropped). Now considering an **olive branch** (olive = Athena/Minerva, goddess of wisdom; also peace):
- A · Olive sprig: one branch resting beneath the wing
- B · Olive crest: two branches in a V, cradling a smaller wing
- Olive leaves in a slightly deeper sage `#9DA57F` so they stand apart from the wing; olives in ink `#3D4B37`

Earlier astrolabe-rete icons (set aside): ink on paper, manuscript red, brass by candlelight, R monogram

**Extras decided:** ✅ **Wax seal** (red seal stamps onto the page when the day's 7 + recall round are done). ❌ Candle streak (plain streak instead). ❌ "Curiosities" (keep the plain name "Look up later")

Signature touches (original ideas):
- App icon: the **astrolabe rete**, a lace-like star-map ring (ties to the name Retia)
- Daily progress: 7 dots, or a ring drawn like an astrolabe dial with 7 marks
- Day complete: a **wax seal** stamps onto the page
- Streak: a row of **candles**, one lit per day
- Look up later list: "Curiosities"

---

## 10b. In-app wording (FINAL: light touch)

Themed words for names/labels, plain words on buttons. Full Renaissance was rejected ("sounds like cosplay").

| Thing | Final wording |
|---|---|
| A pack | **Folio** ("Folio I · How Cars Work") |
| Day number | **Day III** (Roman numerals) |
| Today's progress | **3 / 7** (normal numbers) |
| A concept | **Note** ("Seven notes learned") |
| Main button (was "Got it") | **Understood** |
| Look it up button | **Look it up** |
| Ask AI button | **Ask AI** |
| Recall round | **Recollection** |
| Reveal button | **See answer** |
| After revealing | **Remembered / Forgotten** |
| Day complete | **Day III sealed** (+ wax seal) |
| Daily limit reached | **Return on the morrow.** |
| Streak | **Unbroken for 5 days** |
| Behind schedule | **2 days in arrears** |
| Look-up-later list | **Look up later** |
| Pack library | **Library** |
| Settings | **Settings** |
| All-time total | **Notes learned: 240** |

---

## 10c. Earlier vocabulary ideas (Renaissance vs 40k)

Name is Latin; the in-app wording could lean Renaissance and/or Warhammer 40k (Adeptus Mechanicus). Options noted so far:

| Feature | Renaissance | 40k / Mechanicus |
|---|---|---|
| A pack | Folio | Data-slate |
| A concept | Note | Datum |
| 5 a day | — | Daily Rite |
| ✓ Got it | — | "Knowledge acquired" |
| Streak | — | Litany |
| All-time total | Codex | The Archive |
| Look-up-later list | Curiosities | Explorator Queue |
| Loading screen | — | "Awakening the machine spirit…" |
| Day complete | — | "The Omnissiah is pleased." |

Note: fine for personal use; avoid Games Workshop trademarks if it's ever put on an app store.

---

## 11. Open questions

Design & theme (next):
- [x] Renaissance look: style B (Leonardo's notebook), red Got it, IM Fell English
- [x] Extras: wax seal only
- [x] Loading screen ornament: **olive wreath**
- [x] Inside the app: **tan paper** (with the red Got it button)
- [x] Dark mode: **none**, always tan paper
- [x] Loading screen: **every time** the app opens
- [x] Themed wording: **light touch** with changes: Understood, 3 / 7, See answer, "Return on the morrow." (see 10b)
- [x] **Design finished** ✅

Content:
- [x] Subject area: **PPE (Politics, Philosophy, Economics)**. Detailed plan in [PPE_PLAN.md](PPE_PLAN.md)
- [x] Structure: **all three subjects every day**, 3 / 2 / 2 rotating; each subject's theme runs 3 Folios
- [x] Note style (v2, more detail): **In short / Explained / Example / Why it matters**, plain language, 110–150 words
- [x] Sample Day I (v2 detail level) approved

Ready to build (nothing blocking). Needed along the way:
- [ ] GitHub username + create the `retia` repo (only needed at publish time)
- [ ] Test content: Claude drafts the first days of Folio I
- [ ] Icon PNG exports (small helper page in the project, since there are no image tools on this PC)
- [ ] Screens not mocked up yet (Library, Settings, progress/stats): design as we build, same style

Can wait:
- [ ] Confirm how Phaeton was built (assumed: web app on GitHub Pages, GitHub Desktop)

Answered:
- [x] Phones: **both iPhone and Android**. PWA works on both; "Add to Home Screen" is easy enough
- [x] Repo: **public** (free GitHub Pages; packs readable by anyone with the link, which is fine)
- [x] Pack start: **Day 1 = the day I first open it**
- [x] Packs: **written by me only** for now; friend can install the app and follow the same packs with their own progress
- [x] Look & feel: **Renaissance**
- [x] Pacing: **7 a day, goal and hard cap** (changed from 5 goal / 7 cap)
- [x] Testing: **recall round after all 7 concepts** ("What is X?" → recall in my head → See answer). A/B/C quiz dropped, too much writing
- [x] Recall prompt: **"What is… <title>?"**
- [x] After See answer: **✓ Remembered / ✗ Forgot**; forgotten ones come back in a later recall round (~3 days later)
- [x] Recall order: **shuffled**
- [x] Backup: **not needed for now**
- [x] Pack list: **automatic** (app reads the `packs/` folder via GitHub), no manual list file

---

## 12. Ideas considered and set aside

- **AI tutor** (AI generates lessons on any topic): dropped, I want to plan my own content
- **Capture-first app** (save what I learn elsewhere, AI makes flashcards): dropped, the app should *teach*, not just store
- **Accounts + backend (Supabase)**: not needed; packs on GitHub + progress on each phone is enough
- **A/B/C multiple-choice quiz**: dropped, writing 3 options + an answer for every concept was too much work. Replaced by the recall round

---

## 13. Decision log

| Date | Decision |
|---|---|
| 2026-09-29 | Learning app for a jack of all trades; friend can use it too |
| 2026-09-29 | No AI; I pre-write content as packs |
| 2026-09-29 | Packs twice a month, 5+ concepts a day |
| 2026-09-29 | Offline scrolling, progress tracking, look-it-up button |
| 2026-09-29 | Build with GitHub (PWA on GitHub Pages) |
| 2026-09-29 | Name: **Retia** |
| 2026-09-29 | Must work on both iPhone and Android (PWA covers both) |
| 2026-09-29 | Public GitHub repo |
| 2026-09-29 | A pack starts the day I first open it |
| 2026-09-29 | I write all packs for now; friend only reads/follows |
| 2026-09-29 | Look & feel: Renaissance |
| 2026-09-29 | Plain HTML/CSS/JS, no framework or build step (proposed) |
| 2026-09-29 | Daily goal 5, hard cap 7 concepts per day |
| 2026-09-29 | Changed: **7 concepts a day, goal and cap** |
| 2026-09-29 | Daily A/B/C multiple-choice quiz after the 7th concept (replaces tap-to-reveal Q/A) |
| 2026-09-29 | Changed: **recall round instead of A/B/C quiz**. "What is X?" → recall → See answer. Built from titles, nothing extra to write |
| 2026-09-29 | Recall details: "What is… X?", ✓ Remembered / ✗ Forgot (forgotten return ~3 days later), shuffled order |
| 2026-09-29 | **Technical side settled** → moving on to design & theme |
| 2026-09-29 | Style **B (Leonardo's notebook)** with red Got it button; bigger topic + title |
| 2026-09-29 | Save/bookmark removed → **Ask AI** button (ChatGPT / Claude / Gemini / custom, chosen in Settings) |
| 2026-09-29 | Ask AI: **ChatGPT or Claude only** (Gemini dropped, no pre-filled question) |
| 2026-09-29 | Font: **IM Fell English** |
| 2026-09-29 | **App icon final**: my own artwork, wing + olive branches in a green bookplate frame (`assets/icon-source.webp`) |
| 2026-09-29 | Add a loading screen with Ovid's Phaethon epitaph |
| 2026-09-29 | Loading screen: option A (sage green, English only), bigger quote text |
| 2026-09-29 | Loading screen quote changed to Icarus: "…to fall means to once have soared", set as a motto |
| 2026-09-29 | Loading screen: ~5 s, then "Touch to continue" |
| 2026-09-29 | Inside the app: tan paper. **No dark mode** |
| 2026-09-29 | Extras: **wax seal only** (no candle streak, no "Curiosities" name) |
| 2026-09-29 | Loading screen ornament: **olive wreath** around the motto |
| 2026-09-29 | Loading screen shows every time the app opens |
| 2026-09-29 | Wording: **light touch** (Folio, Day III, Note, Recollection, sealed, Unbroken, in arrears). Main button = **Understood**; progress in normal numbers (3 / 7); **See answer**; limit message "Return on the morrow." |
| 2026-09-29 | **Design finished** → next: sample pack topic, then build v1 |
| 2026-09-29 | Content: **PPE** (considered also history, persuasion, art; narrowed to PPE, with persuasion as a Politics Folio). Draft year plan in `PPE_PLAN.md` |
| 2026-09-29 | **Mix all 3 subjects every day** (3 / 2 / 2). Notes = In short + Example + Why it matters, plain words, bite-sized |
| 2026-09-29 | Notes get **more detail**: added an **Explained** part; 110–150 words; Understood button pinned so longer notes can scroll |
| 2026-09-29 | **Stage 1 built and tested** (core reading loop, Recollection, wax seal, loading screen, 3 sample days) |
| 2026-09-29 | Published to GitHub Pages; tested on phone: works |
| 2026-09-29 | Phone feedback fixes: **more spacing** in notes (labels like "In short" on their own line, taller lines, bigger gaps, wider margins); **status bar** now tan inside the app (was sage green from the loading screen); **loading screen 3.5 s** (was 5 s); curly quotes |
| 2026-09-29 | Loading screen: "Icarus laughed as he fell, for he knew" enlarged (23px → 29px) |
| 2026-09-29 | No progress backup for now |
| 2026-09-29 | Packs found automatically; just drop the file in `packs/` |
