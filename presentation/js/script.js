/* ROOTED SG · Catalyst Challenge pitch — the script.
   One line = one click. Every animation on screen is fired by the line it belongs to.
   55 lines · planned to 9:00.

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
  ['P', 'hook', 'Selection', 'Singapore cannot feed itself. Not today, and not if we keep growing the way we do. But what if the farm we need is already here, on a million balconies?', 1.4, 'Title, then the city skyline lights up'],
  ['P', 'cold', 'Selection', 'Ninety percent of the food on your plate tonight came from somewhere else. By ship, by truck, by plane. We do not control a single one of those journeys.', 0.8, '90% imported, with ship, truck and plane'],
  ['P', 'cold', 'Selection', 'I\'m Pranav, and with Aashrith, Isha and Anandita, we are Rooted SG. We are students, and we decided this problem was ours to solve.', 0.8, 'The four team cards'],
  ['P', 'cold', 'Selection', 'Our food comes from one hundred and eighty-seven countries and regions. Every one of them is another point of failure out of our control.', 1.0, '187 supply lines; some are cut in red'],
  ['P', 'gap', 'Selection', 'So the country set a goal. By 2035, grow twenty percent of our vegetables, sprouts and mushrooms locally. Today, it is about eight.', 0.6, '8% today vs the 20% target'],
  ['P', 'gap', 'Selection', 'And it is handing people the tools: eight hundred and sixty thousand free seed packets, over two thousand allotment plots, over two thousand community gardens.', 0.8, 'Three stat cards and a field of seed dots'],
  ['P', 'gap', 'Selection', 'Hundreds of thousands of chances to grow. Yet one number does not exist: how many of those plants are still alive. Singapore counts what it plants, not what it keeps alive.', 1.2, 'Sprouts fade, then a big 0'],
  ['P', 'hero', 'Selection', 'That gap is our opportunity. Rooted SG is the first way to measure it: an app where every single point is earned by a real, living plant.', 0.8, 'Hero: Don\'t count what we plant'],
  ['A', 'hero', 'Selection', 'Thanks, Pranav. But statistics only tell you what is happening, not why. So we ran our own nationwide survey, and three thousand and forty-three Singapore residents answered.', 1.0, 'Hero stays on screen'],

  // ───────── AASHRITH · selection and analysis ─────────
  ['A', 'survey', 'Selection', 'We ran that survey before writing a single line of code, because the problem had to come from real people, not from us.', 0.6, '3,043 card and the 100-dot grid'],
  ['A', 'survey', 'Analysis', 'Seventy point nine percent want to grow plants at home. So interest is not the problem. Singaporeans clearly want this.', 0.6, '70.9% card; dots turn green'],
  ['A', 'survey', 'Analysis', 'But fifty-one point two percent have stopped growing, or never started at all. That is the say-do gap, and it is enormous.', 1.0, '51.2% card; dots turn amber'],
  ['A', 'pareto', 'Analysis', 'So why do their plants die? We ranked every reason people gave us on a Pareto chart, and the answer surprised us.', 0.5, 'Empty Pareto chart'],
  ['A', 'pareto', 'Analysis', 'Forgetting, or no time: thirty-six point one percent. No one to ask: twenty-six point seven. Losing motivation: twenty-four percent.', 0.6, 'Bars grow one by one'],
  ['A', 'pareto', 'Analysis', 'Notice what is not at the top: space or money. People do not give up for lack of resources. And every feature we built answers one of these three causes.', 1.0, 'Space, money and pets crossed out'],
  ['A', 'whys', 'Analysis', 'Then we asked why, five times, digging down to the root. People forget because nothing reminds them. Nothing reminds them, because nobody can see the plant struggling.', 0.6, 'The root grows down, one why at a time'],
  ['A', 'whys', 'Analysis', 'That is what we discovered. When nobody notices a plant struggling, nobody steps in to help. And nobody tracks whether it survives.', 1.0, 'Root cause card'],
  ['A', 'national', 'Analysis', 'We also mapped what exists today. Every scheme counts inputs: packets sent, plots allotted, trees planted. None of them follows what happens next.', 0.6, 'Counted vs not counted list'],
  ['A', 'national', 'Analysis', 'Existing solutions keep track of people\'s habits, remind them to care for their plants, and encourage them to plant more. But none of them actually track whether the plants survive.', 1.0, 'Comparison table fills in'],
  ['A', 'target', 'Selection', 'So we set one measurable target: lift twelve-month plant survival from eighteen percent today to thirty percent. A twelve-point gain.', 0.6, 'Gauge moves from 18% to 30%'],
  ['A', 'target', 'Selection', 'One strict rule we\'ve set: if the pilot improves survival by less than five points, we won\'t scale it. Isha?', 1.2, 'Stopping-rule card'],

  // ───────── ISHA · the solution ─────────
  ['I', 'plantday', 'Solutions', 'Thanks, Aashrith. So we built Rooted SG to make survival visible, around one number: the verified Plant-Day. It only grows while your plant stays alive.', 0.6, 'Phone and the Plant-Day counter'],
  ['I', 'plantday', 'Solutions', 'A day earns its point in three steps. A real plant. A fresh photo. The right time. Miss any one, and nothing counts.', 0.6, 'Three checks tick, then +1'],
  ['I', 'plantday', 'Solutions', 'Cause number one was forgetting. So every morning, Mojo, our companion, tells you which plant needs you first. Once a day, timed to the weather.', 0.8, 'Mojo pops up with his reminder'],
  ['P', 'mojo', 'Solutions', 'And Mojo is more than just our mascot. Research shows that people connect with characters, stay engaged for longer, and feel motivated by small wins.', 0.6, 'Big Mojo and four research cards'],
  ['P', 'mojo', 'Solutions', 'So Mojo cheers when you check in, and worries when you ignore your plant. This makes plant care more engaging, giving users a reason to come back every day.', 0.8, 'Mojo reacts: happy, then worried'],
  ['I', 'doctor', 'Solutions', 'Cause number two was no one to ask. So when a leaf looks wrong, you open the Plant Doctor, and this is where we stop being a plant app.', 0.6, 'Garden zooms into one leaf'],
  ['I', 'doctor', 'Solutions', 'Because a fungus starts inside the leaf. Its threads spread through the cells for days, long before the leaf looks wrong to anyone.', 0.6, 'Inside the leaf: the fungus spreads'],
  ['I', 'doctor', 'Solutions', 'So you point your camera at the leaf. The app reads colour, fullness and light, and turns what it sees into clues.', 0.6, 'Camera focuses, snaps and scans'],
  ['I', 'doctor', 'Solutions', 'The AI finds the clues. You make the call. A human stays in the loop, and the fix becomes a step-by-step plan.', 0.8, 'Diagnosis and the step-by-step plan'],
  ['I', 'grow', 'Solutions', 'Cause number three was motivation. So we built the Guardian Path. We don\'t just identify diseases, we teach people to understand them, with streaks, levels and weekly leagues.', 0.6, 'Learning path, quiz card and streaks'],
  ['I', 'grow', 'Solutions', 'And then there is Roots, the part we are proudest of. For the first time in Singapore, the plants on your street can find each other.', 0.6, 'The Roots marketplace screens'],
  ['I', 'grow', 'Solutions', 'A neighbour with extra chillies can connect with one who\'s looking for seedlings. What one person has in excess becomes something another person can use.', 0.8, 'Chilli matched to a seedling'],
  ['I', 'grow', 'Solutions', 'You can sell it, swap it, or give it away for free. Neighbours who never spoke start sharing advice, cuttings and harvests, and a block becomes a community.', 0.8, 'Sell, swap and give-away cards'],
  ['I', 'pipeline', 'Solutions', 'But none of this works unless every Plant-Day is real. So underneath it all is serious technology, and Anandita will show you how it works.', 1.0, 'None of it works unless the data is real'],

  // ───────── ANANDITA · technology, implementation, the pilot ─────────
  ['N', 'pipeline', 'Solutions', 'Thank you, Isha. Every check-in photo runs through our own computer-vision pipeline, built in OpenCV and running directly on the phone.', 0.4, 'The photo-checking pipeline'],
  ['N', 'pipeline', 'Solutions', 'An Excess Green index finds the living plant. A perceptual hash catches a reused photo. Blur detection rejects a bad one. Together, these checks help prevent fake or unreliable submissions.', 0.8, 'Bad photos rejected, the real one passes'],
  ['N', 'model', 'Solutions', 'The Plant Doctor runs on our own trained model. We fine-tuned MobileNet classifiers on hundreds of thousands of labelled plant images.', 0.4, 'Training photos flow into the model'],
  ['N', 'model', 'Solutions', 'Then we compressed it to eight-bit and put it on the phone, with calibrated confidence. When it is unsure, it asks for a retake instead of guessing.', 0.8, '32 to 8 bit, then the confidence meter'],
  ['N', 'market', 'Solutions', 'Roots is built on trust. You can see each grower\'s track record through their verified Plant-Days. And locations stay at neighbourhood level, private by design.', 0.6, 'Neighbourhood map with growers'],
  ['N', 'market', 'Solutions', 'It also opens street by street, only once enough growers have joined, so nobody ever lands in an empty market. That is how a community grows itself.', 0.8, 'Map fills in street by street'],
  ['N', 'built', 'Solutions', 'We built it twice: native SwiftUI on iPhone and Jetpack Compose on Android. Seventy-one thousand lines of code, and 167 automated tests.', 0.6, 'Four build stat tiles'],
  ['N', 'built', 'Solutions', 'Then we tested it on people at home and in schools. We watched what they skipped, simplified confusing screens, and tested it again.', 0.8, 'Test, find, simplify, re-test loop'],
  ['N', 'pilot', 'Results', 'Then we ran a pilot for over three months: {users} people and {plants} real plants, every one checked in by photo, every day verified by the app.', 0.6, 'Pilot calendar, users and plants'],
  ['N', 'pilot', 'Results', 'Together they logged {plantDays} verified Plant-Days. Not self-reported. Every single one backed by a real plant and a fresh photo.', 0.6, 'Verified Plant-Days total'],
  ['N', 'pilot', 'Results', 'Remember the three causes. Against forgetting, {weekly} percent were still checking in every week, and {survival} percent of pilot plants were still alive.', 0.6, 'Check-in and survival rings'],
  ['N', 'pilot', 'Results', 'The Plant Doctor spotted {flags} problems before a single one of those plants was lost. And {trades} times, one neighbour passed a cutting or seedling to another through Roots.', 0.6, 'Problems caught and Roots trades'],
  ['N', 'pilot', 'Results', 'We tracked survival weekly on a control chart, so real improvement stands apart from noise.', 1.0, 'Control chart'],

  // ───────── PRANAV · results, the forecast, the close ─────────
  ['N', 'learn', 'Results', 'But the pilot gave us more than just numbers. It showed us how people actually use the app, where they struggle, and what keeps them coming back.', 0.6, '186 users flow into three lessons'],
  ['N', 'learn', 'Results', 'We learned which reminders bring people back, which problems the Plant Doctor sees most, and how fast a street starts trading. So how do we take this forward? Pranav.', 1.0, 'Lesson cards, then the question'],
  ['P', 'forecast', 'Results', 'Thank you, Anandita. We wanted concrete numbers, not hopes. That pilot data constantly retrains our machine-learning models, and feeds a forecast built on Monte Carlo simulation, Sobol analysis and more, run one hundred thousand times.', 0.6, 'Method list and 100,000 runs'],
  ['P', 'forecast', 'Results', 'The roll-out grows school by school. Two pilot schools first, twenty in year two, and sixty by year three, reaching seven thousand two hundred households.', 0.6, 'School roll-out bars'],
  ['P', 'forecast', 'Results', 'In our base case, that is 1,814 more plants alive after a year, and three point three million verified Plant-Days. Data Singapore has never had.', 0.8, '1,814 and 3.3M'],
  ['P', 'sustain', 'Results', 'And it lasts without us. The models run on the phone, schools run their own leagues, and every street on Roots keeps its own growers going.', 0.8, 'Three sustainability cards'],
  ['P', 'vision', 'Results', 'So picture 2035. Every block in Singapore growing something, and every living plant counted. That million-balcony farm, finally visible.', 1.0, 'The 2035 skyline lights up'],
  ['P', 'close', 'Results', 'Remember those eight hundred and sixty thousand seed packets? Imagine if next time, Singapore could see exactly how many of them grew.', 0.8, 'Field of sprouts'],
  ['P', 'close', 'Results', 'That is Rooted SG. Not just an app, but the first measure of a nation that grows. Built by students, proven by data, ready to scale.', 1.2, 'The first measure of a nation that grows'],
  ['P', 'close', 'Results', 'A plant never dies in a day. It dies from being forgotten. Singapore can no longer afford to forget. We will count every plant that lives, until this country grows its own future. We are Rooted SG. Thank you.', 2.0, 'Quote, then logo and Thank you']
];

/* Planned timing: words at a calm pitch pace, plus the pause, scaled to exactly 9:00. */
(function () {
  const TOTAL = 540, WPS = 2.25;
  const words = l => l[3].replace(/\{\w+\}/g, 'one hundred').split(/\s+/).length;
  const raw = SCRIPT.map(l => words(l) / WPS + l[4]);
  const k = TOTAL / raw.reduce((a, b) => a + b, 0);
  let t = 0;
  window.LINES = SCRIPT.map((l, i) => { const d = raw[i] * k, o = { i, who: l[0], scene: l[1], crit: l[2], text: l[3], click: l[5] || '', dur: d, speak: words(l) / WPS * k, at: t }; t += d; return o; });
})();

/* Fill {tokens} from PILOT. */
window.fillTokens = function (s, html = true) {
  return s.replace(/\{(\w+)\}/g, (m, k) => {
    const v = PILOT[k];
    if (v == null) return html ? `<mark class="todo">${k}</mark>` : `[${k}]`;
    return Number(v).toLocaleString('en-SG');
  });
};
