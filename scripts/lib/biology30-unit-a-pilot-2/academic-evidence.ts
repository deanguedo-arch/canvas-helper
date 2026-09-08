/** Authored evidence selection. A resource existing is not proof of mastery. */
export interface AcademicEvidenceBinding {
  practiceKeys: string[];
  taskSelectors: string[];
  rationale: string;
  remainingGap?: string;
}

const q = (practiceKeys: string[], rationale: string, remainingGap?: string): AcademicEvidenceBinding => ({ practiceKeys, taskSelectors: [], rationale, remainingGap });
const task = (selector: string, rationale: string, remainingGap?: string): AcademicEvidenceBinding => ({ practiceKeys: [], taskSelectors: [selector], rationale, remainingGap });
const inv = (id: string) => `#process-collection [data-investigation="${id}"]`;
const study = (id: string, rationale: string) => task(`#model-lab [data-study-task="${id}"]`, rationale);
const online = (id:string,rationale:string) => task(`#model-lab [data-online-study="${id}"]`,rationale);
const onlineInvestigation = (step:string,rationale:string)=>task(`#process-collection [data-online-investigation-step="${step}"]`,rationale);

export const BEHAVIOUR_EVIDENCE: Record<string, AcademicEvidenceBinding> = {
  "A1.1k-01": study("neuron-labels", "The saved A–G response identifies all seven required parts on a peripheral neuron schematic and gives each function. A comparison guide supports revision; this is not microscopy evidence."),
  "A1.1k-02": q(["lesson-01-guided-2", "chapter-11-practice-02"], "The questions require the insulation and conduction explanation."),
  "A1.1k-03": q(["chapter-11-practice-03", "chapter-11-practice-04"], "The learner distinguishes neuron roles by direction within a reflex pathway."),
  "A1.1k-04": study("reflex-labels", "The learner identifies sensory, interneuron and motor roles from a lettered pathway and explains direction/connections rather than inferring a universal shape."),
  "A1.1k-05": task('#model-lab [data-online-microscopy]', "A real, locally stored prepared-tissue micrograph has an enlarged view, saved cell-profile observation and inference limits. Fully online adaptation: this demonstrates digital observation, not physical microscope operation."),
  "A1.1k-06": q(["chapter-11-practice-08", "lesson-02-guided-02"], "Refractory recovery and all-or-none firing are practised in their signal context."),
  "A1.1k-07": study("voltage-labels", "The saved letter key labels rest, threshold, rising/falling phases and both refractory intervals on a numeric voltage-time graph, with equivalent data and a 105 mV calculation."),
  "A1.1k-08": study("transport-reasoning", "The saved response explains gradient maintenance by the pump and selective resting permeability/leak; the guide distinguishes these from rapid voltage-gated events."),
  "A1.1k-09": study("transport-reasoning", "The response explicitly connects local current, regeneration in the next region and refractory recovery behind it. The voltage-labelling task separately checks phases."),
  "A1.1k-10": q(["lesson-02-guided-02", "chapter-11-practice-06", "chapter-11-practice-07"], "Threshold and firing frequency distinguish stimulus strength from spike height."),
  "A1.1k-11": q(["lesson-03-guided-1", "chapter-11-practice-09"], "The messenger definition precedes the calcium-triggered synaptic sequence."),
  "A1.1k-12": q(["lesson-03-guided-2", "chapter-11-practice-10"], "The changed-enzyme case requires the effect of acetylcholine breakdown."),
  "A1.1k-13": q(["final-practice-core-01"], "The synthetic conduction case locates a plausible myelin-related disruption without diagnosing a person."),
  "A1.2k-01": q(["chapter-11-practice-11", "lesson-04-guided-01"], "CNS structures and outgoing motor information are distinguished."),
  "A1.2k-02": study("matter-comparison", "The saved A–D comparison identifies grey/white tissue in cerebral and spinal sections, explains contents and function, and qualifies the simplified arrangement."),
  "A1.2k-03": q(["lesson-04-guided-02", "chapter-11-practice-12"], "Autonomic effects are selected in organ-specific context."),
  "A1.2k-04": q(["lesson-04-guided-01", "final-practice-core-04"], "The task identifies skeletal-muscle motor output."),
  "A1.2k-05": task(inv("sensory-receptors"), "The editor supports a two-point receptor-density procedure and supplied-data analysis."),
  "A1.2k-06": task('#lesson-04 .retrieve-block', "The saved hierarchy explanation can connect CNS/PNS and autonomic control; organ effects are taught alongside it."),
  "A1.2k-07": study("brain-labels", "The saved A–J key identifies the required lobes, cerebellum, pons, medulla, hypothalamus and spinal cord plus the thalamus; the response names the cerebrum, gives functions and states inference limits."),
  "A1.2k-08": task('#model-lab [data-model-panel="brain"]', "Learners can inspect a computer model and compare a change with a functional explanation."),
  "A1.2k-09": q(["lesson-05-guided-01", "lesson-05-guided-02", "final-practice-core-05"], "Coordination evidence and inference limits are tested together."),
  "A1.3k-01": q(["chapter-11-practice-03", "final-practice-core-06"], "A withdrawal-reflex sequence connects receptor, sensory path and response."),
  "A1.3k-02": study("reflex-labels", "A saved learner-generated A–E key names receptor, sensory neuron, interneuron, motor neuron and effector in the displayed withdrawal pathway."),
  "A1.3k-03": onlineInvestigation("reflex-observation", "Learners trace and compare supplied reflex-pathway observations, locate alternative disruptions and distinguish a reflex from a voluntary ruler catch. Online adaptation: no eliciting a physical reflex or diagnosis is claimed."),
  "A1.3k-04": task('#lesson-01 [data-advanced-block-id="l01-b03"]', "The optional disruption case develops excellence-level inference. Independent physical reflex experiment design is a source example not selected for this fully online delivery; this is not represented as demonstrated hands-on design."),
  "A1.4k-01": online("eye-structure-function","All fourteen required/supporting eye structures are actively selected from spatial clues, connected to the anatomical figure and checked against a complete explanation."),
  "A1.4k-02": task('#model-lab [data-model-panel="eye"]', "The selected vision model lets learners inspect eye/light-path relationships."),
  "A1.4k-03": online("eye-structure-function","Each eye structure receives a separate function selection and misconception-aware explanation; the stored matrix covers the full list rather than a subset of quiz items."),
  "A1.4k-04": onlineInvestigation("vision-procedure","An explicit simulated visual-discrimination protocol controls display conditions, applies an eight-of-ten threshold and compares two retinal locations. Online supplied-data adaptation, not a test of the learner's vision."),
  "A1.4k-05": task('#lesson-07 .retrieve-block', "The saved explanation traces the optical pathway and distinguishes neural interpretation."),
  "A1.5k-01": online("ear-structure-function","Fourteen location clues require active ear identification, including individual ossicles, hair cells, vestibule and Eustachian tube."),
  "A1.5k-02": task('#model-lab [data-model-panel="hearing"]', "The computer model connects inner-ear structure with hearing and balance."),
  "A1.5k-03": online("ear-structure-function","All fourteen ear structures have a separate function choice and a corrected explanation, including pressure equalization and the hearing/balance distinction."),
  "A1.5k-04": onlineInvestigation("hearing-procedure","Students follow a controlled sound-response model procedure and interpret cochlear-region data. Fully online/no-audio adaptation: this does not demonstrate physical hearing testing and cannot diagnose hearing."),
  "A1.5k-05": task('#lesson-08 .retrieve-block', "The saved sound pathway explanation links mechanical transfer to neural information."),
  "A1.6k-01": q(["lesson-06-guided-01", "chapter-12-practice-01", "chapter-12-practice-02", "chapter-12-practice-12"], "Receptor classes and multisensory balance distinguish stimulus and response types."),
  "A1.6k-02": task(inv("sensory-receptors"), "The authored frame asks for manipulated, responding and controlled variables."),
  "A2.1k-01": online("gland-locations","Seven location/region choices cover the Unit A hypothalamus, pituitary, thyroid, parathyroids, pancreatic islets, adrenal cortex and medulla."),
  "A2.1k-02": online("hormone-source-target-effect","Every listed hormone has a source selection; epinephrine/norepinephrine share their adrenal row while the explanation distinguishes their synaptic role. Production versus release is explicit for ADH."),
  "A2.2k-01": online("hormone-source-target-effect","Every hormone row requires source, receptor-bearing target and effect, then offers a full explanation. ACTH/cortisol, calcitonin and tissue-specific insulin action are explicit."),
  "A2.2k-02": q(["lesson-09-guided-01", "lesson-12-guided-01", "lesson-12-guided-02", "lesson-13-guided-1"], "The questions require negative-feedback direction across thyroid, calcium and glucose."),
  "A2.3k-01": online("hormone-source-target-effect","The full matrix covers growth, thyroid metabolism, calcium, glucose, water, sodium and stress effects. One integration response is no longer used as evidence for all roles."),
  "A2.3k-02": { practiceKeys: [], taskSelectors: ['#lesson-13 [data-advanced-block-id="l13-b03"]', '#lesson-12 [data-advanced-block-id="l12-b02"]'], rationale: "Existing optional comparisons address the two hormone pairs. Self-marking indicates participation, not independently demonstrated excellence." },
  "A2.3k-03": onlineInvestigation("endocrine-experiment","The optional investigation asks for an ADH hypothesis, controlled trials and a follow-up that varies target sensitivity. It is a testable model prediction rather than a physical intervention."),
  "A2.4k-01": q(["lesson-11-guided-01", "final-practice-core-13", "final-practice-core-14"], "Dehydration and calcium cases connect sensed change with opposing target response."),
  "A2.5k-01": q(["lesson-13-guided-2", "final-practice-core-18"], "Rapid medulla and slower ACTH/cortex effects are compared."),
  "A2.5k-02": task('#lesson-13 [data-advanced-block-id="l13-b03"]', "The optional worked comparison connects sympathetic input, medulla and norepinephrine/epinephrine. Foundational stress teaching remains in core."),
  "A2.6k-01": task(inv("endocrine-data"), "The supplied case distinguishes blood/urine glucose and a non-diagnostic inference."),
  "A2.6k-02": online("hormone-patterns","Twenty controlled teaching cases span source deficiency, excess and target-response distinctions across the hormone inventory. They explicitly prohibit diagnosis and treatment inference."),
  "A2.6k-03": onlineInvestigation("endocrine-experiment","A controlled ADH model specifies manipulated/responding/controlled variables, repeated results and a follow-up target-sensitivity question. The original multivariable samples are separately labelled observational."),
  "A2.6k-04": task('#lesson-13 [data-advanced-block-id="l13-b04"]', "The optional water/salt synthesis remains an original synthetic-data case. The illustrative excellence example of a hypothesis from published environmental-endocrine research is not selected; neither a publication nor equivalent empirical evidence is claimed. Required environmental/STS reasoning is separately taught in the online tool-evaluation task."),
  "A1.4s-01": task(inv("sensory-receptors"),"Students communicate a plan and conclusion, compare with a worked explanation or asynchronous teacher/classmate feedback, and record a justified revision. Independent model comparison is labelled as such; actual teamwork is not assumed."),
};

