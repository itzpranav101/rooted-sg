/* ROOTED SG · Catalyst Challenge pitch — the script.
   One line = one click. Every animation on screen is fired by the line it belongs to.
   48 lines · Pranav 14 · Aashrith 12 · Isha 10 · Anandita 12 · planned to 9:00.

   The thread that ties it together: what Singapore counts (imports, packets, plots) vs what nobody counts (survival),
   and the three causes (forgetting · no one to ask · motivation) → three features → three pilot results.

   PILOT: the pilot figures shown on the slides and spoken in the script. Edit them here; slides and script update together. */
window.PILOT = {
  users: 186,          // people who took part
  plants: 412,         // real plants registered
  plantDays: 28960,    // verified Plant-Days logged
  survival: 82,        // % of pilot plants alive at the end
  weekly: 74,          // % of users still checking in every week
  flags: 137,          // problems the Plant Doctor flagged early
  trades: 96,          // trades completed on Roots
  weeks: 13,           // length of the pilot in weeks
  curve: [100, 99, 97, 96, 94, 93, 91, 90, 88, 87, 85, 84, 82]  // weekly survival %
};

window.SPEAKERS = {
  P: { name: 'Pranav Ramanathan', short: 'Pranav', part: 'Opening · The future' },
  A: { name: 'Aashrith Reddy', short: 'Aashrith', part: 'The problem' },
  I: { name: 'Isha Kottakalathil', short: 'Isha', part: 'The app' },
  N: { name: 'Anandita Shetty', short: 'Anandita', part: 'Technology · The pilot' }
};

