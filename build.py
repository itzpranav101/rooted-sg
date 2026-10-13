import re,sys,json
head=open('_head.txt').read(); tail=open('_tail.txt').read()
CALLS=[('top','Two halves','PETG · no supports','.12-.34','110','0'),
('window','Moisture window','Resistive board, bevelled','.30-.58','-110','-10'),
('ec','Copper EC turns','Soil conductivity','.34-.58','110','-20'),
('tip','Chisel point','40 mm · saw teeth, 4 mm pitch','.36-.58','110','60'),
('mark','Soil-line mark','Same depth, every reading','.62-.86','110','-10'),
('bore','Fertigation bore','4.5 mm · exits at the nose','.66-.94','-110','40')]
CALLS2=[('top','Two halves','PETG · no supports','.11-.22','110','0'),('tip','Chisel point','40 mm · saw teeth, 4 mm pitch','.23-.43','110','60'),('window','Moisture window','Resistive board, bevelled','.31-.44','-110','-10'),('ec','Copper EC turns','Soil conductivity','.33-.44','110','-20'),('bore','Fertigation bore','4.5 mm · exits at the nose','.46-.56','110','40'),('window','Resistive board','Tines through the window','.58-.67','-110','-10'),('ph','pH electrode','Glass bulb, own channel','.69-.78','-110','-10'),('mark','Soil-line mark','Same depth, every reading','.79-.9','110','-10')]
def callouts(CALLS=CALLS):
    s='<div class="callouts"><svg>'+''.join('<line x1="0" y1="0" x2="0" y2="0" style="opacity:0"/><circle r="3.5" style="opacity:0"/>' for _ in CALLS)+'</svg>'
    s+=''.join(f'<div class="call" data-anchor="{a}" data-show="{sh}" data-dx="{dx}" data-dy="{dy}"><span>{t}</span><b>{b}</b></div>' for a,t,b,sh,dx,dy in CALLS)
    return s+'</div>'
# svg lines/circles order: render lines then circles separately => scenes.js maps lines[i]/dots[i]
pages={'index':('home','Meco by Rooted SG | Measure + Eco. Count what we keep alive','The Meco bundle (Measure + Eco) is the RootStake sensor module and the Rooted SG app, built in Singapore to prove a plant is still alive. Don\'t count what we plant. Count what we keep alive.'),
'app':('app','The app | Rooted SG','Garden, Market, Quests and BioDex. The Rooted SG iOS app, in real footage.'),
'rootstake':('rootstake','RootStake | Rooted SG','The real CAD of RootStake, in 3D: a printed probe that reads the soil and waters the roots.'),
'how-it-works':('how','How it works | Rooted SG','Why we built Meco after listening to our grandparents and their friends, and how one reading goes from the plant to the phone and back to the roots.'),
'impact':('impact','The story | Rooted SG','Singapore counts what it plants, not what it keeps alive. The survey, the gap, and the team of five.')}
for name,(pg,title,desc) in pages.items():
    try: body=open(f'_src/{name}.body.html').read()
    except FileNotFoundError: continue
    body=body.replace('{{CALLOUTS}}',callouts()).replace('{{CALLOUTS2}}',callouts(CALLS2))
    html=head.replace('{title}',title).replace('{desc}',desc).replace('{page}',pg)+body+tail
    open(f'{name}.html','w').write(html)
    print('built',name)
