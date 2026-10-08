/* Science 24 B2 — authored teaching data, not product specifications. */
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.B2Data = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const option = (id, label, watts) => ({id, label, watts});
  const device = (id, label, icon, count, minHours, initialHours, options, extra = {}) => ({
    id, label, icon, count, minHours, initialHours, maxHours:12, step:0.5,
    options, initialOption:options[0].id, ...extra
  });
  const sameService = 'For this mission, the offered replacements deliver the same required service per device. Power is a constant input while each device is on.';
  const scenes = [
    {
      id:'B2-W01', type:'worked', title:'Evening room', short:'Learn the method', support:'Worked example', cap:0.5,
      brief:'An evening group needs four lights for five hours and a fan for four hours. Follow the energy account before you take over.',
      devices:[device('lights','Room lights','lamp',4,5,5,[option('led','10 W lamps',10)]), device('fan','Room fan','fan',1,4,4,[option('standard','60 W fan',60)])],
      assumptions:sameService,
      key:'Power is a rate. Multiply by time to find energy, then add the energy used by every device.',
      steps:[
        {title:'Start with one lamp.', body:'A 10 W lamp uses energy at 10 watts while it is on. Convert watts to kilowatts: divide by 1,000.', formula:'10 W ÷ 1,000 = 0.010 kW', target:'lights'},
        {title:'Count the lamps and the hours.', body:'There are four lamps, and every lamp runs for five hours. Both the quantity and the run time matter.', formula:'4 × 0.010 kW × 5 h = 0.200 kWh', target:'lights'},
        {title:'Add the fan, not its watts.', body:'The fan runs for four hours. Work out its energy separately before adding it to the lighting energy.', formula:'1 × 0.060 kW × 4 h = 0.240 kWh', target:'fan'},
        {title:'Check two conditions.', body:'All required services are supplied. The total is below the 0.500 kWh limit, leaving 0.060 kWh unused.', formula:'0.200 + 0.240 = 0.440 kWh', target:'total'}
      ]
    },
    {
      id:'B2-P01', type:'plan', title:'Lighting choice', short:'Choose lighting', support:'Guided practice', cap:0.75,
      brief:'The hall needs six lights for at least six hours. The first plan uses 40 W lamps. Choose equipment and run times that meet the lighting need within the cap.',
      devices:[device('lights','Hall lights','lamp',6,6,8,[option('standard','Standard · 40 W',40),option('led','LED · 10 W',10)])],
      assumptions:sameService,
      question:'What makes the equipment comparison fair?',
      choices:[['same-service','Both options provide the same stated lighting service.'],['low-watts','Lower watts always means greater efficiency, regardless of output.'],['shorter','A shorter event provides the same service.']], correctChoice:'same-service',
      choiceFeedback:'Compare equal service. Lower power alone does not show that two devices deliver the same useful output.',
      key:'A low-energy plan only works when it also meets the service requirement.',
      hints:['Start with the service floor: all six lamps must run for at least six hours.', 'Compare the lamp choices while keeping the required number and hours unchanged.', 'For a 10 W lamp, use 0.010 kW. Multiply by all six lamps and by the hours in your plan.'],
      requireExplanation:false
    },
    {
      id:'B2-P02', type:'plan', title:'Computer room', short:'Account for every device', support:'Practice', cap:1.65,
      brief:'Eight visitors need computer access for two hours. The room also needs six lights for three hours and a fan for two hours. The draft runs everything longer than needed. Repair it.',
      devices:[
        device('computers','Study computers','computer',8,2,3,[option('standard','80 W each',80)]),
        device('lights','Study lights','lamp',6,3,4,[option('standard','12 W each',12)]),
        device('fan','Room fan','fan',1,2,3,[option('standard','60 W',60)])
      ],
      assumptions:'Every listed power rating is for one device, not the whole group. All computers operate for the same chosen time. Use the supplied constant-power model.',
      question:'Which expression accounts for the computer group?',
      choices:[['one','0.080 × hours'],['all','8 × 0.080 × hours'],['add','8 + 0.080 + hours']], correctChoice:'all',
      choiceFeedback:'The 80 W rating is for one computer. Multiply its kilowatts by eight computers and by the time each one runs.',
      key:'Power per device × number of devices × hours = energy for the group.',
      hints:['Check the required hours for each service. You may trim extra time, but not the booked time.', 'The computers use 80 W each. Eight computers draw 640 W together.', 'Calculate each row separately in kWh, then add the three rows.'],
      requireExplanation:false
    },
    {
      id:'B2-P03', type:'plan', title:'Projector repair', short:'Protect the programme', support:'Reduced support', cap:0.4,
      brief:'A workshop requires three lights for four hours and a projector for 90 minutes. The booked session cannot be shortened. Find a plan that fits the 0.400 kWh cap.',
      devices:[
        device('lights','Workshop lights','lamp',3,4,4,[option('standard','12 W each',12)]),
        device('projector','Workshop projector','projector',1,1.5,1.5,[option('a','Projector A · 180 W',180),option('b','Projector B · 150 W',150)])
      ],
      assumptions:'Projectors A and B provide the same specified projection service. The 90-minute session is compulsory. All powers are constant input ratings for this model.',
      question:'Why is cutting the projector time to one hour not a valid repair?',
      choices:[['time','It fails the required 90-minute service.'],['power','It increases the projector’s rated power.'],['zero','It makes the projector use no energy.']], correctChoice:'time',
      choiceFeedback:'The plan must deliver the whole booked session. Saving energy by cancelling part of a required service is not a valid solution.',
      key:'Convert minutes to hours before multiplying by kilowatts. Preserve required services when making a change.',
      hints:['Convert the projector session into hours. Ninety minutes is not 0.90 hours.', 'Keep the compulsory session. Compare the two projector power ratings.', 'Calculate the lighting energy once. Then add the energy for the selected projector.'],
      requireExplanation:true
    },
    {
      id:'B2-P04', type:'efficiency', title:'Useful energy', short:'Check efficiency', support:'Energy audit', inputJ:1500, usefulJ:900,
      brief:'A fictional motor uses 1,500 J of electrical input energy. It delivers 900 J of useful motion; the rest transfers to the surroundings as thermal energy in this model.',
      assumptions:'The motor account describes one supplied model, not a real product rating. Energy transferred to the surroundings is not destroyed.',
      question:'Could you identify the more efficient of two motors from their input watts alone?',
      choices:[['yes','Yes. The lower-watt motor must be more efficient.'],['no','No. You also need the useful output for a fair comparison.'],['lost','Yes. The unused energy disappears.']], correctChoice:'no',
      choiceFeedback:'Efficiency compares useful output with total input. Input power alone does not tell you how much useful work is delivered.',
      key:'Efficiency = useful energy output ÷ total input × 100%. The full energy account must still balance.',
      hints:['The denominator is the total input, not just the thermal output.', 'Subtract useful output from input to find the other output.', 'Divide 900 by 1,500, then multiply by 100 to express the result as a percent.']
    },
    {
      id:'B2-T01', type:'transfer', title:'A new equipment table', short:'Independent challenge', support:'Independent transfer', cap:0.65,
      brief:'A pop-up learning booth needs four 15 W lights for 180 minutes and two workstations for 150 minutes each. The draft uses 120 W workstations. An 80 W alternative supplies the same stated service. Your total allowance is 0.650 kWh.',
      assumptions:'All ratings are per device. Each workstation runs for the full 150 minutes. The two workstation options are equivalent for the required task. Treat power as constant.',
      devices:[{label:'Lights',count:4,watts:15,minutes:180},{label:'Original workstation',count:2,watts:120,minutes:150},{label:'Replacement workstation',count:2,watts:80,minutes:150}],
      initialKWh:0.78, revisedKWh:0.58,
      question:'Which plan meets both the energy cap and the required services?',
      choices:[['replace','Use two 80 W workstations for the full 150 minutes.'],['keep','Keep two 120 W workstations for the full 150 minutes.'],['cancel','Use two 120 W workstations for only 90 minutes.']],correctChoice:'replace',
      key:'Use the supplied data, account for every device, and check both the energy limit and the required service.'
    }
  ];
  const lab = {
    id:'B2-LAB',type:'lab', title:'Keep the centre running',short:'Centre lab',support:'Open practice · live totals', cap:20,
    brief:'Plan the day at Riverside Community Centre. Adjust run times without dropping any required service. Get under 20 kWh, then try the optional 12 kWh stretch target.',
    devices:[
      device('lights','LED lights','lamp',10,6,8,[option('led','10 W each',10)]),
      device('heater','Room heater','heater',1,4,6,[option('standard','1,500 W',1500)]),
      device('computers','Study computers','computer',5,3,4,[option('standard','50 W each',50)]),
      device('water','Water heater','water-heater',1,1.5,2,[option('standard','2,000 W',2000)]),
      device('chargers','Device chargers','charger',10,2,6,[option('standard','2 W each',2)])
    ],
    assumptions:'Fictional service floors and constant input powers are supplied for the puzzle. All ratings are per device. Real heaters and chargers may cycle; this is not a building-performance forecast.',
    key:'The live display is a practice tool. The independent challenge later hides calculated totals until you submit.', stretch:12
  };
  function freeze(o) { Object.values(o).forEach(v=>{if(v && typeof v==='object') freeze(v);});return Object.freeze(o); }
  return freeze({version:'1.0.0',gameId:'B2',title:'Power Budget Challenge',scenarios:scenes,lab});
});
