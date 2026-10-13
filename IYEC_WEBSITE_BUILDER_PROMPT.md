# Prompt for a website builder: Rooted SG / RootStake (IYEC 2026 entry)

Copy everything below the line into the builder.

---

Build a polished, multi-page, scroll-driven marketing and story website for **Rooted SG**, a Singapore team's entry to **IYEC 2026** (hardware entry: **RootStake**). Tagline: **"Your space to grow, and proof it worked."** Core idea: **"Don't count what we plant, count what we keep alive."**

## 1. The project in one paragraph
Rooted SG is an iOS app (native SwiftUI, in testing) for growing food at home in Singapore, paired with **RootStake**, a 3D-printed sensor-and-watering stake that sits in the plant pot. The stake measures the soil (and, as a prototype, the plant stem), sends readings over Bluetooth LE to the phone, the app decides ("Water it now" / "Nothing to do today"), the stake doses water or feed through a hidden bore in the probe, and the app verifies it worked. Only verified, still-alive days count, as **verified plant-days**.

## 2. The problem and the numbers (use exactly; cite sources in a footnote)
- Singapore has handed out ~**860,000 free seed packets since 2020**. Nobody records how many plants survive.
- Singapore imports ~**90% of its food** from 180+ countries/regions; it grows under 10% of what it eats; the 30-by-30 goal.
- Rooted SG survey, **n = 3,043**: **70.9%** want to grow at home; **23.6%** tried and stopped (didn't know what grows here, when to water, or if the plant was healthy).
- Footnote: survey figures are from the Rooted SG survey; food-import and seed-packet figures are Singapore government statistics (verify the current source before quoting).

## 3. Site structure (5 pages, shared nav and footer, footer has an "Entry" column linking IYEC 2026 and The team)
1. **Home**: hero ("Your space to grow, and proof it worked." CTAs: "Meet the app" and "See RootStake in 3D"; chip "Real footage · Real CAD · Real survey"; floating stat cards "Verified plant-days 314", "Care streak 5"). Sections: RootStake teaser (4 steps: the probe, printed in two halves, push to the mark, the dose); "One connected ecosystem" (Garden, Market, Quests, BioDex, Profile); Grow (verified plant-days, check-ins, care streaks, growth stages, Legacy Plants); Measure (stake overview with 3D model); stem-electrode teaser; "The app and the stake are one loop" system teaser; "Where this stands" award strip: **IYEC 2026 – RootStake hardware entry**, 3,043 surveyed, 14 print iterations, iOS native SwiftUI in testing.
2. **The app (iOS)**: "A garden that keeps count." Five screens in phone mockups (Index/Today, Garden, Market, Profile, BioDex, plus Settings). Details: Pandan kept alive 194 days, 12 verified check-ins, care streak 5, Legacy Plant = survival + recovery from a struggling period; Market "Exchange" lists offers/wanted/free/seeds sorted by nearby (example: cherry tomatoes off the corridor rack, ~300 g/week, free to a neighbour, grower record 421 plant-days); Profile Level 6, 314 lifetime plant-days, milestones (First Plant, 7-Day Care, 30 Days, 90 Days, Veteran); Quests (ten open, each a small real action); BioDex "Discover Singapore" (photograph butterflies, bees, birds, beetles; each species tagged community confirmed / AI suggested / expert verified; 4 of 17 recorded). A **theme switcher** section (see section 5).
3. **RootStake (hardware)**: "Sensing without watering is just a thermometer." Scroll-driven exploded view of the real CAD (swap in uploaded STL/GLB models if the builder supports 3D, otherwise a stylised illustration or video). Facts: probe 26.4 × 15.9 mm, 151 mm long; PETG, 0.2 mm layers, printed in two halves face-up with no supports; **14 iterations**; 40 mm toothed chisel point on 4 mm pitch; 4.5 mm hidden bore exiting at the centre of the nose; moisture board behind a bevelled window plus two turns of bare copper for soil EC; soil-line mark so every reading is from the same depth; twin 5 V pumps merging at a Y-connector. The module: gable roof with two 70 mm solar panels over an ESP32-S3, rain-shedding vents, air-sensor chamber, snap-together ball-and-socket gooseneck arm, no screws (press-fit, twist-lock, hot glue). Stem electrode prototype: sprung clip, two titanium needles, sweep **1 kHz (goes around cells) to 100 kHz (goes through cells)**; the ratio is the measurement; reported as trend and timing, never a calibrated figure. Stat counters: 14 iterations, 46 bytes, hidden fertigation tube.
4. **How it works**: an 8-step scroll-driven loop animation, with a live readout (Moisture 31%, Soil EC 1.4 mS, Frame, Pumps off): (1) electrode, (2) probe, (3) pod (ESP32-S3; samples soil, air temp/humidity/pressure, light as daily-light integral; absent sensor sends a sentinel, never a fake zero), (4) link (Bluetooth LE, 46-byte little-endian frame, CRC-16/CCITT-FALSE over bytes 0–43, Swift and Kotlin encoders byte-identical, stakes on a block form a mesh), (5) decision ("a verb, not a dashboard": compares to that crop's own band; starts dosing at the floor and stops at the target so it never chatters), (6) pumps (relay, pump A water, pump B feed for fertigation, ~11 s cycle, every dose logged with volume), (7) delivery (down the 4.5 mm bore to the root ball), (8) verify ("Did it work?": moisture back in band counts one verified plant-day; otherwise the app says so and stops instead of dosing again). Also: an embedded **film** (about 3:20, chapters: The gap 0:18, The probe 1:00, The stem 1:30, The tissue 1:57, A whole block 2:24, The pumps 2:54, In the app 3:18); block-level section ("A fungus needs weather, not luck": shared humidity, temperature band and wet canopy across a block; a block is only described when **at least 3 stakes from at least 2 accounts** have reported, k-anonymity enforced in the API and again in the database view; the needles read only their own plant and never detect a neighbour's fungus); an interactive byte-map of the 46-byte frame (payload bytes 0–43, CRC bytes 44–45); and the **tier rule**.
5. **The story / impact**: "Singapore counts what it plants." Animated seedling field (100% still growing, then "most go out"), count-up stats (3,043 surveyed, 70.9% want to grow, 23.6% tried and stopped, 860,000 packets, 314 plant-days), "What we don't claim" block, the IYEC 2026 entry card ("RootStake, entered in IYEC 2026. A printed sensor stake, a closed watering loop, and a tiered, honest account of what is measured."), and the team of five (data-driven list: Pranav Ramanathan, co-founder; Aashrith Reddy, co-founder; three placeholders to fill in). Closing line: "Count what we keep alive."

## 4. The honesty framework (make this visible across the site)
Every metric carries a tier badge:
- **BUILT**: soil moisture, soil EC, air temperature, humidity, pressure, light. Printed, wired, logged.
- **PROTOTYPE**: stem impedance (EIS) and the twin-pump loop. Work on the bench; direction, not calibrated figures.
- **ROADMAP**: nitrate, phosphate, potassium, sap flow (ion sensing). Simulated and labelled as such everywhere; the UI never shows them as measurements. Electro-culture ships off, logged as an A/B experiment.

"What we don't claim": Rooted won't solve food security, it aims to raise participation, knowledge and local growing; stem impedance is a prototype; ion sensing and sap flow aren't built; one stake can't detect a neighbour's fungus; electro-culture isn't a claim. Tone: "We'd rather be checked than impressed."

## 5. Design direction
- Editorial, calm, confident; large display type with one italic/accent word per headline, mono labels (e.g. "01 — The probe"), generous whitespace, thin rules, pill buttons.
- **Five switchable themes, each with light and dark mode**; the entire site re-skins when the user picks one (CSS variables via `data-skin` / `data-mode`):
  - **Glasshouse**: Newsreader serif + DM Mono; dark `#0E2E1F` bg, accent `#A3E68B`, warm `#ED9D76`; light `#F8F6F1` bg, accent `#0B5A32`.
  - **Nightsoil**: Bricolage Grotesque + Space Mono; dark `#0F0F0E`, accent `#C6FF3D`, warm `#FF7A2E`; light `#F4F3F0`, accent `#3F6E00`; square corners, dot grid.
  - **Kopi**: Fraunces + DM Mono; dark `#2A1A10`, accent `#FF9A5C`; light `#F6EFE2`, accent `#B8421A`; paper grain.
  - **Monsoon**: Outfit light weights + DM Mono; dark `#081A24`, accent `#5CE1E6`, warm `#FF8A7A`; light `#E9F1F3`, accent `#0A6E7A`; subtle falling-rain lines.
  - **Chalk**: Instrument Serif + Special Elite; dark `#1D211E`, accent `#F6E27A`, pink `#F4A6C0`; light `#F1EFE8`, accent `#2F6B3A`; dashed borders, chalk speckle.
- Motion: scroll-driven 3D (three.js) for the probe/module, sticky scroll scenes with step counters ("01 / 04"), split-text headline reveals, count-up numbers, snap-in connector animations in the system walkthrough.
- Responsive, accessible (contrast in all themes, reduced-motion fallback, keyboard focus), fast (lazy-load video and 3D).

## 6. Assets to request from the team (placeholders are fine until supplied)
App screenshots (index, garden/Pandan, market, buy, profile, biodex, settings), use-case photos (pandan, chilli, tomato, biodex), RootStake CAD exports (STL/GLB), the explainer film (mp4 plus poster), and the team names and roles.

## 7. Deliverable
A deployable static site (HTML/CSS/JS, no backend) with the five pages above, working theme/mode switcher, SEO titles and descriptions, and the sources footnote.
