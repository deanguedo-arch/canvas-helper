/* Authored virtual records, not measurements or laboratory instructions.
 * Stable case/evidence IDs retained from the Codex first pass. See docs/SCIENCE_AND_SCOPE.md.
 * This is formative practice: answers are client-side and are not secure exam items.
 */
(function (root) {
  'use strict';
  const scenarios = [
    {
      id: 'W01', version: '1.1.0', stage: 'worked', title: 'Peroxide Record', displayTitle: 'The peroxide record',
      image: 'assets/scenes/scene_01_peroxide.webp', icon: 'flask',
      caseText: 'A virtual laboratory record identifies hydrogen peroxide before a change. Afterwards, water and oxygen are identified. The mixture warms with no external heating.',
      base: [['Observation', 'Gas bubbles appear.'], ['Energy', 'The mixture warms; no external heat is supplied.']],
      evidence: [
        {id:'w01_e1',label:'Product identity',detail:'Water and oxygen are identified after the change.',icon:'flask',role:'strong'},
        {id:'w01_e2',label:'Starting substance',detail:'Hydrogen peroxide is identified before the change.',icon:'record',role:'strong'},
        {id:'w01_e3',label:'Temperature record',detail:'The mixture warms while no external heating is applied.',icon:'temperature',role:'supporting'},
        {id:'w01_e4',label:'Catalyst record',detail:'The catalyst is unchanged after the reaction; it is not consumed in the overall change.',icon:'observe',role:'supporting'}
      ],
      conclusion:'chemical', reaction:'decomposition', hints:[],
      model:'The identified substances change from hydrogen peroxide to water and oxygen. New substances support a chemical change. One compound forms simpler products, so the reaction is decomposition.',
      keyIdea:'Identify what the substances were before and after. Bubbles describe an observation, not a substance identity.',
      scienceNote:'In this stated setup, warming without external heating is consistent with an exothermic reaction: energy is released to the surroundings.'
    },
    {
      id:'P01', version:'1.1.0', stage:'practice', title:'Cooling Solution', displayTitle:'The cooling solution', scaffold:'Guided investigation',
      image:'assets/scenes/scene_02_cooling_solution.webp', icon:'temperature',
      caseText:'A white crystalline solid disappears into water. The container cools from 22 °C to 18 °C and a clear solution remains. What does that establish?',
      base:[['Appearance','The solid is no longer visible.'],['Temperature','22 °C → 18 °C']],
      evidence:[
        {id:'p01_e1',label:'Recovery record',detail:'After the water is removed in the supplied record, a solid is recovered.',icon:'solid',role:'supporting',why:'Recovery matters, but a solid appearing again does not by itself identify it.'},
        {id:'p01_e2',label:'Identity comparison',detail:'The supplied identity analysis reports no new substances in this model. The recovered solid matches the starting solid.',icon:'record',role:'strong',why:'This record addresses whether the substance changed identity.'},
        {id:'p01_e3',label:'pH record',detail:'The record reports that the pH stayed the same.',icon:'flask',role:'weak',why:'An unchanged pH does not establish whether all substance identities stayed the same.'},
        {id:'p01_e4',label:'Warm-water comparison',detail:'The solid dissolves at a different rate in warmer water.',icon:'temperature',role:'weak',why:'A rate difference does not answer whether a new substance formed.'}
      ],
      conclusion:'physical',reaction:'none',requiredEvidence:['p01_e2'],allowedPairs:[['p01_e1','p01_e2']],uncertaintyRecord:'p01_e2',
      hints:['Separate the temperature observation from the question of substance identity.','Recovery is useful, but the recovered material must also be identified.','Pair the recovery record with the identity comparison.'],
      starter:'The evidence in records ___ and ___ supports ___ because ___.',
      keyIdea:'A physical change can involve an energy transfer. Temperature change alone does not prove that a new substance formed.',
      model:'The recovery and identity records support a physical change in this supplied model. The original substance is recovered and no new substances are reported. Cooling alone was not enough to decide.',
      misconception:'The cooling and disappearance are observations. Neither alone establishes a new substance. Compare the recovery and identity records.'
    },
    {
      id:'P02',version:'1.1.0',stage:'practice',title:'Rusting Tool',displayTitle:'The workshop tool',scaffold:'Build the evidence',
      image:'assets/scenes/scene_03_rusting_tool.webp',icon:'tool',
      caseText:'An iron-containing tool is left in moist air. A reddish-brown coating develops. In this record, the tool and all attached coating are weighed together; none has flaked away.',
      base:[['Surface','A reddish-brown coating develops.'],['Mass','The tool with its coating has gained mass.']],
      evidence:[
        {id:'p02_e1',label:'Coating analysis',detail:'The coating contains iron and oxygen and has different properties from the starting metallic iron.',icon:'record',role:'strong',why:'This compares the new material with the starting metal.'},
        {id:'p02_e2',label:'Atmosphere record',detail:'The tool was exposed to air containing oxygen and to moisture.',icon:'vapour',role:'supporting',why:'This supplies the conditions and a source of matter from the surroundings.'},
        {id:'p02_e3',label:'Surface observation',detail:'The coating is reddish-brown.',icon:'observe',role:'supporting',why:'The appearance is consistent with corrosion but does not identify the substance alone.'},
        {id:'p02_e4',label:'Location record',detail:'The tool was stored in a garage.',icon:'location',role:'weak',why:'A location alone does not establish a chemical change.'}
      ],conclusion:'chemical',reaction:'corrosion',requiredEvidence:['p02_e1'],allowedPairs:[['p02_e1','p02_e2'],['p02_e1','p02_e3']],
      application:{prompt:'Which response best limits further corrosion?',answer:'barrier_coating',options:[
        ['barrier_coating','Use a suitable barrier coating to limit air and moisture contact.'],
        ['polish_only','Polish it, then leave the metal unprotected.'],
        ['no_action','Do nothing; only the colour has changed.']
      ],feedback:'A suitable barrier reduces contact with oxygen and moisture. Polishing alone leaves fresh metal exposed.'},
      hints:['Colour is suggestive. Which record compares the coating with the original metal?','Use the coating analysis, then connect it to the exposure conditions or surface observation.'],
      keyIdea:'Matter from the surroundings becomes part of corrosion products. A barrier can slow further corrosion.',
      model:'The coating has a different composition and properties from the starting iron, supporting a chemical change: corrosion. Oxygen from the surroundings contributes to the retained coating and the measured mass gain. A suitable barrier limits further contact with oxygen and moisture.',
      misconception:'Do not explain the coating as a colour change alone. Compare the coating analysis with the original metal.'
    },
    {
      id:'P03',version:'1.1.0',stage:'practice',title:'Antacid Record',displayTitle:'The antacid model',scaffold:'Reduced guidance',
      image:'assets/scenes/scene_04_antacid_model.webp',icon:'flask',
      caseText:'In a virtual model, a calcium-carbonate antacid encounters an acidic solution. Review the supplied records to classify the change. This is not a dosing or laboratory activity.',
      base:[['Observation','Bubbles appear.'],['Acidity','The pH moves towards neutral.']],
      evidence:[
        {id:'p03_e1',label:'Product record',detail:'Carbon dioxide, water and a dissolved calcium salt are identified as products of the change.',icon:'record',role:'strong',why:'Product identities establish the new substances, not just visible bubbles.'},
        {id:'p03_e2',label:'Reactant record',detail:'The starting reactants are the acidic solution and calcium carbonate.',icon:'flask',role:'supporting',why:'The reactant identities identify the acid–carbonate reaction pattern.'},
        {id:'p03_e3',label:'Bubble observation',detail:'Gas bubbles are visible during the change.',icon:'bubbles',role:'supporting',why:'Visible bubbles support the record but do not identify the gas.'},
        {id:'p03_e4',label:'Tablet appearance',detail:'The tablet becomes smaller during the supplied record.',icon:'solid',role:'supporting',why:'Disappearance alone could have another explanation; connect it to product identity.'}
      ],conclusion:'chemical',reaction:'neutralization',requiredEvidence:['p03_e1'],allowedPairs:[['p03_e1','p03_e2'],['p03_e1','p03_e3'],['p03_e1','p03_e4']],
      hints:['Classify using the identities of reactants and products, not the bubbles alone.','The product record and the reactant record together identify the acid–carbonate pattern.'],
      keyIdea:'This acid–carbonate reaction neutralizes acid and produces a salt, water and carbon dioxide. Not every acid–base reaction produces a gas.',
      model:'The identified products differ from the starting reactants, so the change is chemical. Acid reacting with calcium carbonate is an acid–carbonate neutralization, producing a calcium salt, water and carbon dioxide. The pH trend supports reduced acidity; bubbles alone do not identify the reaction.',
      misconception:'Use the product record to determine whether new substances formed. Bubbles and a pH trend do not identify the reaction by themselves.'
    },
    {
      id:'P04',version:'1.1.0',stage:'practice',title:'Furnace Combustion',displayTitle:'The furnace record',scaffold:'Independent practice',
      image:'assets/scenes/scene_05_combustion_furnace.webp',icon:'flame',
      caseText:'A fictional natural-gas furnace supplies heat. Use its inlet and exhaust records to classify the reaction and connect a product to an environmental consequence.',
      base:[['Energy','Heat is released.'],['Observation','Light is produced in the burner.']],
      evidence:[
        {id:'p04_e1',label:'Inlet record',detail:'Methane and oxygen are supplied to the model burner.',icon:'record',role:'strong',why:'This identifies the reactants; compare them with the exhaust products.'},
        {id:'p04_e2',label:'Exhaust record',detail:'Carbon dioxide and water are identified as products in this complete-combustion model.',icon:'flask',role:'strong',why:'This identifies products to compare with the inlet record.'},
        {id:'p04_e3',label:'Energy record',detail:'The burner releases heat and visible light.',icon:'flame',role:'supporting',why:'Energy release is consistent with combustion, but does not identify its reactants and products.'},
        {id:'p04_e4',label:'Casing record',detail:'A metal surface becomes hot during operation.',icon:'temperature',role:'weak',why:'A hot casing is an effect of energy transfer, not evidence identifying the reaction products.'}
      ],conclusion:'chemical',reaction:'combustion',requiredEvidence:['p04_e1','p04_e2'],allowedPairs:[['p04_e1','p04_e2']],
      application:{prompt:'Which carbon-containing product links this model to greenhouse-gas emissions?',answer:'carbon_dioxide',options:[
        ['water','Water vapour'],['carbon_dioxide','Carbon dioxide'],['methane','Methane'],['oxygen','Oxygen']
      ],feedback:'Carbon dioxide is the carbon-containing product. Water vapour is also a greenhouse gas, but it contains no carbon. Methane is an input in this model, not an identified exhaust product.'},
      hints:['Use the inlet and exhaust identities together. Decide which substance is a product, not an input.'],
      keyIdea:'Complete methane combustion forms carbon dioxide and water and releases energy. This model does not claim that every real furnace burns completely.',
      model:'Methane and oxygen react to form carbon dioxide and water. These new products support a chemical change classified as combustion. Energy is released. Carbon dioxide is the carbon-containing greenhouse-gas product identified in this model.',
      misconception:'Compare the inlet and exhaust identities. Heat or light alone does not identify a reaction.'
    },
    {
      id:'T01',version:'1.1.0',stage:'transfer',title:'Boiling Water',displayTitle:'A new situation',scaffold:'Independent transfer',
      image:'assets/scenes/scene_06_boiling_transfer.webp',icon:'record',
      caseText:'Water is heated until bubbles form and water vapour is produced. The vapour is cooled and condenses back to liquid water. The supplied record identifies the substance before heating and after condensation as water (H₂O).',
      base:[['Before heating','Liquid water (H₂O)'],['During heating','Bubbles and water vapour'],['After cooling','Liquid water (H₂O)']],
      evidence:[],conclusion:'physical',reaction:'none',hints:[],
      prompt:'Classify the change. Explain why the bubbles do or do not establish a chemical reaction, using the identity record.',
      keyIdea:'A change of state does not change water into a different substance. Bubbles alone do not establish chemical change.',
      model:'This is a physical change. The record identifies water before heating and after condensation; the substance remains H₂O. The bubbles are associated with the change of state, not proof of a new substance.',
      misconception:'Separate an observation from a conclusion. Ask what the before-and-after identity record establishes.'
    }
  ];
  const data = {version:'1.1.0',scenarios,conclusions:[['physical','Physical change'],['chemical','Chemical change'],['insufficient','Not enough evidence']],reactions:[['decomposition','Decomposition'],['corrosion','Rusting / corrosion'],['neutralization','Acid–carbonate / neutralization'],['combustion','Combustion']]};
  root.RD_DATA = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
