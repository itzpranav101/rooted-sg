import re,sys,json
head=open('_head.txt').read(); tail=open('_tail.txt').read()
CALLS=[('top','Two halves','PETG · no supports','.12-.34','110','0'),
('window','Moisture window','Resistive board, bevelled','.30-.58','-110','-10'),
('ec','Copper EC turns','Soil conductivity','.34-.58','110','-20'),
('tip','Chisel point','40 mm · saw teeth, 4 mm pitch','.36-.58','110','60'),
('mark','Soil-line mark','Same depth, every reading','.62-.86','110','-10'),
('bore','Fertigation bore','4.5 mm · exits at the nose','.66-.94','-110','40')]
def callouts():
    s='<div class="callouts"><svg>'+''.join('<line x1="0" y1="0" x2="0" y2="0" style="opacity:0"/><circle r="3.5" style="opacity:0"/>' for _ in CALLS)+'</svg>'
    s+=''.join(f'<div class="call" data-anchor="{a}" data-show="{sh}" data-dx="{dx}" data-dy="{dy}"><span>{t}</span><b>{b}</b></div>' for a,t,b,sh,dx,dy in CALLS)
    return s+'</div>'
# svg lines/circles order: render lines then circles separately => scenes.js maps lines[i]/dots[i]
pages={'index':('home','ROOTED SG — Count what we keep alive','Rooted SG: a Singapore growing app, and RootStake, the sensor stake that proves your plant is still alive.'),
'app':('app','The app — Rooted SG','Garden, Market, Quests and BioDex. The Rooted SG iOS app, in real footage.'),
'rootstake':('rootstake','RootStake — Rooted SG','The real CAD of RootStake, in 3D: a printed probe that reads the soil and waters the roots.'),
'how-it-works':('how','The system — Rooted SG','Follow one reading from the plant stem to the phone and back to the roots: electrode, probe, pod, Bluetooth, pumps and nutrition.'),
'impact':('impact','The story — Rooted SG','Singapore counts what it plants, not what it keeps alive. The survey, the gap, and the team of five.')}
for name,(pg,title,desc) in pages.items():
    try: body=open(f'_src/{name}.body.html').read()
    except FileNotFoundError: continue
    body=body.replace('{{CALLOUTS}}',callouts())
    html=head.format(title=title,desc=desc,page=pg)+body+tail
    open(f'{name}.html','w').write(html)
    print('built',name)
