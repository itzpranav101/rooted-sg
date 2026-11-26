/* ROOTED SG · Pitch Perfect — the script.
   One scene = one click; its lines play on their own, timed to the words. Every animation on screen is fired by the line it belongs to.
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
  P: { name: 'Pranav Ramanathan', short: 'Pranav', part: 'Rooted SG' },
  A: { name: 'Anandita Shetty', short: 'Anandita', part: 'Rooted SG' },
  I: { name: 'Pranav Menon', short: 'Pranav', part: 'Rooted SG' },
  N: { name: 'Jiya Shah', short: 'Jiya', part: 'Rooted SG' }
};

/* who · scene · criterion · text · pause (seconds of silence after the line) */
window.SCRIPT = [
  // ───────── PRANAV · the opening ─────────
  ['P', 'hook', 'Selection', 'Here\'s an uncomfortable fact. Singapore can\'t feed itself. But what if part of the answer is already sitting on a million balconies across the island?', 1.4],
  ['P', 'cold', 'Selection', 'Ninety percent of what\'s on your plate tonight came from somewhere else. It came by ship, by truck, or by plane. We don\'t control any of those journeys.', 0.8],
  ['P', 'cold', 'Selection', 'I\'m Pranav, and together with Anandita, Pranav and Jiya, we\'re Rooted SG. We\'re four students who decided this was our problem to solve.', 0.8],
  ['P', 'cold', 'Selection', 'Our food comes from one hundred and eighty-seven countries and regions. Every one of them is a point of failure, and none of them are in our hands.', 1.0],
  ['P', 'gap', 'Selection', 'So the government set a target. By 2035, it wants twenty percent of our vegetables, sprouts and mushrooms grown here. Right now, we\'re at about eight.', 0.6],
  ['P', 'gap', 'Selection', 'And it\'s giving people the tools to help. Eight hundred and sixty thousand free seed packets, over two thousand allotment plots, and over two thousand community gardens.', 0.8],
  ['P', 'gap', 'Selection', 'That\'s hundreds of thousands of chances to grow something. But nobody can tell you how many of those plants are still alive. Singapore counts what it plants, not what it keeps alive.', 1.2],
  ['P', 'hero', 'Selection', 'That gap is where we come in. Rooted SG is the first way to actually measure it: an app where you only earn points for a real, living plant.', 0.8],
  ['A', 'hero', 'Selection', 'Government numbers tell you what\'s happening, but not why. So we ran our own survey across Singapore, and three thousand and forty-three residents answered.', 1.0],

  // ───────── AASHRITH · selection and analysis ─────────
  ['A', 'survey', 'Selection', 'We did that before writing a single line of code. We wanted the problem to come from real people, not from us.', 0.6],
  ['A', 'survey', 'Analysis', 'Seventy point nine percent of them want to grow plants at home. So the interest is clearly there.', 0.6],
  ['A', 'survey', 'Analysis', 'But fifty-one point two percent have either given up or never started. We call that the say-do gap, and it\'s huge.', 1.0],
  ['A', 'pareto', 'Analysis', 'So why do their plants die? We put every reason they gave us on a Pareto chart, and the answer surprised us.', 0.5],
  ['A', 'pareto', 'Analysis', 'Forgetting or no time came first, at thirty-six point one percent. No one to ask was next, at twenty-six point seven. Then losing motivation, at twenty-four.', 0.6],
  ['A', 'pareto', 'Analysis', 'Notice what\'s missing from the top: space and money. People don\'t quit for lack of resources. Every feature we built goes after one of these three causes.', 1.0],
  ['A', 'whys', 'Analysis', 'Then we asked why, five times over, to dig down to the root. People forget because nothing reminds them, and nothing reminds them because nobody can see the plant struggling.', 0.6],
  ['A', 'whys', 'Analysis', 'So that\'s our root cause. Plants die because they\'re invisible. Nobody sees them struggling, and nobody counts the ones that make it.', 1.0],
  ['A', 'national', 'Analysis', 'We also looked at what already exists. Every scheme counts inputs, like packets sent, plots allotted and trees planted. None of them follows up on what happens next.', 0.6],
  ['A', 'national', 'Analysis', 'And we tried what\'s out there. Plant apps remind you. Habit apps give you streaks. Planting drives get things in the ground. Not one of them tracks whether the plant survives.', 1.0],
  ['A', 'target', 'Selection', 'So we set ourselves one measurable target: lift twelve-month plant survival from eighteen percent to thirty percent. That\'s a twelve-point jump.', 0.6],
  ['A', 'target', 'Selection', 'We also gave ourselves a rule. If the pilot beats the baseline by less than five points, we don\'t scale it up.', 1.2],

  // ───────── ISHA · the solution ─────────
  ['I', 'plantday', 'Solutions', 'So we built Rooted SG around one number we call the verified Plant-Day. It only goes up while your plant stays alive.', 0.6],
  ['I', 'plantday', 'Solutions', 'To earn a Plant-Day, you need three things. A real plant. A fresh photo. The right time. Miss one, and the day doesn\'t count.', 0.6],
  ['I', 'plantday', 'Solutions', 'The first cause was forgetting, so we made Mojo. Every morning, he tells you which plant needs you first. Just once a day, and timed to the weather.', 0.8],
  ['P', 'mojo', 'Solutions', 'Mojo isn\'t just there to look cute. Research from MIT, Stanford and Harvard shows people bond with characters, stay with them longer, and keep going because of small wins.', 0.6],
  ['P', 'mojo', 'Solutions', 'So when you check in, Mojo cheers. When a plant gets ignored, he visibly worries. He only nudges you once a day, so it feels like a friend checking in, not a chore.', 0.8],
  ['I', 'doctor', 'Solutions', 'The second cause was having no one to ask. So when a leaf looks wrong, you open the Plant Doctor. This is where Rooted SG stops being a normal plant app.', 0.6],
  ['I', 'doctor', 'Solutions', 'Most plant diseases start where you can\'t see them. A fungus can grow inside a leaf for days before anything looks wrong on the surface.', 0.6],
  ['I', 'doctor', 'Solutions', 'So you point your camera at the leaf. The app reads its colour, fullness and light, and turns what it sees into clues.', 0.6],
  ['I', 'doctor', 'Solutions', 'The AI finds the clues, but you make the call. You stay in control, and the fix becomes a simple step-by-step plan.', 0.8],
  ['I', 'grow', 'Solutions', 'The third cause was motivation, and that\'s where the Guardian Path comes in. We don\'t just identify diseases, we teach you to understand them, with streaks, levels and weekly leagues.', 0.6],
  ['I', 'grow', 'Solutions', 'Then there\'s Roots, the part we\'re proudest of. For the first time in Singapore, the plants on your street can find each other.', 0.6],
  ['I', 'grow', 'Solutions', 'Say one neighbour has too much chilli. Roots meets them with someone two doors down who needs a seedling. Surplus stops being waste, and a whole street starts growing together.', 0.8],
  ['I', 'grow', 'Solutions', 'You can sell it, swap it, or give it away for free. Neighbours who\'ve never spoken start sharing advice, cuttings and harvests, and a block turns into a community.', 0.8],
  ['I', 'pipeline', 'Solutions', 'But none of this works unless every Plant-Day is real. So there\'s some serious technology underneath.', 1.0],

  // ───────── ANANDITA · technology, implementation, the pilot ─────────
  ['N', 'pipeline', 'Solutions', 'Every check-in photo goes through our own computer-vision pipeline. We built it in OpenCV, and it runs right on the phone.', 0.4],
  ['N', 'pipeline', 'Solutions', 'An Excess Green index finds the living plant. A perceptual hash catches a reused photo. Blur detection throws out a bad one. You can\'t fake a Plant-Day.', 0.8],
  ['N', 'model', 'Solutions', 'The Plant Doctor runs on our own trained model. We fine-tuned MobileNet classifiers on hundreds of thousands of labelled plant images.', 0.4],
  ['N', 'model', 'Solutions', 'Then we shrank it down to eight-bit so it runs on the phone, with calibrated confidence. When it isn\'t sure, it asks you for a retake instead of guessing.', 0.8],
  ['N', 'market', 'Solutions', 'Roots runs on trust. Every listing shows the grower\'s verified Plant-Days, so you know who can actually keep a plant alive. And we only ever show the neighbourhood level, never an address.', 0.6],
  ['N', 'market', 'Solutions', 'It also opens street by street, once enough growers have joined, so nobody walks into an empty market. That\'s how a community grows itself.', 0.8],
  ['N', 'built', 'Solutions', 'We built the app twice, natively, with SwiftUI on iPhone and Jetpack Compose on Android. That\'s over seventy-one thousand lines of code and 167 automated tests.', 0.6],
  ['N', 'built', 'Solutions', 'Then we put it in real hands. We ran sessions at homes and schools, watched where people got stuck, simplified those screens, and tested again.', 0.8],

  // ───────── ROOTSTAKE · a feasible, working prototype (4 scenes) ─────────
  ['P', 'rs1', 'Solutions', 'The app verifies a plant with a photo. RootStake is the next step, and it\'s in progress: a small stake that goes in the pot and measures what a photo can\'t see, the soil and the stem.', 0.6],
  ['P', 'rs1', 'Solutions', 'This is the one we built. A house module with an ESP32-S3, a relay and a solar roof, wired to a soil probe, with a tube that carries water down to the roots.', 0.6],
  ['P', 'rs1', 'Solutions', 'We\'re clear about where it stands. The house, the soil probe and the tube are built. The stem electrode is in progress, and ion sensing is next.', 0.8],
  ['P', 'rs2', 'Solutions', 'The soil probe is one printed part with a lot inside. It prints in two halves with no supports, and it took fourteen iterations to get the point right.', 0.5],
  ['P', 'rs2', 'Solutions', 'A resistive moisture fork lies between the halves. A thin tube drops into its own channel, and a slim pH electrode sits beside it.', 0.5],
  ['P', 'rs2', 'Solutions', 'Close it, and everything fits. Pushed in to the mark, it reads from the same depth every time, and the tube exits at the nose, so water reaches the roots, not the dry crust.', 0.8],
  ['P', 'rs3', 'Solutions', 'The stem electrode is a small clip with two extremely thin titanium micro-needles. They slip through the outer skin of the stem, about a pinprick each, and stop in the conducting tissue.', 0.5],
  ['P', 'rs3', 'Solutions', 'A tiny alternating current runs between them. At one kilohertz it can\'t cross a cell membrane, so it winds around the cells. At a hundred kilohertz it goes straight through them.', 0.5],
  ['P', 'rs3', 'Solutions', 'The gap between the two tells us how healthy the tissue is. It\'s a trend, not a calibrated number, so we only raise it when the soil and air sensors agree.', 0.8],
  ['P', 'rs4', 'Solutions', 'Now zoom out. One module sits on one plant in a whole field. It reads that plant, and the weather everyone shares.', 0.5],
  ['P', 'rs4', 'Solutions', 'When a fungus takes hold, it grows through the gaps between the cells and plugs the plant\'s own vessels. The membranes leak, and the low-frequency end of the signal falls, before the leaf looks wrong.', 0.5],
  ['P', 'rs4', 'Solutions', 'One sentinel plant, warned early. It never claims to see a neighbour\'s leaf: the block-wide warning comes from shared weather, and the app does the rest.', 0.8],
  ['N', 'pilot', 'Results', 'Then we ran a pilot for over three months, with {users} people and {plants} real plants. Every check-in was a photo, and every day was verified by the app.', 0.6],
  ['N', 'pilot', 'Results', 'Together they logged {plantDays} verified Plant-Days. None of it self-reported. Every one is backed by a real plant and a fresh photo.', 0.6],
  ['N', 'pilot', 'Results', 'Remember the three causes? On forgetting, {weekly} percent of users were still checking in every week, and {survival} percent of the plants were still alive at the end.', 0.6],
  ['N', 'pilot', 'Results', 'On having no one to ask, the Plant Doctor caught {flags} problems before any of those plants died. And neighbours passed on cuttings and seedlings {trades} times through Roots.', 0.6],
  ['N', 'pilot', 'Results', 'We tracked survival every week on a control chart, so we can tell a real improvement from random noise.', 1.0],

  // ───────── PRANAV · results, the forecast, the close ─────────
  ['N', 'learn', 'Results', 'Those {users} users gave us a lot more than numbers. Every check-in, every diagnosis and every trade showed us how people actually grow.', 0.6],
  ['N', 'learn', 'Results', 'We learned which reminders bring people back, which problems the Plant Doctor sees most, and how fast a street starts trading. So where do we go from here?', 1.0],
  ['P', 'forecast', 'Results', 'We wanted real numbers, not guesses. The pilot data keeps retraining our machine-learning models, and it feeds a forecast built on Monte Carlo simulation, Sobol analysis and more, which we ran one hundred thousand times.', 0.6],
  ['P', 'forecast', 'Results', 'We\'d roll it out school by school. Two pilot schools first, then twenty in year two, and sixty by year three. That\'s about seven thousand two hundred households.', 0.6],
  ['P', 'forecast', 'Results', 'In our base case, that\'s 1,814 more plants still alive after a year, and three point three million verified Plant-Days. Singapore has never had data like that.', 0.8],
  ['P', 'sustain', 'Results', 'And it keeps going without us. The models run on the phone, schools run their own leagues, and every street on Roots keeps its own growers going.', 0.8],
  ['P', 'vision', 'Results', 'So picture Singapore in 2035. Every block growing something, and every living plant counted. That million-balcony farm, finally visible.', 1.0],
  ['P', 'close', 'Results', 'Remember those eight hundred and sixty thousand seed packets? Imagine if next time, we could actually see how many of them grew.', 0.8],
  ['P', 'close', 'Results', 'That\'s what Rooted SG is for. It\'s the first real measure of a nation that grows its own food, built by students and backed by data.', 1.2],
  ['P', 'close', 'Results', 'A plant never dies in a day. It dies from being forgotten. Singapore can\'t afford to forget anymore, so we\'ll count every plant that lives, until this country grows its own future. We\'re Rooted SG. Thank you.', 2.0]
];

/* Planned timing: words at a calm pitch pace, plus the pause, scaled to exactly 9:00. */
(function () {
  const WPS = 2.25;
  const words = l => l[3].replace(/\{\w+\}/g, 'one hundred').split(/\s+/).length;
  const raw = SCRIPT.map(l => words(l) / WPS + l[4]);
  const k = 0.72;
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
