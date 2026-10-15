import re
head=open('_head.txt').read(); tail=open('_tail.txt').read()
pages={'index':('home','Rooted SG | Count what we keep alive','Rooted SG: a social plant-care app for Singapore where every point is earned by a real, living plant. Make survival measurable.'),
'problem':('problem','The problem | Rooted SG','Singapore counts what it plants, not what it keeps alive. What 466 people told us, the root cause, and what we chose to build.'),
'app':('app','The app | Rooted SG','Verified Plant-Days, Mojo, the AI Plant Doctor, verified check-ins, the Guardian Path and the Roots marketplace, on iPhone and Android.'),
'impact':('impact','Impact and pilot | Rooted SG','The arithmetic, the forecast, how we would know it worked, and the pilot-first roadmap from one class to one island.'),
'story':('story','About us | Rooted SG','It started at our grandparents\' tables. The team, the community and the months behind Rooted SG.')}
for name,(pg,title,desc) in pages.items():
    try: body=open(f'_src/{name}.body.html').read()
    except FileNotFoundError: continue
    html=head.replace('{title}',title).replace('{desc}',desc).replace('{page}',pg)+body+tail
    open(f'{name}.html','w').write(html); print('built',name)
