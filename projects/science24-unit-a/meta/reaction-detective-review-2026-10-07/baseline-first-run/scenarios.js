window.RD_SCENARIOS = [
  {
    id:'W01',stage:'worked',title:'Peroxide Record',image:'assets/scenes/scene_01_peroxide.png',
    caseText:'A supplied virtual laboratory record identifies hydrogen peroxide before a change. After the change, water and oxygen are identified. The mixture warms while no external heating is applied. A catalyst is unchanged after the reaction.',
    base:['Gas bubbles are observed.','The mixture warms in the stated setup.'],
    evidence:[
      {id:'w01_e1',label:'Product identity record',detail:'Water and oxygen are identified after the change.',q:'strong'},
      {id:'w01_e2',label:'Starting substance record',detail:'Hydrogen peroxide is identified before the change.',q:'strong'},
      {id:'w01_e3',label:'Temperature record',detail:'The mixture warms while no external heating is applied.',q:'supporting'},
      {id:'w01_e4',label:'Catalyst record',detail:'The catalyst is still present after the reaction.',q:'supporting'}
    ], conclusion:'chemical',reaction:'decomposition',strong:['w01_e1'],
    model:'The substance identity changes from hydrogen peroxide to water and oxygen. That supports a chemical change. One compound forming simpler products is a decomposition reaction.'
  },
  {
    id:'P01',stage:'practice',title:'Cooling Solution',image:'assets/scenes/scene_02_cooling_solution.png',
    caseText:'A white crystalline solid disappears into water. The container cools from 22 °C to 18 °C and a clear solution remains.',
    base:['The solid is no longer visible.','The temperature falls from 22 °C to 18 °C.'],
    evidence:[
      {id:'p01_e1',label:'Recovery record',detail:'After the water is removed in the supplied record, a solid is recovered.',q:'strong'},
      {id:'p01_e2',label:'Identity comparison',detail:'The recovered solid is identified as the same substance as the starting solid.',q:'strong'},
      {id:'p01_e3',label:'pH record',detail:'A pH reading is supplied, but it does not by itself establish whether a new substance formed.',q:'weak'},
      {id:'p01_e4',label:'Warm-water comparison',detail:'The solid dissolves at a different rate in warmer water.',q:'weak'}
    ], conclusion:'physical',reaction:'none',strong:['p01_e2'],prediction:'insufficient',
    hints:['A temperature change does not automatically mean a new substance formed.','What evidence would tell you whether the original substance can be recovered?','Compare the recovered solid with the starting solid.']
  },
  {
    id:'P02',stage:'practice',title:'Rusting Tool',image:'assets/scenes/scene_03_rusting_tool.png',
    caseText:'An iron-containing tool is exposed to air and moisture over time. A reddish-brown corrosion coating develops and the final mass is slightly greater than the initial mass.',
    base:['A reddish-brown coating develops.','The final mass is slightly greater.'],
    evidence:[
      {id:'p02_e1',label:'Corrosion product analysis',detail:'The coating contains iron and oxygen and has different properties from the original metallic iron.',q:'strong'},
      {id:'p02_e2',label:'Atmosphere record',detail:'The tool was exposed to air containing oxygen and to moisture.',q:'supporting'},
      {id:'p02_e3',label:'Surface colour',detail:'The coating is reddish-brown.',q:'supporting'},
      {id:'p02_e4',label:'Location record',detail:'The tool was stored in a garage.',q:'weak'}
    ], conclusion:'chemical',reaction:'corrosion',acceptedReaction:['corrosion','composition'],strong:['p02_e1'],
    hints:['A colour change helps, but look for evidence the material changed identity.','Which record compares the corrosion product with the original metal?','The product analysis is the strongest evidence.']
  },
  {
    id:'P03',stage:'practice',title:'Antacid Record',image:'assets/scenes/scene_04_antacid_model.png',
    caseText:'In a virtual model, a calcium-carbonate antacid is placed in a model acidic solution. The pH moves toward neutral and gas is produced.',
    base:['Bubbles are produced.','The pH moves toward neutral.'],
    evidence:[
      {id:'p03_e1',label:'Product record',detail:'Carbon dioxide, water and a dissolved calcium salt are identified after the change.',q:'strong'},
      {id:'p03_e2',label:'Reactant record',detail:'The starting substances include an acidic solution and calcium carbonate.',q:'strong'},
      {id:'p03_e3',label:'Bubble observation',detail:'Gas bubbles are visible.',q:'supporting'},
      {id:'p03_e4',label:'Tablet appearance',detail:'The tablet becomes smaller during the virtual record.',q:'supporting'}
    ], conclusion:'chemical',reaction:'neutralization',strong:['p03_e1'],
    hints:['Bubbles and pH change do not identify the reaction by themselves.','Look for the record that identifies substances before and after.','Use the reactant and product identities to classify the reaction.']
  },
  {
    id:'P04',stage:'practice',title:'Furnace Combustion',image:'assets/scenes/scene_05_combustion_furnace.png',
    caseText:'A fictional natural-gas furnace model supplies methane and oxygen to a controlled burner. The exhaust record identifies carbon dioxide and water. Heat and visible light are released.',
    base:['Heat is released.','Visible light is produced.'],
    evidence:[
      {id:'p04_e1',label:'Reactant record',detail:'Methane and oxygen are supplied to the burner in the model.',q:'strong'},
      {id:'p04_e2',label:'Exhaust product record',detail:'Carbon dioxide and water are identified in the supplied exhaust record.',q:'strong'},
      {id:'p04_e3',label:'Energy record',detail:'Heat and visible light are released.',q:'supporting'},
      {id:'p04_e4',label:'Hot casing',detail:'A metal surface becomes hot during operation.',q:'weak'}
    ], conclusion:'chemical',reaction:'combustion',strong:['p04_e1','p04_e2'],
    hints:['Energy release supports the idea, but reaction type depends strongly on reactants and products.','Compare the supplied fuel and oxygen with the exhaust products.','Methane + oxygen forming carbon dioxide + water is combustion.']
  },
  {
    id:'T01',stage:'transfer',title:'Boiling Water',image:'assets/scenes/scene_06_boiling_transfer.png',
    caseText:'Water is heated until bubbles form and water vapour is produced. The vapour is cooled and condenses back to liquid water. The supplied record identifies the substance before heating and after condensation as water (H₂O).',
    base:['Bubbles form during boiling.','Water vapour condenses back to liquid water.','The substance remains H₂O.'],evidence:[],
    conclusion:'physical',reaction:'none',strong:[],model:'The bubbles do not prove a chemical reaction. The supplied record shows a change of state and the substance remains water before and after.'
  }
];
