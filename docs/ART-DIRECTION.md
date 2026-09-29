# MARMARA BLUE — Art Direction

> "Bu bir web sitesi değil, markanın dijital dünyası."

## 1. The idea: THE HELD FRAME

Marmara Blue's own film is the only source of imagery. We don't dress it up
with stock photography. We **hold its frames**, the way an editor stops a reel
on the flatbed: we crop them, enlarge them and annotate them.

The film plays behind the whole page and **never stops**. It is fixed in place;
the page scrolls over it. Type sits on top of the film; content pages are
translucent midnight panels, so the film keeps moving faintly behind them. At
the end, the panels open up again and *LET'S GO.* sits directly on the film.

Nothing transforms on scroll. Scrolling only moves the page.

## 2. Columns & Spans (the architecture)

The footage is vertical (9:16), and we treat that as architecture rather than a limitation.

- **Photographs are columns.** They stand upright at full viewport height or
  taller, bleeding off the top and bottom edges. On desktop they are never
  stretched far past their native resolution.
- **Typography is a span.** Huge horizontal words cross the field like the
  Bosphorus bridges cross the water. They pass *behind* columns and *in front*
  of them, and they run off the viewport edges.

## 3. Signature devices

These make the site recognisable even with the logo removed.

| Device | What it is | Why it exists |
| --- | --- | --- |
| **Timecode** | Every still carries its real source timecode (`TC 00:00:05:00`). | It's honest: every image is a frame from the brand's own film. "VIEW MOMENT" plays the film from that exact timecode. |
| **Strait Line** | One champagne hairline, vertical, dividing EUROPE / ASIA. | It is the Bosphorus drawn as a single line. It appears in the split, in the fleet survey and in the credits. |
| **Survey annotations** | Tiny mono labels with hairline leaders, like an architect's elevation drawing. | Fleet facts are *surveyed*, not marketed. Only verified data goes in them. |
| **Width axis** | One grotesk (Archivo) from 62 % width (columns, vertical words) to 125 % (spans). | Width *is* the architecture. Narrow words stand, wide words cross. |
| **Coordinates** | `41°N 29°E` | The address of the experience. |

## 4. Type system

| Role | Face | Size | Notes |
| --- | --- | --- | --- |
| Span (display) | Archivo, wdth 112–125, wght 700–800 | 18–42 vw | Uppercase, tight (−0.04em), always allowed to crop at the viewport edge |
| Column (display) | Archivo, wdth 62, wght 800 | 12–30 vh | Vertical (`writing-mode`), cropped |
| Emotion | Bodoni Moda italic | 8–26 vw | **At most one word per chapter**: *experience*, *go* |
| Metadata | DM Mono 400 | 11–12 px | Uppercase, +0.14em tracking. Never smaller than 11 px, high contrast |
| Reading | Archivo wdth 100, wght 400 | 15–17 px | Turkish detail copy (services verified from marmara.blue) |

**Huge vs tiny.** Every enormous word sits next to a tiny annotation.
Nothing sits in the middle; medium sizes are avoided on purpose.

## 5. Colour

Photography provides the colour: teal water, red carpet, magenta silk, tungsten
festoon light. The environment around it stays quiet.

| Token | Hex | Use |
| --- | --- | --- |
| `--abyss` | `#05080F` | Near-black blue. Night, end credits |
| `--midnight` | `#0A1628` | Deep midnight navy. Primary environment |
| `--navy` | `#0E2341` | The navy half of the split |
| `--ivory` | `#EFE7D8` | Warm ivory. Type on dark; the "light table" and morning backgrounds |
| `--champagne` | `#BFA779` | Restrained metallic accent. Used only for hairlines, index numbers and focus rings. **Never a gradient, never a fill.** |

No black and gold, no purple, no neon.

## 6. Controlled imperfection

- Nothing is centred except by accident of the photograph.
- Each chapter breaks the 12-column grid by at least one column: text hangs
  into the margin and images cross chapter boundaries by 6–12 vh.
- Large empty areas are intentional.
- In the archive, prints on the light table start rotated ±0.4–2.2°; alignment
  happens only when the user scrolls.

## 7. Motion principles

Calm, not choreographed.

- **The film always plays.** It is `position: fixed` behind the page, muted
  and looping, and it is never paused, frozen or scaled by scrolling.
- **Nothing reacts to scroll.** There is no pinning, no scrubbing, no parallax,
  no horizontal travel and no elements rearranging. Scrolling only moves the page.
- **Motion happens once, on load.** ISTANBUL 41°N appears, then MARMARA / BLUE,
  then the line of copy. After that the type stays still over the film.
- **Interaction is by click only**, and it is always reversible: the index
  menu, VIEW MOMENT (plays the film from that frame), the request form.

Easing: `expo.out`. No bounce, no elastic, no 3D flips, no glowing cursor.

`prefers-reduced-motion`: the film does not autoplay; a **PLAY FILM** control
is shown over the poster instead, and the load animation is skipped.

## 8. Chapter score (01 / 07)

| # | Chapter | Menu word | Composition |
| --- | --- | --- | --- |
| 01 | Opening | — | The film, fixed and playing · ISTANBUL 41°N · MARMARA upper-left, BLUE crossing and cropped · one line of copy and the request link |
| 02 | The Strait | STORY | Translucent over the film · SOMEWHERE BETWEEN ASIA & EUROPE · BACKDROP behind the column, EXPERIENCE in front |
| 03 | Experiences | EXPERIENCES | Four full-screen scenes, one after another. 01 WEDDINGS colossal column · 02 CORPORATE night diptych and vertical word · 03 PRIVATE span-dominant print · 04 BRUNCH ivory morning manifest |
| 04 | The Fleet | FLEET | Catalogue page: survey of KAPTAN-I DERYA 3 (name as painted on the stern) beside the photograph · fleet range **50 → 500** guests |
| 05 | Moments | MOMENTS | Ivory light table: one huge, three tiny, one vertical print |
| 06 | @marmara.blue | — | Giant handle · contact sheet with grease-pencil selects |
| 07 | Let's go | CONTACT | Directly on the film · READY TO LEAVE THE SHORE? · LET'S / GO. · request form appears only on interaction |

## 9. Mobile has its own direction (not a stacked desktop)

- The vertical reel fits a phone natively. It is the whole screen.
- MARMARA runs **up** the left edge; BLUE sits across the bottom, cropped.
- Columns become full-screen portraits at native resolution.
- Experiences: one scene per screen.
- The minimum text size is 11 px, and there is no horizontal overflow.

## 10. Truth rules

- Every fact comes from marmara.blue or the brand's Instagram bio, or is
  visible in the supplied film. See `docs/FACTS.md`.
- Nothing is invented: no testimonials, no boat specifications, no dates.
  Where a fact isn't known the page says **ON REQUEST**, not a guess.