export const SKILL_OUTCOME_EVIDENCE: Record<string, AcademicEvidenceBinding> = {
  "A1.1sts": onlineInvestigation("neural-hypothesis","Two explanations for transmitter release make different calcium predictions. A controlled supplied comparison challenges one explanation and asks the learner to revise a claim, showing how scientific explanations respond to evidence."),
  "A1.2sts": task('#review-seminar [data-seminar-session="nervous"]', "The learner predicts changed release from a blocked mechanism and names supporting evidence."),
  "A1.3sts": onlineInvestigation("vision-procedure","The learner recommends enlargement/high contrast from visual evidence and evaluates the tradeoff of less information fitting on screen. This is an explicit design decision, not a passing technology mention."),
  "A1.1s": task(inv("sensory-receptors"), "The frame supports a fair-test question and variables."),
  "A1.2s": task(inv("reflex-response"),"Digital model observation and repeated supplied reaction distances support systematic recording and comparison. Fully online adaptation; no physical ruler or reflex procedure is claimed."),
  "A1.3s": task(inv("reflex-response"),"The learner calculates mean and range, interprets variation, compares competing mechanisms and states limitations. The separate voltage-labelling task adds a quantitative graph/105 mV calculation."),
  "A1.4s": BEHAVIOUR_EVIDENCE["A1.4s-01"],
  "A2.1sts": onlineInvestigation("endocrine-technology","The response evaluates repeated monitoring and delivery tools by intended benefit, measurement/system limits, access and professional-context requirements."),
  "A2.2sts": onlineInvestigation("endocrine-technology","Explicit teaching and response criteria connect intended monitoring benefits with unintended sensor/packaging/battery waste, cost, training and access. No treatment advice or invented numerical impact is supplied."),
  "A2.1s": onlineInvestigation("endocrine-experiment","A model hypothesis identifies ADH as the manipulated variable, urine volume as response and controlled inputs; the learner proposes a target-sensitivity follow-up."),
  "A2.2s": onlineInvestigation("endocrine-experiment","The learner predicts, runs the existing ADH software case, records its displayed response and compares controlled repeated values. This is computer-model observation, not collection of human physiological measurements."),
  "A2.3s": q(["final-practice-core-17"], "The high-ADH/dilute-urine pattern requires a source-target inference."),
  "A2.4s": task(inv("endocrine-data"),"The saved response contains the hypothesis, model observation, quantitative comparison, tool evaluation and justified revision. Online peer/teacher feedback may be cited only when it occurred; the independent worked-model path remains available."),
};
