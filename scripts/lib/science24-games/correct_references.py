"""Apply the documented science/accessibility corrections to separate comparison copies."""
import json,pathlib,re,shutil
ROOT=pathlib.Path(__file__).resolve().parents[3];META=ROOT/'projects/science24-unit-a/meta/science24-games-v2';suite=json.loads((META/'suite.json').read_text());out=META/'comparison-references';changes=[]
for g in suite['games'][1:]:
 dest=out/g['id'];dest.mkdir(parents=True,exist_ok=True)
 shutil.copytree(ROOT/g['reference']/'03_ASSETS',dest/'03_ASSETS',dirs_exist_ok=True)
 for p in sorted((ROOT/g['reference']/'04_MOCKUPS/html').glob('*.html')):
  html=p.read_text();edits=['42px numeric/button controls become at least 44px; original shell/assets retained']
  html=html.replace('</style>','.btn,.numeric,select{min-height:44px}.numeric{height:44px}</style>')
  if g['id']=='B2' and p.name.startswith('06'):
   for a,b in [('3 × 12 W lamps for 4 h','4 × 9 W lamps for 5 h'),('180 W for 1.5 h','200 W for 2 h'),('0.400 kWh','0.500 kWh'),('150 W projector for 1.5 h','140 W projector for 2 h')]:assert a in html;html=html.replace(a,b)
   edits.append('B2-T01 retained, fresh equipment quantities/operating times/cap corrected; totals remain learner inputs')
  if g['id']=='C2' and p.name.startswith('03'):
   a='<div class="punnett"><div></div><div class="head">a</div><div class="head">a</div>'
   assert a in html;html=html.replace(a,a.replace('<div class="head">a</div>','<div class="head">A</div>',1));edits.append('Column gametes A,a; row gametes a,a, consistent with aa × Aa and cell values')
  if g['id']=='C2' and p.name.startswith('06'):
   start=html.index('<div class="pedigree">');end=html.index('<p>A fictional recessive',start)
   html=html[:start]+'<div class="pedigree"><div class="ped-row"><div class="person"><span class="person-shape filled"></span><span class="person-label">Parent 1: aa</span></div><div class="person"><span class="person-shape circle"></span><span class="person-label">Parent 2: dominant phenotype; genotype unknown</span></div></div></div>'+html[end:];html=html.replace('but no genotype test is available.','but no genotype test or offspring evidence is available.');edits.append('Remove resolving offspring evidence and contradictory Aa label; parents aa × unknown dominant phenotype')
  if g['id']=='D1' and p.name.startswith(('02','03','05')):
   speed,tr,brake,gap=(15,1,22.5,45) if p.name.startswith('03') else (20,1.5,40,80)
   if p.name.startswith('05'):html=html.replace('reaction time is 2.0 s','reaction time is 1.5 s').replace('gap is 75 m','gap is 80 m')
   tb=speed/5;end=tr+tb+1.5;top=max(gap,speed*tr+brake)
   points=[]
   for i in range(101):
    t=end*i/100;tau=min(max(t-tr,0),tb);x=speed*t if t<=tr else speed*tr+speed*tau-2.5*tau*tau;points.append(f'{42+437*t/end:.3f},{208-166*x/top:.3f}')
   def graph(match):
    svg=match.group(0);svg=re.sub(r'<polyline[^>]*>',f'<polyline points="{" ".join(points)}" fill="none" stroke="#1f6b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',svg);svg=re.sub(r'<circle[^>]*>','',svg);svg=svg.replace('aria-label="Distance-time graph"','aria-label="Distance-time graph with 5 metres per second squared braking, curved deceleration and horizontal stopped segment"');return svg
   html=re.sub(r'<svg class="graph".*?</svg>',graph,html,flags=re.S);edits.append('Independent 5 m/s² quadratic braking trace with horizontal stopped tail; P04 data uses its authored 1.5s/80m case')
  target=dest/'04_MOCKUPS/html'/p.name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(html);changes.append({'game':g['id'],'file':str(target.relative_to(META)),'original':str(p.relative_to(ROOT)),'corrections':edits})
(out/'CHANGE_REGISTER.json').write_text(json.dumps({'policy':'Original references unchanged. No functional-layout redesign or runtime-specific whole-panel mask is applied to these comparison copies.','files':changes},indent=2)+'\n')
print('Corrected comparison copies created; original references preserved:',len(changes),'HTML files.')
