import re
def callouts(items):
    s='<div class="callouts"><svg>'+''.join('<line x1="0" y1="0" x2="0" y2="0" style="opacity:0"/><circle r="6" style="opacity:0"/>' for _ in items)+'</svg>'
    s+=''.join(f'<div class="call" data-anchor="{a}" data-show="{sh}" data-dx="{dx}" data-dy="{dy}">{t}<b>{b}</b></div>' for a,t,b,sh,dx,dy in items)
    return s+'</div>'
PROBE=[('top','Printed in two halves','PETG, no supports','.12-.28',150,0),('tip','Chisel point','40 mm, saw teeth','.22-.34',150,60),
('window','Moisture window','bevelled, over the fork','.34-.45',-150,-10),('ec','Copper EC turns','soil conductivity','.34-.45',150,-20),
('fork','Resistive fork','the YL-69 board','.45-.57',-150,0),('tube','4.5 mm tube','water and feed','.56-.68',-150,30),('ph','pH electrode','prototype','.57-.68',150,10),
('mark','Soil-line mark','same depth every time','.78-.9',150,-10),('bore','Exit at the nose','reaches the roots','.9-1.01',-150,40)]
TISSUE=[('epi','Epidermis','the outer skin','.0-.14',140,-10),('xyl','Xylem vessel','carries water','.0-.14',140,0),
('vac','Vacuole','holds the water','.14-.28',160,-60),('chl','Chloroplast','makes the sugar','.14-.28',160,40),('nuc','Nucleus','','.14-.28',-160,-50),
('wall','Cell wall','','.14-.28',170,0),('mem','Membrane','blocks low frequencies','.14-.28',-170,30),
('needle','Titanium needle tip','','.28-.42',150,-30),('gap','The gap between cells','low-frequency path','.42-.56',150,60),
('hyph','Hypha','','.7-.84',-150,-30),('app','Appressorium','','.7-.84',150,50),('mem','Leaking membrane','','.85-1.01',-170,30)]
SL=[]
def slide(inner,steps=0,ps=None,pin=False,play=None,bg=''):
    a=f' data-steps="{steps}"' if steps else ''
    a+=f' data-ps="{ps}" data-pin="1"' if ps else ''
    a+=f' data-play="{play}"' if play else ''
    SL.append(f'<section class="slide"{a}><div class="stage"{bg}>{inner}</div></section>')
def pos(l,t,w=None,h=None,extra=''):
    s=f'left:{l}px;top:{t}px;'
    if w: s+=f'width:{w}px;'
    if h: s+=f'height:{h}px;'
    return f'style="{s}{extra}"'
leaf='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11"/><path d="M12 11C12 6 8.5 3.5 4 4c0 4.5 3 7.5 8 7z"/><path d="M12 14c0-3.2 2.6-5.5 7-5.2 0 3.6-2.6 6-7 5.2z"/></svg>'
# ---------------------------------------------------------------- 1 title
slide(f'''
<div class="a" {pos(130,190)}><p class="eyebrow"><i>Pitch Perfect</i>Singapore · 2026</p></div>
<div class="h1" {pos(120,260,1000,420,'font-size:380px;letter-spacing:-.07em;line-height:.8')}>Meco</div>
<div class="a h4" {pos(130,720,1000)}>Measure <em>+</em> Eco <em>=</em> Meco</div>
<div class="a body" {pos(130,850,980)}>Pranav Ramanathan · Anandita Shetty<br>Pranav Menon · Jiya Shah</div>
<div class="a cv3" data-from="right" {pos(1150,90,690,900)}><canvas data-scene="probe" data-mode="loose"></canvas></div>''')
# ---------------------------------------------------------------- 2 the gap
slide(f'''
<div class="a eyebrow" {pos(120,110)}><i>01</i>The gap, in numbers</div>
<div class="a rule" {pos(120,330,1680)}></div>
<div class="stat" {pos(120,360,760)}><div class="num" data-count="860000">0</div><p class="a body" style="margin-top:30px;max-width:640px">free seed packets handed out since 2020</p></div>
<div class="stat" {pos(940,360,420)}><div class="num" style="color:var(--green)" data-count="0">0</div><p class="a body" style="margin-top:30px;max-width:380px">records of how many survived</p></div>
<div class="stat" {pos(120,720,760)} data-s="1"><div class="num" style="font-size:150px" data-count="3043">0</div><p class="body" style="margin-top:12px">Singapore residents we surveyed</p></div>
<div class="stat" {pos(940,720,420)} data-s="2"><div class="num" style="font-size:150px" data-count="70.9" data-suffix="%">0</div><p class="body" style="margin-top:12px">want to grow plants at home</p></div>
<div class="stat" {pos(1430,720,420)} data-s="3"><div class="num" style="font-size:150px;color:var(--green)" data-count="23.6" data-suffix="%">0</div><p class="body" style="margin-top:12px">tried, and stopped</p></div>''',steps=3)
# ---------------------------------------------------------------- 3 worries -> answers
shelf='''<svg viewBox="0 0 1500 260" width="1060" height="184"><path class="ln draw" d="M20 215 H1480"/><path class="ln draw" d="M130 215 V258"/><path class="ln draw" d="M1370 215 V258"/>'''
for i,x in enumerate([160,360,560,760]):
    shelf+=f'<path class="ln draw" d="M{x-48} 150 H{x+48} L{x+38} 215 H{x-38} Z"/><path class="ln draw" d="M{x} 150 V78 M{x} 100 L{x-32} 60 M{x} 90 L{x+30} 48"/>'
