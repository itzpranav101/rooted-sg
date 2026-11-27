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
  ['P', 'hook', 'Selection', 'Singapore can\'t feed itself. We buy almost all our food from other countries. But what if some of it could be grown right here, on a million balconies?', 1.4, 'Title, then the city skyline lights up'],
  ['P', 'cold', 'Selection', 'Think about your dinner tonight. About ninety percent of it came from somewhere else, by ship, by truck, or by plane. We don\'t control any of that.', 0.8, '90% imported, with ship, truck and plane'],
  ['P', 'cold', 'Selection', 'I\'m Pranav, and with Aashrith, Isha and Anandita, we\'re Rooted SG. We\'re four students, and we decided to do something about this.', 0.8, 'The four team cards'],
  ['P', 'cold', 'Selection', 'Our food comes from one hundred and eighty-seven countries and regions. If even one of them closes its border or has a bad harvest, we feel it here.', 1.0, '187 supply lines; some are cut in red'],
  ['P', 'gap', 'Selection', 'That\'s why the government wants us to grow more of our own vegetables. The target is twenty percent by 2035. Right now, we grow about eight percent.', 0.6, '8% today vs the 20% target'],
  ['P', 'gap', 'Selection', 'And it\'s helping people start. It has given out eight hundred and sixty thousand free seed packets, over two thousand allotment plots, and over two thousand community gardens.', 0.8, 'Three stat cards and a field of seed dots'],
  ['P', 'gap', 'Selection', 'So lots of people have started growing. But nobody knows how many of those plants are still alive. Singapore counts what it plants, but not what it keeps alive.', 1.2, 'Sprouts fade, then a big 0'],
  ['P', 'hero', 'Selection', 'That\'s the gap we want to fill. Rooted SG is an app that counts the plants that are still alive. You only earn points when your real plant is still growing.', 0.8, 'Hero: Don\'t count what we plant'],
  ['A', 'hero', 'Selection', 'Thanks, Pranav. The government numbers tell us what\'s happening, but not why. So we ran our own survey, and three thousand and forty-three Singapore residents answered.', 1.0, 'Hero stays on screen'],

  // ───────── AASHRITH · selection and analysis ─────────
  ['A', 'survey', 'Selection', 'We did this before we wrote any code, because we wanted to hear the problem from real people first.', 0.6, '3,043 card and the 100-dot grid'],
  ['A', 'survey', 'Analysis', 'Seventy point nine percent said they want to grow plants at home. So people are definitely interested.', 0.6, '70.9% card; dots turn green'],
  ['A', 'survey', 'Analysis', 'But fifty-one point two percent have either stopped or never started. We call this the say-do gap. People want to grow, but they don\'t follow through.', 1.0, '51.2% card; dots turn amber'],
  ['A', 'pareto', 'Analysis', 'So we asked them why their plants died, and put every answer on a Pareto chart to see which reasons mattered most.', 0.5, 'Empty Pareto chart'],
  ['A', 'pareto', 'Analysis', 'Forgetting or not having time came first, at thirty-six point one percent. Next was having no one to ask, at twenty-six point seven. Then losing motivation, at twenty-four.', 0.6, 'Bars grow one by one'],
  ['A', 'pareto', 'Analysis', 'Space and money were much lower on the list. So the problem isn\'t resources. Everything we built goes after these top three causes.', 1.0, 'Space, money and pets crossed out'],
  ['A', 'whys', 'Analysis', 'Then we asked why five times to find the real root of the problem. People forget because nothing reminds them, and nothing reminds them because nobody can see the plant struggling.', 0.6, 'The root grows down, one why at a time'],
  ['A', 'whys', 'Analysis', 'So the root cause is simple. You can\'t see when a plant is in trouble, and no one is keeping count of which ones survive.', 1.0, 'Root cause card'],
  ['A', 'national', 'Analysis', 'We also looked at the current schemes. They track how many seed packets were sent, plots allotted and trees planted, but none of them check what happens after that.', 0.6, 'Counted vs not counted list'],
  ['A', 'national', 'Analysis', 'And we looked at the apps out there. Plant apps send reminders, habit apps give you streaks, and planting drives get plants in the ground. But not one of them tracks whether the plant survives.', 1.0, 'Comparison table fills in'],
  ['A', 'target', 'Selection', 'So we set one clear target. We want to raise the share of plants still alive after a year from eighteen percent to thirty percent.', 0.6, 'Gauge moves from 18% to 30%'],
  ['A', 'target', 'Selection', 'And we made a rule for ourselves. If our pilot doesn\'t improve survival by at least five points, we won\'t scale it up. Over to Isha.', 1.2, 'Stopping-rule card'],

  // ───────── ISHA · the solution ─────────
  ['I', 'plantday', 'Solutions', 'Thanks, Aashrith. So the heart of Rooted SG is something we call a verified Plant-Day. Your count only goes up while your plant is still alive.', 0.6, 'Phone and the Plant-Day counter'],
  ['I', 'plantday', 'Solutions', 'To get a Plant-Day, you need three things: a real plant, a fresh photo, and the right time. If one is missing, that day doesn\'t count.', 0.6, 'Three checks tick, then +1'],
  ['I', 'plantday', 'Solutions', 'To fix forgetting, we made Mojo. Every morning, he tells you which plant needs you most, but only once a day, and he times it to the weather.', 0.8, 'Mojo pops up with his reminder'],
  ['P', 'mojo', 'Solutions', 'We designed Mojo on purpose. Research from MIT, Stanford and Harvard shows people get attached to characters, use them for longer, and stay motivated through small wins.', 0.6, 'Big Mojo and four research cards'],
  ['P', 'mojo', 'Solutions', 'So when you check in, Mojo celebrates. When you forget a plant, he looks worried. It feels less like a chore and more like looking after a friend.', 0.8, 'Mojo reacts: happy, then worried'],
  ['I', 'doctor', 'Solutions', 'The second problem was having no one to ask. So if a leaf looks wrong, you open the Plant Doctor, and this is where our app gets really different.', 0.6, 'Garden zooms into one leaf'],
  ['I', 'doctor', 'Solutions', 'Most plant diseases start inside the leaf. A fungus can spread for days before you see anything on the outside.', 0.6, 'Inside the leaf: the fungus spreads'],
  ['I', 'doctor', 'Solutions', 'So you take a photo of the leaf. The app checks the colour, how full the leaf is, and the light, and turns that into clues.', 0.6, 'Camera focuses, snaps and scans'],
  ['I', 'doctor', 'Solutions', 'The AI suggests what might be wrong, but you decide. Then it gives you a simple step-by-step plan to fix it.', 0.8, 'Diagnosis and the step-by-step plan'],
  ['I', 'grow', 'Solutions', 'The third problem was motivation, so we built the Guardian Path. It teaches you about plant problems, like the one you just found, with streaks, levels and weekly leagues.', 0.6, 'Learning path, quiz card and streaks'],
  ['I', 'grow', 'Solutions', 'Then there\'s Roots, the part we\'re most proud of. It connects you with people on your street who grow plants too.', 0.6, 'The Roots marketplace screens'],
  ['I', 'grow', 'Solutions', 'Say your neighbour has too much chilli, and someone two doors down needs a seedling. Roots matches them, so extra plants get shared instead of thrown away.', 0.8, 'Chilli matched to a seedling'],
  ['I', 'grow', 'Solutions', 'You can sell your plants, swap them, or give them away for free. Neighbours start sharing tips, cuttings and harvests, and the block becomes a real community.', 0.8, 'Sell, swap and give-away cards'],
  ['I', 'pipeline', 'Solutions', 'But all of this only works if every Plant-Day is real. Anandita will show you how we make sure of that.', 1.0, 'None of it works unless the data is real'],

  // ───────── ANANDITA · technology, implementation, the pilot ─────────
  ['N', 'pipeline', 'Solutions', 'Thanks, Isha. Every check-in photo goes through our own image-checking system. We built it with OpenCV, and it runs on the phone itself.', 0.4, 'The photo-checking pipeline'],
  ['N', 'pipeline', 'Solutions', 'First, a colour test makes sure there\'s a real living plant. Then we check the photo hasn\'t been used before, and that it isn\'t blurry. So you can\'t cheat.', 0.8, 'Bad photos rejected, the real one passes'],
  ['N', 'model', 'Solutions', 'The Plant Doctor uses our own trained AI model. We trained it on hundreds of thousands of labelled plant photos.', 0.4, 'Training photos flow into the model'],
  ['N', 'model', 'Solutions', 'We then shrank it so it runs right on the phone. It also knows how sure it is, so if it isn\'t confident, it asks you to retake the photo instead of guessing.', 0.8, '32 to 8 bit, then the confidence meter'],
  ['N', 'market', 'Solutions', 'Roots is built on trust. Every listing shows how many Plant-Days the grower has, so you know they can actually keep plants alive. And we only show the neighbourhood, never your address.', 0.6, 'Neighbourhood map with growers'],
  ['N', 'market', 'Solutions', 'It also opens one street at a time, only when enough people have joined, so nobody joins an empty market. That\'s how the community grows on its own.', 0.8, 'Map fills in street by street'],
  ['N', 'built', 'Solutions', 'We built two separate apps, one for iPhone and one for Android. Together that\'s over seventy-one thousand lines of code, with 167 automated tests.', 0.6, 'Four build stat tiles'],
  ['N', 'built', 'Solutions', 'Then we tested it with real people at homes and schools, watched where they got stuck, made those screens simpler, and tested again.', 0.8, 'Test, find, simplify, re-test loop'],
  ['N', 'pilot', 'Results', 'Then we ran a pilot for over three months, with {users} people and {plants} real plants. Every check-in was a real photo, checked by the app.', 0.6, 'Pilot calendar, users and plants'],
  ['N', 'pilot', 'Results', 'Together they logged {plantDays} verified Plant-Days, and every single one was backed by a real plant and a fresh photo.', 0.6, 'Verified Plant-Days total'],
  ['N', 'pilot', 'Results', 'Going back to the three causes. For forgetting, {weekly} percent of users were still checking in every week, and {survival} percent of the plants were still alive.', 0.6, 'Check-in and survival rings'],
  ['N', 'pilot', 'Results', 'For having no one to ask, the Plant Doctor caught {flags} problems early. And neighbours passed on plants {trades} times through Roots.', 0.6, 'Problems caught and Roots trades'],
  ['N', 'pilot', 'Results', 'We tracked survival every week on a control chart, so we know the results are real and not just random.', 1.0, 'Control chart'],

  // ───────── PRANAV · results, the forecast, the close ─────────
  ['N', 'learn', 'Results', 'Those {users} users also taught us a lot. Every check-in, diagnosis and trade showed us how people really look after their plants.', 0.6, '186 users flow into three lessons'],
  ['N', 'learn', 'Results', 'We learned which reminders work best, which plant problems are most common, and how quickly neighbours start trading. So, what\'s next? Pranav.', 1.0, 'Lesson cards, then the question'],
  ['P', 'forecast', 'Results', 'Thanks, Anandita. We wanted real numbers, not guesses. The pilot data keeps improving our AI models, and we used it to run a Monte Carlo forecast, plus Sobol analysis and other methods, one hundred thousand times.', 0.6, 'Method list and 100,000 runs'],
  ['P', 'forecast', 'Results', 'Our plan is to grow school by school. Two schools first, then twenty in year two, and sixty by year three. That\'s about seven thousand two hundred households.', 0.6, 'School roll-out bars'],
  ['P', 'forecast', 'Results', 'In our base case, that means 1,814 more plants still alive after a year, and three point three million verified Plant-Days. No one in Singapore has data like that.', 0.8, '1,814 and 3.3M'],
  ['P', 'sustain', 'Results', 'And it can keep running without us. The AI runs on the phone, schools run their own leagues, and each street on Roots keeps its own growers going.', 0.8, 'Three sustainability cards'],
  ['P', 'vision', 'Results', 'So imagine Singapore in 2035, with every block growing something, and every plant that\'s alive being counted.', 1.0, 'The 2035 skyline lights up'],
  ['P', 'close', 'Results', 'Remember those eight hundred and sixty thousand seed packets? Next time, we could actually know how many of them grew.', 0.8, 'Field of sprouts'],
  ['P', 'close', 'Results', 'That\'s why we built Rooted SG. It\'s the first real way to measure how much Singapore is growing, built by students and backed by data.', 1.2, 'The first measure of a nation that grows'],
  ['P', 'close', 'Results', 'A plant doesn\'t die in a day. It dies when people forget about it. Singapore can\'t afford to forget, so we\'ll count every plant that stays alive, and help this country grow its own future. We\'re Rooted SG. Thank you.', 2.0, 'Quote, then logo and Thank you']
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