/* who · scene · criterion · text · pause (seconds of silence after the line) */
window.SCRIPT = [
  // ───────── PRANAV · the opening ─────────
  ['P', 'cold', 'Selection', 'June 2022. Malaysia stopped exporting chicken. Overnight, a third of Singapore\'s chicken imports disappeared, and chicken rice made the front page.', 0.8],
  ['P', 'cold', 'Selection', 'That week exposed a hard truth. Singapore imports more than ninety percent of its food, from one hundred and eighty-seven countries and regions.', 1.0],
  ['P', 'gap', 'Selection', 'So the country set a goal. By 2035, grow twenty percent of our vegetables, sprouts and mushrooms locally. Today, it is about eight.', 0.6],
  ['P', 'gap', 'Selection', 'And it is handing people the tools: eight hundred and sixty thousand free seed packets, over two thousand allotment plots, over two thousand community gardens.', 0.8],
  ['P', 'gap', 'Selection', 'Hundreds of thousands of chances to grow. Yet one number does not exist: how many of those plants are still alive. Singapore counts what it plants, not what it keeps alive.', 1.2],
  ['P', 'hero', 'Selection', 'That gap is our opportunity. We are Rooted SG, and we built the first way to measure it: an app where every point is earned by a real, living plant.', 0.8],
  ['P', 'hero', 'Selection', 'I\'m Pranav. With Aashrith, Isha and Anandita, we\'ll take you from the problem, to the app, to the technology, to our three-month pilot.', 0.6],
  ['P', 'hero', 'Selection', 'And we did not stop at government data. We went to the people, and asked three thousand and forty-three of them why their plants die. Aashrith.', 1.0],

  // ───────── AASHRITH · selection and analysis ─────────
  ['A', 'survey', 'Selection', 'Thank you, Pranav. Before we wrote a single line of code, we asked Singapore. Three thousand and forty-three residents answered our survey.', 0.6],
  ['A', 'survey', 'Analysis', 'Seventy point nine percent want to grow plants at home. So interest is not the problem. Singaporeans clearly want this.', 0.6],
  ['A', 'survey', 'Analysis', 'But fifty-one point two percent have stopped growing, or never started at all. That is the say-do gap, and it is enormous.', 1.0],
  ['A', 'pareto', 'Analysis', 'So why do their plants die? We ranked every reason people gave us on a Pareto chart, and the answer surprised us.', 0.5],
  ['A', 'pareto', 'Analysis', 'Forgetting, or no time: thirty-six point one percent. No one to ask: twenty-six point seven. Losing motivation: twenty-four percent.', 0.6],
  ['A', 'pareto', 'Analysis', 'Space and money barely register. Remember these three causes, because every feature we built answers one of them.', 1.0],
  ['A', 'whys', 'Analysis', 'Then we asked why, five times, digging down to the root. People forget because nothing reminds them. Nothing reminds them, because nobody can see the plant struggling.', 0.6],
  ['A', 'whys', 'Analysis', 'That is our root cause. Plants die of invisibility. Nobody sees one struggling, and nobody counts which ones survive.', 1.0],
  ['A', 'national', 'Analysis', 'We also mapped what exists today. Every scheme counts inputs: packets sent, plots allotted, trees planted. None of them follows what happens next.', 0.6],
  ['A', 'national', 'Analysis', 'We tested every existing option. Plant apps remind you. Habit apps keep streaks. Planting drives plant. Not one of them counts survival.', 1.0],
  ['A', 'target', 'Selection', 'So we set one measurable target: lift twelve-month plant survival from eighteen percent today to thirty percent. A twelve-point gain.', 0.6],
  ['A', 'target', 'Selection', 'And a rule that keeps us honest: if the pilot beats the baseline by less than five points, we do not scale. Isha.', 1.2],

  // ───────── ISHA · the solution ─────────
  ['I', 'plantday', 'Solutions', 'Thanks, Aashrith. So we built Rooted SG to make survival visible, around one number: the verified Plant-Day. It only grows while your plant stays alive.', 0.6],
  ['I', 'plantday', 'Solutions', 'A day earns its point in three steps. A real plant. A fresh photo. The right time. Miss any one, and nothing counts.', 0.6],
  ['I', 'plantday', 'Solutions', 'Cause number one was forgetting. So every morning, Mojo, our companion, tells you which plant needs you first. Once a day, timed to the weather.', 0.8],
  ['I', 'doctor', 'Solutions', 'Cause number two was no one to ask. So when a leaf looks wrong, you open the Plant Doctor, and this is where we stop being a plant app.', 0.6],
  ['I', 'doctor', 'Solutions', 'Because a fungus starts inside the leaf. Its threads spread through the cells for days, long before the leaf looks wrong to anyone.', 0.6],
  ['I', 'doctor', 'Solutions', 'So you point your camera at the leaf. The app reads colour, fullness and light, and turns what it sees into clues.', 0.6],
  ['I', 'doctor', 'Solutions', 'The AI finds the clues. You make the call. A human stays in the loop, and the fix becomes a step-by-step plan.', 0.8],
  ['I', 'grow', 'Solutions', 'Cause number three was motivation. So we built the Guardian Path, where we don\'t just identify diseases, we teach people to understand them.', 0.6],
  ['I', 'grow', 'Solutions', 'Every lesson earns streaks, levels and weekly leagues. And on Roots, our marketplace, neighbours trade what they grow, like a pandan cutting with 421 Plant-Days.', 0.6],
  ['I', 'pipeline', 'Solutions', 'But none of this works unless every Plant-Day is real. So underneath it all is serious technology, and Anandita will show you how it works.', 1.0],

  // ───────── ANANDITA · technology, implementation, the pilot ─────────
  ['N', 'pipeline', 'Solutions', 'Thank you, Isha. Every check-in photo runs through our own computer-vision pipeline, built in OpenCV and running directly on the phone.', 0.4],
  ['N', 'pipeline', 'Solutions', 'An Excess Green index finds the living plant. A perceptual hash catches a reused photo. Blur detection rejects a bad one. Nothing can be faked.', 0.8],
  ['N', 'model', 'Solutions', 'The Plant Doctor runs on our own trained model. We fine-tuned MobileNet classifiers on hundreds of thousands of labelled plant images.', 0.4],
  ['N', 'model', 'Solutions', 'Then we compressed it to eight-bit and put it on the phone, with calibrated confidence. When it is unsure, it asks for a retake instead of guessing.', 0.8],
  ['N', 'market', 'Solutions', 'Roots runs on that same trust data. Every listing carries the seller\'s verified record, and locations stay at neighbourhood level, private by design.', 0.8],
  ['N', 'built', 'Solutions', 'We built it twice: native SwiftUI on iPhone and Jetpack Compose on Android. Sixty-nine thousand lines of code, and 167 automated tests.', 0.6],
  ['N', 'built', 'Solutions', 'Then we put it in real hands. At homes and schools we watched what people skipped, simplified every confusing screen, and tested again.', 0.8],
  ['N', 'pilot', 'Results', 'Then we ran a pilot for over three months: {users} people and {plants} real plants, every one checked in by photo, every day verified by the app.', 0.6],
  ['N', 'pilot', 'Results', 'Together they logged {plantDays} verified Plant-Days. Not self-reported. Every single one backed by a real plant and a fresh photo.', 0.6],
  ['N', 'pilot', 'Results', 'Remember the three causes. Against forgetting, {weekly} percent were still checking in every week, and {survival} percent of pilot plants were still alive.', 0.6],
  ['N', 'pilot', 'Results', 'Against no one to ask, the Plant Doctor caught {flags} problems early. And against losing motivation, neighbours completed {trades} trades on Roots.', 0.6],
  ['N', 'pilot', 'Results', 'We tracked survival weekly on a control chart, so real improvement stands apart from noise. Now, Pranav will show you where this goes next.', 1.0],

  // ───────── PRANAV · results, the forecast, the close ─────────
  ['P', 'forecast', 'Results', 'Thank you, Anandita. A pilot is only the beginning. So we forecast the next three years, and ran our model one hundred thousand times.', 0.6],
  ['P', 'forecast', 'Results', 'We start with two schools. Then twenty. By year three, sixty schools, seven thousand two hundred households, and fifteen thousand plants tracked.', 0.6],
  ['P', 'forecast', 'Results', 'In our base case, that is 1,814 more plants alive after a year, and three point three million verified Plant-Days. Data Singapore has never had.', 0.8],
  ['P', 'sustain', 'Results', 'And it lasts without us. The models run on the phone, schools run their own leagues, and neighbours trade directly on Roots.', 0.8],
  ['P', 'close', 'Results', 'Remember those eight hundred and sixty thousand seed packets? Imagine if next time, Singapore could see exactly how many of them grew.', 1.0],
  ['P', 'close', 'Results', 'Our very first pandan? Still alive, day 194, and counting. Because a plant never dies in a day. It dies from being forgotten. We are Rooted SG. Thank you.', 2.0]
];

/* Planned timing: words at a calm pitch pace, plus the pause, scaled to exactly 9:00. */
(function () {
  const TOTAL = 540, WPS = 2.25;
  const words = l => l[3].replace(/\{\w+\}/g, 'one hundred').split(/\s+/).length;
  const raw = SCRIPT.map(l => words(l) / WPS + l[4]);
  const k = TOTAL / raw.reduce((a, b) => a + b, 0);
  let t = 0;
  window.LINES = SCRIPT.map((l, i) => { const d = raw[i] * k, o = { i, who: l[0], scene: l[1], crit: l[2], text: l[3], dur: d, speak: words(l) / WPS * k, at: t }; t += d; return o; });
})();

/* Fill {tokens} from PILOT. */
window.fillTokens = function (s, html = true) {
  return s.replace(/\{(\w+)\}/g, (m, k) => {
    const v = PILOT[k];
    if (v == null) return html ? `<mark class="todo">${k}</mark>` : `[${k}]`;
    return Number(v).toLocaleString('en-SG');
  });
};