shelf+='<path class="ln draw" d="M1330 175 H1390 V210 H1330 Z M1390 185 H1410 V200 H1390"/><path class="ln draw" d="M1350 150 q-10 -14 0 -26 M1372 150 q-10 -14 0 -26"/></svg>'
slide(f'''
<div class="a eyebrow" {pos(120,100)}><i>02</i>We expanded</div>
<div class="h2" {pos(120,150,1500)}>Every worry became <em>an answer.</em></div>
<div class="bubble" data-s="1-9" {pos(120,330,640)}>Have I watered too much?</div>
<div data-s="1-9" {pos(790,355,100)}><svg viewBox="0 0 100 40" width="100" height="40"><path class="ln" d="M4 20 H88 M72 6 L90 20 L72 34"/></svg></div>
<div class="answer" data-s="1-9" {pos(920,320,880)}><b>Waters only when needed</b><span>moisture sensed, every dose logged</span></div>
<div class="bubble" data-s="2-9" {pos(120,500,640)}>Is it actually healthy?</div>
<div data-s="2-9" {pos(790,525,100)}><svg viewBox="0 0 100 40" width="100" height="40"><path class="ln" d="M4 20 H88 M72 6 L90 20 L72 34"/></svg></div>
<div class="answer" data-s="2-9" {pos(920,490,880)}><b>Proves it is alive</b><span>stem + soil, counted as plant-days</span></div>
<div class="bubble" data-s="3-9" {pos(120,670,640)}>Who can I share this with?</div>
<div data-s="3-9" {pos(790,695,100)}><svg viewBox="0 0 100 40" width="100" height="40"><path class="ln" d="M4 20 H88 M72 6 L90 20 L72 34"/></svg></div>
<div class="answer" data-s="3-9" {pos(920,660,880)}><b>Swaps with neighbours</b><span>the Market in the app, offer or ask</span></div>
<div {pos(840,850)} class="a">{shelf}</div>''',steps=3)
# ---------------------------------------------------------------- 4 Meco meaning
slide(f'''
<div class="h1 ctr" {pos(0,120,1920,360,'font-size:420px;color:var(--green);letter-spacing:-.07em;line-height:.85')}>Meco</div>
<div class="a body ctr" {pos(0,540,1920)}>measure <b>+</b> eco <b>=</b> <b style="color:var(--green)">meco</b></div>
<div class="a rule" {pos(160,680,1600)}></div>
<div class="a" {pos(160,720,500)}><p class="eyebrow">ME · measure</p><p class="body" style="margin-top:14px">Soil, air, light and the stem.</p></div>
<div class="a rulev" {pos(700,700,2,250)}></div>
<div class="a" {pos(740,720,500)}><p class="eyebrow">CO · eco</p><p class="body" style="margin-top:14px">The small ecosystem you look after.</p></div>
<div class="a rulev" {pos(1280,700,2,250)}></div>
<div class="a" {pos(1320,720,520)}><p class="eyebrow">MECO · the bundle</p><p class="body" style="margin-top:14px">The RootStake module + the Rooted SG app.</p></div>''')
# ---------------------------------------------------------------- 5 bundle
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>03</i>The bundle</div>
<div class="a card" data-from="left" {pos(110,170,540,760)}><p class="eyebrow" style="position:absolute;left:44px;top:38px">Half one · measures</p><div style="position:absolute;left:20px;top:80px;width:500px;height:400px"><canvas data-scene="pod" style="width:100%;height:100%"></canvas></div><p class="h4" style="position:absolute;left:44px;top:500px">RootStake module</p><ul class="tick" style="position:absolute;left:44px;top:590px;font-size:32px"><li>House module</li><li>Soil probe and tube</li><li>Stem electrode</li></ul></div>
<div class="h3 serif" data-s="1-9" {pos(662,430,80)}>+</div>
<div class="card" data-s="1-9" {pos(740,170,540,760)}><p class="eyebrow" style="position:absolute;left:44px;top:38px">Half two · counts</p><div class="ph" style="--w:190px;position:absolute;left:175px;top:88px"><div class="scr"><img class="on" src="media/app-pandan.jpg" alt=""></div></div><p class="h4" style="position:absolute;left:44px;top:500px;white-space:nowrap">Rooted SG app</p><ul class="tick" style="position:absolute;left:44px;top:590px;font-size:32px"><li>Garden and check-ins</li><li>Market and BioDex</li><li>Verified plant-days</li></ul></div>
<div class="h3 serif" data-s="2-9" {pos(1292,430,80)}>=</div>
<div class="card" data-s="2-9" {pos(1370,170,440,760,'box-shadow:0 40px 90px -40px rgba(20,40,28,.35),inset 0 0 0 4px var(--green)')}><p class="eyebrow" style="position:absolute;left:44px;top:38px">The bundle</p><div class="dotcircle" style="position:absolute;left:100px;top:110px;width:240px;height:240px"><span class="h2" style="font-size:96px;line-height:1">Meco</span></div><p class="h4" style="position:absolute;left:44px;top:420px;line-height:1.1">Measure, decide,<br>water, verify</p><ul class="tick" style="position:absolute;left:44px;top:560px;font-size:30px"><li>One loop</li><li>Used together</li></ul><p class="eyebrow" style="position:absolute;left:44px;top:690px;text-decoration:underline">heymeco.xyz</p></div>''',steps=2)
# ---------------------------------------------------------------- 6 hardware (system scene overview)
hw=[('One plant, one house, two probes.','The whole kit on one pot: a house module beside it, a soil probe in the soil, a stem electrode on the stem. Everything is real CAD.'),
('The soil probe.','A printed spade with a resistive moisture fork, two turns of copper for conductivity, and a 4.5 mm tube that waters the roots.'),
('The stem electrode.','Two extremely thin titanium micro-needles on a small clip. They sit in the stem and read how the tissue conducts.'),
('The house module.','An ESP32-S3 under a gable roof with two 70 mm solar panels and an air sensor. It reads everything and talks to the phone.'),
('Joined by wire and tube.','No arm, no clamp: a thin wire from the house to each probe, and the tube that carries water down the soil probe.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1010,300,820)}><p class="eyebrow">{i+1} of 5</p><p class="h3" style="margin:14px 0 24px">{t}</p><p class="body">{b}</p></div>' for i,(t,b) in enumerate(hw))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>04</i>The hardware</div>
<div class="a cv3" data-from="left" {pos(100,150,880,820)}><canvas data-scene="system"></canvas></div>{txt}''',steps=4,ps='.055,.278,.166,.39,.055')
# ---------------------------------------------------------------- 7 probe assembly
pr=[('Spade probe.','26.4 × 15.9 mm, 151 mm long. One part in the pot.'),('Printed in two halves.','Split face-up, no supports. Fourteen iterations to get the point right.'),('Chisel point.','A 40 mm toothed chisel on a 4 mm pitch, so it goes in by hand.'),('Moisture window and copper.','A bevelled window over the sensor, and two turns of bare copper that read conductivity.'),
('The fork slides in.','The resistive moisture fork lies on the board plane between the halves, its wires leaving out of the top.'),('Tube and pH electrode seat.','A 4.5 mm tube drops into the channel behind the fork. A slim pH electrode sits beside it (prototype).'),('Close it up.','Both halves close around everything. Seen through the shell, it all fits.'),('Push to the mark.','Every reading comes from the same depth.'),('Then it waters.','The tube exits at the centre of the nose, so water reaches the roots, not the dry crust.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1170,330,680)}><p class="eyebrow">{i+1} of 9</p><p class="h3" style="margin:14px 0 24px;font-size:62px">{t}</p><p class="body" style="font-size:34px">{b}</p></div>' for i,(t,b) in enumerate(pr))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>05</i>The soil probe, assembled</div>
<div class="a cv3" data-from="left" {pos(100,150,1020,830)}><canvas data-scene="probe" data-mode="story"></canvas>{callouts(PROBE)}</div>{txt}''',steps=8,ps='.06,.17,.28,.39,.5,.61,.72,.84,.96')
# ---------------------------------------------------------------- 8 two micro-needles (line art)
def leaf_path(x,y,dx,dy): return f'<path class="ln draw" d="M{x} {y} C{x+dx*.4} {y-60} {x+dx*.9} {y-70} {x+dx} {y+dy} C{x+dx*.7} {y+60} {x+dx*.3} {y+50} {x} {y}Z"/><path class="ln draw" d="M{x} {y} L{x+dx*.9} {y+dy*.5}"/>'
art='<svg viewBox="0 0 1000 760" width="1000" height="760">'
art+='<path class="ln draw" d="M20 600 H980"/>'+''.join(f'<path class="ln draw" d="M{x} 600 l-14 24" />' for x in range(60,980,60))
art+='<path class="ln draw" d="M60 360 L170 262 L280 360 Z M80 360 V530 H260 V360 M110 395 H200 V445 H110 Z"/><circle cx="225" cy="420" r="6" class="ln draw"/><path class="ln draw" d="M120 330 L170 292 L220 330"/>'
art+='<path class="ln draw" d="M345 540 H385 V670 L365 712 L345 670 Z M345 575 H385"/>'
art+='<path class="gn draw" d="M260 470 C310 470 330 480 365 540"/><path class="gn draw" d="M240 340 C340 250 480 235 600 262"/>'
art+='<path class="ln draw" d="M648 600 C628 480 656 380 626 290 C602 215 640 130 628 40"/><path class="ln draw" d="M660 600 C640 480 668 380 638 290 C614 215 652 130 640 40"/>'
art+=leaf_path(640,420,150,-40)+leaf_path(636,350,-150,-30)+leaf_path(630,170,140,-40)+leaf_path(626,110,-130,-30)+leaf_path(642,500,-140,-20)
art+='<rect class="ln draw" x="596" y="240" width="26" height="26"/><rect class="ln draw" x="652" y="240" width="26" height="26"/><path class="gn draw" d="M622 253 H652"/>'
art+=''.join(f'<path class="ln draw" d="M654 600 C{654+d} 650 {654+d*1.6} 690 {654+d*2} 740"/>' for d in (-60,-20,20,60))
art+='<text x="30" y="230">House module · ESP32-S3 · solar</text><path class="gn draw" d="M120 242 L160 290"/><text x="410" y="360">Wire</text><path class="gn draw" d="M440 372 L460 400"/><text x="190" y="745">Soil probe</text><path class="gn draw" d="M300 735 L350 700"/><text x="700" y="215">Stem electrode</text><path class="gn draw" d="M700 225 L676 244"/></svg>'
el=[('Two micro-needles <em>go in.</em>','The clip closes and the two extremely thin titanium needles slip through the outer skin of the stem, about a pinprick each, and stop in the conducting tissue.'),
('Why titanium, why so thin.','Two titanium micro-needles, far thinner than a pin, so the stem barely notices them. A clip holds them a fixed distance apart, so every reading has the same geometry.'),
('What it does.','It sends a tiny alternating current from one needle to the other and measures how hard the tissue pushes back. That push-back is called impedance.'),
('Why two frequencies.','Low frequencies cannot cross a living cell membrane, so they go around the cells. High frequencies pass through them. The gap between the two tells us how healthy the tissue is.'),
('What it is for.','When a plant loses water, or its cells start to leak, the low-frequency reading falls. That shows up before the leaves look different.'),
('And what it is not.','A trend and its timing, never a calibrated number, raised only when the soil and air sensors agree. It is a prototype.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1190,260,660)}><p class="eyebrow">{i+1} of 6</p><p class="h3" style="margin:14px 0 24px;font-size:62px">{t}</p><p class="body" style="font-size:34px">{b}</p></div>' for i,(t,b) in enumerate(el))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>06</i>The stem electrode</div>
<div class="a card" data-from="left" {pos(100,150,1050,780)}><div style="position:absolute;left:25px;top:10px">{art}</div></div>{txt}''',steps=5)
# ---------------------------------------------------------------- 9 inside the stem
ti=[('A slice through the stem.','Skin on the outside, rows of cells inside, water-carrying vessels below. This is what the needles go into.'),('One cell.','A wall, a membrane inside it, a big vacuole of water, a nucleus and the chloroplasts that make sugar.'),('The needles go in.','Two titanium tips stop in the tissue, a few cells apart, with fluid running in the gaps between the cells.'),
('1 kHz: around the cells.','The membrane blocks low frequencies, so the current has to wind through the gaps. Watch it follow the cell walls.'),('100 kHz: through the cells.','At high frequency the current passes straight through the membranes. The two readings differ by how intact the cells are.'),('Then a hypha arrives.','A fungal thread grows through the gaps, swells against a wall and pushes a peg in.'),('A leaking cell is an easier path.','The membrane stops holding its contents. Ions spill into the gaps, and the low-frequency end of the curve falls, while the leaf still looks fine.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1230,150,620)}><p class="eyebrow">{i+1} of 7</p><p class="h3" style="margin:14px 0 24px;font-size:58px">{t}</p><p class="body" style="font-size:33px">{b}</p></div>' for i,(t,b) in enumerate(ti))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>07</i>Inside the stem</div>
<div class="a cv3" data-from="left" {pos(100,150,1090,830)}><canvas data-scene="tissue"></canvas>{callouts(TISSUE)}<div class="eis"><span>Impedance, 1 to 100 kHz</span><canvas id="eis"></canvas></div><div class="hud" style="grid-template-columns:1fr 1fr"><div>Low-frequency end<b id="t-low">steady</b></div><div>Tissue<b id="t-state">intact</b></div></div></div>{txt}''',steps=6,ps='.04,.18,.32,.46,.6,.76,.95')
# ---------------------------------------------------------------- 10 farm
fa=[('A whole field.','Hundreds of plants, all alike. One of them carries a RootStake.'),('One module, one sentinel plant.','The house sits on one plant. Its electrode reads that plant only, and its air sensor reads the weather everyone shares.'),('The weather is shared.','Humidity and leaf wetness are about the same across a block, so one well-placed station speaks for the plants around it.'),('Then the fungus arrives.','Colonies take hold where the conditions allow. The risk grows across the field, but the module never claims to see a neighbour\'s leaf.'),('The sentinel is checked too.','When the sentinel\'s own tissue starts to change, the electrode sees it, and only then is it raised, with the weather agreeing.'),('Now look inside.','Next: the cells of that stem.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1230,200,620)}><p class="eyebrow">{i+1} of 6</p><p class="h3" style="margin:14px 0 24px;font-size:58px">{t}</p><p class="body" style="font-size:33px">{b}</p></div>' for i,(t,b) in enumerate(fa))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>08</i>One module, a whole farm</div>
<div class="a cv3" data-from="left" {pos(100,150,1090,830)}><canvas data-scene="farm"></canvas><div class="hud" style="grid-template-columns:1fr 1fr 1fr"><div>Humidity<b id="f-rh">62%</b></div><div>Block risk<b id="f-risk">low</b></div><div>Sentinel<b id="f-sent">normal</b></div></div></div>{txt}''',steps=5,ps='.04,.2,.4,.68,.88,.98')
# ---------------------------------------------------------------- 11 loop
lp=[('Sense: the stem.','The electrode sweeps 1 to 100 kHz through the stem. Prototype signal, trend only.'),('Sense: the soil.','Resistive moisture, plus copper turns for conductivity, which is how we watch the feed.'),('Pack: the house.','The ESP32-S3 samples everything, adds air and light, and packs one 46-byte frame with a CRC-16.'),('Send: Bluetooth.','The frame rides Bluetooth LE to the phone. Stakes on a block can mesh.'),('Decide: the app.','It answers in a verb: Water it now, or Nothing to do today. The command goes back down the same link.'),('Deliver: the pumps.','A relay closes, two small pumps merge at a Y into one line. It starts at the floor and stops at the target.'),('Deliver: the nose.','Water and feed run down the hidden bore and leave at the nose, at the root ball. Moisture climbs.'),('Verify.','If moisture recovered, it counts as a verified plant-day. If it did not, the app says so and does not dose again.')]
txt=''.join(f'<div data-s="{i}-{i}" {pos(1230,200,620)}><p class="eyebrow">{i+1} of 8</p><p class="h3" style="margin:14px 0 24px;font-size:58px">{t}</p><p class="body" style="font-size:33px">{b}</p></div>' for i,(t,b) in enumerate(lp))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>09</i>The loop</div>
<div class="a cv3" data-from="left" {pos(100,150,1090,830)}><canvas data-scene="system"></canvas><div class="hud"><div>Moisture<b id="hud-moist">31%</b></div><div>Soil EC<b id="hud-ec">1.4 mS</b></div><div>Frame<b id="hud-frame">—</b></div><div>Pumps<b id="hud-pump">off</b></div></div></div>{txt}''',steps=7,ps='.166,.28,.39,.5,.61,.72,.83,.97')
# ---------------------------------------------------------------- 12 app pills
caps=['Every pot, ordered so whatever needs you today is at the top.','Offer produce, or ask a neighbour. Singapore grows under 10% of what it eats.','Ten quests open at a time, each a small real action.','Four of seventeen species recorded. Discover Singapore.','Level 6, 314 verified plant-days, milestones from First Plant to Veteran.']
imgs=['pandan','market','index','biodex','profile']
names=['Garden','Market','Quests','BioDex','Profile']
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>10</i>The Rooted SG app</div>
<div class="h2" {pos(120,150,1100)}>Real screens, <em>real app.</em></div>
<div style="position:absolute;display:flex;flex-wrap:wrap;gap:20px;left:120px;top:420px;width:900px">{''.join(f'<span class="pill{" on" if i==0 else ""}" data-simg="{i}-{i}">{n}</span>' for i,n in enumerate(names))}</div>
{''.join(f'<p class="body" data-s="{i}-{i}" {pos(120,660,880)}>{c}</p>' for i,c in enumerate(caps))}
<div class="a ph" data-from="right" style="--w:430px;left:1230px;top:100px"><div class="scr">{''.join(f'<img data-simg="{i}-{i}" src="media/app-{m}.jpg" alt="" class="{"on" if i==0 else ""}">' for i,m in enumerate(imgs))}</div></div>''',steps=4)
# ---------------------------------------------------------------- 13 grow
slide(f'''
<div class="a eyebrow" {pos(120,100)}><i>11</i>Grow</div>
<div class="h2" {pos(120,150,1000)}>Every plant gets a history, <em>not a scan.</em></div>
<p class="a body" {pos(120,500,900)}>Rooted counts verified plant-days: a day only counts when the plant was checked in and still alive. Survival, plus recovery from a struggling period, is what earns a Legacy Plant.</p>
<div data-s="1-9" {pos(120,760,260)}><div class="num big-num" style="font-size:130px">194</div><p class="body">plant-days</p></div>
<div data-s="1-9" {pos(480,760,260)}><div class="num big-num" style="font-size:130px">12</div><p class="body">check-ins</p></div>
<div data-s="2-9" {pos(790,760,260)}><div class="num big-num" style="font-size:130px;color:var(--green)">5</div><p class="body">day streak</p></div>
<div class="a ph" data-from="right" style="--w:430px;left:1230px;top:100px"><div class="scr"><img class="on" src="media/app-pandan.jpg" alt=""></div></div>''',steps=2)
# ---------------------------------------------------------------- 14 tiers
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>12</i>What is real</div>
<div class="h2" {pos(120,140,1400)}>Every metric says how <em>real</em> it is.</div>
<div class="tier dark a" data-from="left" {pos(120,390,540,610)}><p class="eyebrow">Built</p><p class="h3" style="margin:12px 0 10px">6 sensors</p><p class="body" style="font-size:30px;margin-bottom:26px">On the stake you can print</p><ul class="tick" style="font-size:28px;gap:14px"><li>Soil moisture and conductivity</li><li>Air temperature, humidity, pressure</li><li>Light and daily-light integral</li><li>Every dose logged with its volume</li></ul></div>
<div class="tier light" data-s="1-9" {pos(690,390,540,610)}><p class="eyebrow">Prototype</p><p class="h3" style="margin:12px 0 10px">Stem EIS</p><p class="body" style="font-size:30px;margin-bottom:26px">Trend and timing only</p><ul class="tick" style="font-size:28px;gap:14px"><li><span>Two <span style="background:var(--green);color:#fff;padding:0 10px;border-radius:6px">titanium</span> needles on a sprung clip</span></li><li>1 kHz to 100 kHz sweep</li><li>Never a calibrated figure</li><li>Raised only when soil and air agree</li></ul></div>
<div class="tier light" data-s="2-9" {pos(1260,390,540,610)}><p class="eyebrow">Roadmap</p><p class="h3" style="margin:12px 0 10px">Ions</p><p class="body" style="font-size:30px;margin-bottom:26px">Not measured yet, and labelled</p><ul class="tick" style="font-size:28px;gap:14px"><li>Nitrate and phosphate sensing</li><li>Stem sap flow</li><li>Simulated values say so on screen</li><li>Electro-culture: off, an experiment</li></ul></div>''',steps=2)
# ---------------------------------------------------------------- 15 film
slide(f'''
<div class="a eyebrow" {pos(120,60)}><i>13</i>See it in motion</div>
<div class="a film" data-from="scale" {pos(210,120,1500,844)}><video preload="none" playsinline poster="media/film-poster.jpg"><source src="media/film.mp4" type="video/mp4"></video></div>
<div class="a body ctr" data-s="0-0" {pos(0,990,1920)}>Press <b>→</b> to play</div>''',steps=1,play=1)
# ---------------------------------------------------------------- 16 honesty
lim=[('Rooted will not solve food security.','It aims to raise participation, knowledge and local growing. Small household actions add up, but they are not a farm.'),('Stem impedance is a prototype.','It works on the bench. We report trend and timing, never a calibrated figure.'),('Ion sensing and sap flow are not built.','They sit on the roadmap and are labelled as simulated wherever they appear.'),('One stake cannot see a neighbour\'s fungus.','Block warnings come from shared weather. The electrode reads only its own plant.'),('Electro-culture is not a claim.','It ships off, logged as an experiment.')]
rows=''.join(f'<div class="limit" data-s="{i+1}-9" style="left:120px;top:{310+i*135}px;width:1680px"><p class="h4">{a}</p><p class="body" style="font-size:32px">{b}</p></div>' for i,(a,b) in enumerate(lim))
slide(f'''
<div class="a eyebrow" {pos(120,90)}><i>14</i>What we don't claim</div>
<div class="h2" {pos(120,140,1700,None,"font-size:92px")}>We would rather be <em>checked</em> than impressed.</div>{rows}''',steps=5)
# ---------------------------------------------------------------- 17 thanks
slide(f'''
<div class="h1 ctr" {pos(0,150,1920,420,'font-size:400px;color:var(--green);letter-spacing:-.07em;line-height:.85')}>Meco</div>
<p class="a h4 ctr" {pos(0,540,1920)}>Don't count what we plant. <em>Count what we keep alive.</em></p>
<p class="a body ctr" style="left:0;top:690px;width:1920px;font-size:40px">Pranav Ramanathan · Anandita Shetty · Pranav Menon · Jiya Shah</p>
<p class="a eyebrow ctr" style="left:0;top:800px;width:1920px;font-size:40px;text-decoration:underline">heymeco.xyz</p>''')
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meco — Pitch Perfect</title><meta name="description" content="Meco: the RootStake module and the Rooted SG app. Measure, decide, water, verify.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/deck.css">
<link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
</head><body><div class="deck">'''
chrome=f'''</div><div class="mark">{leaf}Meco</div><div class="count" id="count"></div><div class="prog" id="prog"><i></i></div>
<div class="nav l" id="navL"></div><div class="nav r" id="navR"></div>
<div class="hint" id="hint"><kbd>←</kbd><kbd>→</kbd> or your clicker to move through the slides</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="js/deck.js"></script><script type="module" src="js/scenes.js"></script></body></html>'''
open('index.html','w').write(head+'\n'.join(SL)+chrome)
print(len(SL),'slides')
