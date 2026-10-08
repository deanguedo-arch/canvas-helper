'use strict';

// Authored teaching diagrams for the scoped 2026-10-02 review candidate.
// This is an integration record, not a course regeneration owner.
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const C = {ink:'#192522',green:'#174c24',teal:'#087d75',amber:'#925900',border:'#cbd9d2',pale:'#edf5ef',warm:'#fff5e1',white:'#fff'};
const text = (x,y,s,size=28,color=C.ink,weight=400,anchor='middle') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const lines = (x,y,ss,size=28,color=C.ink,weight=400,anchor='middle') => ss.map((s,i)=>text(x,y+i*(size+8),s,size,color,weight,anchor)).join('');
const rect = (x,y,w,h,fill=C.white,stroke=C.border,r=5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const line = (x1,y1,x2,y2,color=C.teal,width=3,dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const arrow = (x1,y1,x2,y2,color=C.teal,width=4) => line(x1,y1,x2,y2,color,width)+`<path d="M ${x2-9} ${y2-12} L ${x2} ${y2} L ${x2+9} ${y2-12}" fill="none" stroke="${color}" stroke-width="${width}" transform="rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI-90} ${x2} ${y2})"/>`;
const box = (x,y,w,h,ss,fill=C.pale,size=28) => rect(x,y,w,h,fill)+lines(x+w/2,y+Math.max(38,(h-(ss.length-1)*(size+8))/2+size/3),ss,size);
const circle = (x,y,r,fill=C.teal) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
function svg(title,desc,height,body){ return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${height}" viewBox="0 0 600 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><style>text{font-family:'Work Sans',Arial,sans-serif}line,path,rect{stroke-linecap:round;stroke-linejoin:round}</style><rect width="600" height="${height}" fill="#fff"/>${body}</svg>\n`; }
function sequence(title,desc,steps){const H=steps.length*126+30;let b='';steps.forEach((ss,i)=>{b+=box(35,20+i*126,530,94,ss);if(i<steps.length-1)b+=arrow(300,114+i*126,300,139+i*126);});return svg(title,desc,H,b);}
const diagrams={};

diagrams['a-energy-levels']=svg('Energy changes across the reacting system','Exothermic: products have lower chemical energy than reactants and net energy leaves. Endothermic: products have higher chemical energy and net energy enters. Schematic, not measured.',430,
 text(155,40,'Exothermic',32,C.green,700)+text(450,40,'Endothermic',32,C.teal,700)+
 rect(18,65,270,330,C.pale)+rect(312,65,270,330,'#eff7f6')+
 text(155,108,'Reactants',28)+line(48,133,166,133,C.green,5)+arrow(252,142,252,292,C.amber)+lines(135,226,['Net energy','out'],28,C.amber,700)+line(48,314,166,314,C.green,5)+text(155,363,'Products',28)+
 text(450,108,'Products',28)+line(340,133,458,133,C.teal,5)+arrow(545,292,545,143,C.teal)+lines(429,226,['Net energy','in'],28,C.teal,700)+line(340,314,458,314,C.teal,5)+text(450,363,'Reactants',28)+text(300,418,'Higher on the page = more chemical energy',26));

diagrams['a-word-equation']=svg('Read a word equation','Magnesium plus oxygen produces magnesium oxide. The two starting substances are reactants; magnesium oxide is the product. The arrow indicates the direction of the reaction.',420,
 text(300,45,'Reactants: starting substances',30,C.green,700)+box(18,75,252,86,['magnesium'])+text(300,130,'+',42,C.teal,700)+box(330,75,252,86,['oxygen'])+
 arrow(300,171,300,237)+text(327,207,'produces',26,C.teal,400,'start')+box(145,252,310,92,['magnesium oxide'],C.warm)+text(300,393,'Product: substance formed',30,C.green,700));

diagrams['a-summary']=sequence('Connect the Unit A explanations','Material properties inform a choice. Chemical reactions form new substances. Word equations name substances; balanced formulas account for atoms. Energy is transferred across the system boundary. Evidence supports environmental and protection claims.',[
 ['Material properties','Choose a product for its job'],['Chemical change','Use evidence of new substances'],['Equations and atoms','Keep an account of matter'],['System and surroundings','Trace the net energy transfer'],['Environmental claims','Explain pathways and limitations']]);

diagrams['b-energy-account']=svg('Account for the whole energy input','100 joules enter a device. 35 joules leave as useful output and 65 joules as other outputs. 35 plus 65 equals 100; energy is conserved for this stated boundary.',490,
 box(95,20,410,87,['100 J input'],C.pale,32)+arrow(300,107,300,148)+box(170,155,260,80,['Device'],C.white,30)+
 arrow(245,235,157,298,C.teal,7)+arrow(355,235,447,298,C.amber,12)+
 box(18,308,270,116,['Useful output','35 J'],C.pale,29)+box(312,308,270,116,['Other outputs','65 J'],C.warm,29)+text(300,470,'35 J + 65 J = 100 J',32,C.green,700));

diagrams['b-power']=svg('Power is energy transferred per second','120 joules in half a minute: convert half a minute to 30 seconds, then divide 120 joules by 30 seconds to obtain 4 watts. One watt is one joule per second.',455,
 text(300,49,'Power = energy ÷ time',32,C.green,700)+box(55,85,490,90,['Energy transferred: 120 J'])+box(55,196,490,90,['Half a minute = 30 s'])+arrow(300,287,300,318)+box(55,335,490,88,['120 J ÷ 30 s = 4 W'],C.warm,32));

diagrams['b-respiration']=svg('Matter and energy in aerobic respiration','Glucose and oxygen become carbon dioxide and water. Chemical energy is transferred to cell processes and to thermal energy; it is not newly created.',480,
 box(45,20,510,86,['Glucose + oxygen'],C.pale,30)+arrow(300,107,300,148)+box(45,164,510,103,['Carbon dioxide + water'],C.white,29)+
 line(550,67,575,67,C.amber,4)+line(575,67,575,349,C.amber,4)+arrow(575,349,534,349,C.amber)+box(45,312,490,118,['Energy transferred to','cell processes + thermal energy'],C.warm,27)+text(300,465,'Matter changes; energy is transferred.',26));

diagrams['b-temperature']=svg('Feedback when the body cools','Receptors detect cooling, the nervous system coordinates a response, shivering and heat conservation oppose the change, and temperature moves toward its usual range. Feedback changes the response as conditions change.',580,
 box(38,20,492,96,['Receptors detect cooling'])+arrow(285,116,285,148)+box(38,150,492,96,['Brain coordinates a response'])+arrow(285,246,285,278)+
 box(38,280,492,108,['Shivering and heat conservation','oppose the cooling'])+arrow(285,388,285,423)+box(38,425,492,96,['Temperature moves','toward its usual range'])+
 line(530,473,560,473)+line(560,473,560,67)+arrow(560,67,533,67)+text(300,560,'Feedback adjusts the response.',26,C.teal,700));

diagrams['b-summary']=svg('Follow stored chemical energy through different pathways','Sunlight is stored by photosynthesis. Food can fuel cellular respiration. Ancient organic matter can become fossil fuels over geological time and release energy through combustion. Technologies convert energy into useful and other outputs.',710,
 box(105,20,390,86,['Sunlight'],C.warm,31)+arrow(300,106,300,143)+box(50,150,500,108,['Photosynthesis stores energy','in organic matter'])+
 arrow(220,258,150,315)+arrow(380,258,450,315)+box(20,328,260,112,['Food','Cellular respiration'])+box(320,328,260,112,['Ancient biomass','Fossil fuels'])+
 arrow(150,440,150,477)+arrow(450,440,450,477)+box(20,489,260,108,['Cell processes','and thermal energy'])+box(320,489,260,108,['Combustion','and thermal energy'])+
 text(300,650,'Technologies convert energy',29,C.green,700)+text(300,692,'into useful and other outputs.',27));

diagrams['c-food-safety']=sequence('Four complementary food-safety controls','Clean hands and tools; separate raw and ready-to-eat food; cook to a safe temperature; chill to slow microbial growth. These are prevention controls, not sterilization or a guarantee that unsafe food becomes safe.',[
 ['Clean','Hands, surfaces and tools'],['Separate','Raw and ready-to-eat food'],['Cook','Use an appropriate safe temperature'],['Chill','Slow microbial growth']]);

diagrams['c-methods']=svg('Match infection control to its target','Cleaning removes material. Disinfection reduces specified microbes on suitable non-living surfaces. Antisepsis reduces microbes on living tissue. Sterilization is a validated process eliminating viable microorganisms on equipment. Aseptic practice prevents contamination.',770,
 text(300,43,'Target and intended outcome',30,C.green,700)+
 box(25,75,550,116,['Cleaning','Remove visible material'],C.pale,28)+
 box(25,213,550,116,['Disinfection: suitable surfaces','Reduce specified microorganisms'],C.white,27)+
 box(25,351,550,116,['Antisepsis: living tissue','Use the product as directed'],C.pale,27)+
 box(25,489,550,138,['Sterilization: equipment','Validated elimination of','viable microorganisms'],C.white,27)+
 lines(300,685,['Aseptic practice prevents','contamination during a task.'],28,C.teal,700));

diagrams['c-baseline']=svg('Compare the same place and period','In the existing authored example, a town usually reports about two cases per week but reports 25 this week. This excess signals a need to investigate. It is not real surveillance data or proof of a pandemic.',490,
 text(300,44,'Reported cases in one week',30,C.green,700)+line(88,94,88,358,C.ink)+line(88,358,565,358,C.ink)+
 [0,10,20,30].map(n=>text(60,366-n*8.5,String(n),26)+line(88,358-n*8.5,565,358-n*8.5,C.border,1,'5 6')).join('')+
 rect(145,341,118,17,C.pale,C.teal,0)+text(204,326,'≈ 2',32,C.teal,700)+rect(380,145.5,118,212.5,C.pale,C.green,0)+text(439,131,'25',32,C.green,700)+
 lines(204,404,['Usual weekly','baseline'],26)+lines(439,404,['This week’s','reports'],26));

const groups=['O','A','B','AB']; const matches=[[true,true,true,true],[false,true,false,true],[false,false,true,true],[false,false,false,true]];
diagrams['c-abo']=svg('ABO red-cell compatibility','Rows are red-cell donors and columns are recipients. O cells are ABO-compatible with all four groups; A with A and AB; B with B and AB; AB with AB. Rh and other compatibility tests are not represented.',505,
 text(365,43,'Recipient ABO group',29,C.green,700)+text(78,116,'Donor',28,C.green,700)+
 groups.map((g,i)=>text(215+90*i,105,g,32,C.ink,700)).join('')+
 groups.map((g,i)=>text(78,175+75*i,g,32,C.ink,700)+groups.map((_,j)=>rect(173+90*j,129+75*i,84,69,matches[i][j]?C.pale:'#faf9f6')+text(215+90*j,175+75*i,matches[i][j]?'✓':'—',34,matches[i][j]?C.green:C.amber,700)).join('')).join('')+
 text(300,476,'Red cells only · Rh not shown',28,C.teal,700));

function bacteria(x,y,resistant=false){return `<g transform="translate(${x} ${y})"><rect x="-12" y="-27" width="24" height="54" rx="12" fill="${resistant?C.amber:C.teal}" transform="rotate(25)"/><circle r="4" fill="#fff"/></g>`;}
diagrams['c-resistance']=svg('Selection changes a bacterial population','A bacterial population contains some resistant bacteria before treatment. A suitable antibiotic removes susceptible bacteria; resistant survivors can reproduce. The treatment selects survivors rather than purposefully changing all bacteria.',650,
 text(300,42,'Before treatment',32,C.green,700)+text(300,83,'Resistance is already present in some.',26)+
 Array.from({length:8},(_,i)=>bacteria(70+i*65,140,i===2||i===6)).join('')+
 arrow(300,191,300,254)+text(340,227,'Antibiotic',26,C.teal,400,'start')+text(300,297,'Resistant survivors',30,C.green,700)+bacteria(245,353,true)+bacteria(355,353,true)+
 arrow(300,396,300,454)+text(340,432,'Reproduction',26,C.teal,400,'start')+text(300,494,'Later population',30,C.green,700)+
 Array.from({length:8},(_,i)=>bacteria(70+i*65,553,true)).join('')+text(300,622,'Selection, not a purposeful change.',26));

function bases(seq,y,marked=[]){const w=62,start=(600-seq.length*w)/2;return [...seq].map((g,i)=>rect(start+i*w+3,y,w-6,62,marked.includes(i)?C.warm:C.pale)+text(start+i*w+w/2,y+43,g,32,marked.includes(i)?C.amber:C.ink,700)).join('');}
diagrams['c-mutations']=svg('Compare three changes to a DNA sequence','The reference single-strand sequence is ACTGAC. Substitution gives ACAGAC, insertion gives ACGTGAC, and deletion gives ACGAC. These schematic changes do not by themselves determine the effect on an organism.',600,
 text(300,35,'Reference sequence',28,C.green,700)+bases('ACTGAC',52)+
 text(300,161,'Substitution: one base replaced',27,C.green,700)+bases('ACAGAC',179,[2])+
 text(300,288,'Insertion: one base added',27,C.green,700)+bases('ACGTGAC',306,[2])+
 text(300,415,'Deletion: one base removed',27,C.green,700)+bases('ACGAC',433)+
 text(300,564,'The effect depends on context.',27,C.teal,700));

diagrams['d-distance']=svg('A round trip has distance but zero displacement','A simplified round trip goes 800 metres from A to B and 800 metres back to A. Path distance is 1600 metres. Final and starting positions match, so displacement is zero.',440,
 box(25,30,175,85,['A: start'],C.pale)+box(400,30,175,85,['B: turn'],C.pale)+
 arrow(200,151,398,151,C.teal,4)+text(300,133,'800 m out',28,C.teal,700)+arrow(398,226,200,226,C.amber,4)+text(300,211,'800 m back',28,C.amber,700)+
 box(25,284,550,114,['Distance: 800 + 800 = 1600 m','Displacement: 0 m'],C.white,28));

function cycle(x,y){return `<g transform="translate(${x} ${y})" fill="none" stroke="${C.teal}" stroke-width="5"><circle cx="-45" cy="15" r="28"/><circle cx="55" cy="15" r="28"/><path d="M-45 15 L-13-30 L16 15 Z M-13-30 H36 L55 15 M16 15 L36-30 L31-48 M-24-33 H-5"/></g>`;}
function car(x,y){return `<g transform="translate(${x} ${y})"><path d="M-75 12 V-24 L-35-53 H33 L60-23 H79 V12 Z" fill="${C.pale}" stroke="${C.green}" stroke-width="4"/><path d="M-27-46 H28 L47-25 H-44 Z" fill="#b6d6cc"/><circle cx="-43" cy="14" r="16" fill="${C.ink}"/><circle cx="47" cy="14" r="16" fill="${C.ink}"/></g>`;}
diagrams['d-momentum']=svg('Compare momentum at the same velocity','Both simplified systems travel at plus five metres per second. A 70 kilogram model has momentum plus 350 kilogram metres per second. A 750 kilogram model has momentum plus 3750 kilogram metres per second.',520,
 text(300,43,'Same velocity: +5 m/s',32,C.green,700)+cycle(136,148)+arrow(245,140,530,140)+lines(300,232,['70 kg × 5 m/s','p = +350 kg·m/s'],30,C.teal,700)+
 car(137,334)+arrow(245,324,530,324)+lines(300,424,['750 kg × 5 m/s','p = +3750 kg·m/s'],30,C.green,700));

function axes(y,h,maxY,maxX,ticks){let b=line(118,y,118,y+h,C.ink)+line(118,y+h,559,y+h,C.ink);
 ticks.forEach(n=>{const yy=y+h-n/maxY*h;b+=line(113,yy,559,yy,C.border,1,'5 6')+text(97,yy+9,String(n),26,C.ink,400,'end');});
 [0,.5,1,1.5,2].filter(n=>n<=maxX).forEach(n=>{const xx=118+n/maxX*430;b+=line(xx,y+h,xx,y+h+7,C.ink)+text(xx,y+h+40,String(n),26);});
 return b+text(330,y+h+82,'Time (s)',28)+text(165,y-23,'Force magnitude (N)',27,C.ink,400,'start'); }
diagrams['d-impulse']=svg('Different forces can give the same impulse magnitude','An average force of 100 newtons acting for two seconds and an average force of 400 newtons acting for half a second each give an impulse magnitude of 200 newton seconds. The constant-force rectangles are simplified representations.',555,
 axes(85,280,400,2,[0,100,200,300,400])+
 `<rect x="118" y="295" width="430" height="70" fill="${C.teal}" fill-opacity=".2" stroke="${C.teal}" stroke-width="4"/><rect x="118" y="85" width="107.5" height="280" fill="${C.amber}" fill-opacity=".16" stroke="${C.amber}" stroke-width="4"/>`+
 text(353,264,'100 N × 2 s',30,C.teal,700)+text(355,137,'400 N × 0.5 s',30,C.amber,700)+text(300,502,'Both areas = 200 N·s',30,C.green,700)+text(300,540,'These are force magnitudes.',26));

diagrams['d-stopping-force']=svg('Equal impulse, different stopping time','A 1000 kilogram vehicle initially moving at plus ten metres per second stops, so its momentum change is minus 10000 kilogram metres per second. Average-force rectangles represent two alternative stops: 20000 newtons for half a second or 5000 newtons for two seconds. Each has impulse magnitude 10000 newton seconds.',650,
 text(300,40,'1000 kg vehicle · 10 m/s → rest',28,C.green,700)+
 axes(110,280,20000,2,[0,10000,20000])+
 `<rect x="118" y="320" width="430" height="70" fill="${C.teal}" fill-opacity=".2" stroke="${C.teal}" stroke-width="4"/><rect x="118" y="110" width="107.5" height="280" fill="${C.amber}" fill-opacity=".16" stroke="${C.amber}" stroke-width="4"/>`+
 lines(395,166,['20,000 N','for 0.5 s'],28,C.amber,700)+text(386,294,'5000 N for 2.0 s',28,C.teal,700)+
 text(300,536,'Both areas = 10,000 N·s',30,C.green,700)+lines(300,583,['Two alternative stops,','shown with average-force rectangles.'],26));

diagrams['d-summary']=svg('Connect avoiding a collision with managing an impact','Before braking, reaction distance equals speed times reaction time. Total stopping distance also includes braking distance. During an impact, impulse equals momentum change; a longer stopping time can reduce mean force for the same momentum change.',695,
 text(300,44,'Before a collision',32,C.green,700)+box(30,73,540,96,['Thinking distance','Speed × reaction time'],C.warm,29)+arrow(300,169,300,206)+
 box(30,221,540,106,['Thinking distance + braking distance','= stopping distance'],C.pale,27)+
 text(300,393,'During an impact',32,C.green,700)+box(30,422,540,96,['Impulse = change in momentum'],C.pale,28)+arrow(300,518,300,558)+
 box(30,574,540,96,['Same momentum change','Longer time → lower mean force'],C.white,27));

module.exports={diagrams,svg,text,lines,rect,line,arrow,box,C};
