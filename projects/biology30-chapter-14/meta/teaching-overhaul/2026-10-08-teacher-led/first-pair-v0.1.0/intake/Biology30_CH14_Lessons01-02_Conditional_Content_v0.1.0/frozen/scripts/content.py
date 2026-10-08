"""Authored Chapter 14 teaching content. Provenance and corrections are in authoring/.
This module is build input; it is not a student resource.
"""
LESSONS = [
{
 'title':'Reproductive systems and sex characteristics','question':'How do reproductive structures, gametes and hormones work together?',
 'goal':'Distinguish reproductive organs, gametes and hormones, and explain the difference between primary and secondary sex characteristics.',
 'prior':'A hormone travels in the blood and affects cells with the appropriate receptor. Review negative feedback when you need it; it will return in this chapter.',
 'pages':[478,492], 'slides':[3,4,5,6], 'anchors':['gonad','gamete','primary sex characteristic','secondary sex characteristic'],
 'sections':[
 ('Three ideas to keep separate',[
 'The reproductive system produces sex cells and makes it possible for genetic information to pass from one generation to the next. Start by separating three ideas: an organ, a cell and a chemical messenger.',
 'A gonad is an organ that produces gametes and releases reproductive hormones. The testes are the male gonads; the ovaries are the female gonads. A gamete is a sex cell: a sperm or an egg. Testosterone, estrogen and progesterone are hormones, not cells or organs.',
 'Gametes carry one set of chromosomes. In humans, that is 23 chromosomes. When a sperm and an egg contribute their chromosome sets at fertilization, the resulting cell has 46. We will examine how the chromosome number is reduced in Chapter 16. For now, connect the smaller chromosome set to the role of a gamete.'
 ]),
 ('Primary does not mean more important',[
 'Primary sex characteristics are the reproductive organs and structures, such as testes, ovaries, the penis, the uterus and the vagina. These structures are generally present at birth and develop further as the body matures.',
 'Secondary sex characteristics are physical changes associated with sexual maturation that are not the reproductive organs themselves. Examples include facial hair, a deeper voice and breast development. They become more noticeable during puberty as hormone patterns change.',
 'Do not classify a characteristic only by the age at which you notice it. An ovary remains a primary sex characteristic when it becomes more active at puberty. The question is whether you are identifying a reproductive organ or another physical feature associated with maturation.'
 ]),
 ('Chromosomes help direct reproductive development',[
 'In the typical chromosome patterns used in this course, XX is associated with female reproductive development and XY with male reproductive development. The sex chromosomes are established at fertilization; the visible reproductive structures develop later.',
 'A gene called SRY, usually found on the Y chromosome, helps initiate testis development. Hormones released by the developing testes, including testosterone, help direct male reproductive development. Testosterone is one part of this developmental system, not a complete explanation of every reproductive structure.',
 'Chromosomes, hormone production and the ability of tissues to respond all matter. A tissue without a functioning receptor cannot make its usual response simply because a hormone is present. The XX/XY model describes typical patterns; human development also includes variations. These diagrams are models of reproductive anatomy, not a test of a person’s identity.'
 ]),
 ('Puberty changes activity, not the identity of a structure',[
 'Puberty is a period when reproductive hormone signalling becomes more active and reproductive capacity develops. The hypothalamus and anterior pituitary help coordinate this change. Later lessons will trace their signals to specific cells in the testes and ovaries.',
 'Use the same organizing questions throughout the chapter: Which structure is involved? What does it produce? Where does that product go? What does it do there? Answering these questions is more useful than learning a list of names without their relationships.'
 ])],
 'worked':('Classifying three observations','A student lists an ovary, an egg and a rise in estrogen. Are these three examples of the same thing?',[
 'Identify the level of organization. The ovary is an organ and a gonad.',
 'Identify the cell. The egg is a gamete produced through processes in the ovary.',
 'Identify the signal. Estrogen is a hormone that can act on target tissues.',
 'Connect them: cells in an ovarian follicle release estrogen while an oocyte develops within the follicle. Related does not mean interchangeable.'
 ]),
 'guided':[
 ('A testis begins producing sperm at puberty. How should the testis be classified?','A primary sex characteristic','A secondary sex characteristic','A gamete','Ask whether it is a reproductive organ or a cell.','The testis is a reproductive organ. Increased activity at puberty does not turn it into a secondary characteristic.'),
 ('A target tissue has no functioning receptor for a reproductive hormone. What is the best prediction?','Its usual response to that hormone will be reduced or absent','The hormone becomes a gamete','Its chromosome number must double','Recall what makes a cell a target cell.','The hormone must interact with an appropriate receptor to produce its normal response.')],
 'check':[
 ('Which pairing identifies an organ and the gamete associated with it?','Testis — sperm',['Testosterone — sperm','Ovary — estrogen','Sperm — testis'],'A gonad is an organ; a gamete is a cell.','Testes are gonads, and sperm are the associated gametes.'),
 ('A voice becomes deeper during puberty. Which classification fits this change?','Secondary sex characteristic',['Primary sex characteristic','Formation of a gamete','A change from 23 to 46 chromosomes'],'Decide whether the observation describes a reproductive organ.','A deeper voice is a physical change associated with maturation, not a reproductive organ.')],
 'writing':[
 ('Explain how a gonad, a gamete and a reproductive hormone differ. Connect all three using either the ovary or testis.','A gonad is an organ. A gamete is a reproductive cell. A hormone is a chemical signal. For example, a testis contains sites of sperm production and cells that release testosterone.',['Distinguishes organ, cell and signal.','Uses a coherent example linking a gonad, its gamete and a hormone.']),
 ('Why is the statement “a feature that changes at puberty must be a secondary sex characteristic” incorrect? Use two examples.','Reproductive organs also develop further at puberty. A testis is a primary characteristic even when sperm production begins; a deepening voice is a secondary characteristic. Classification depends on the kind of structure or feature, not only its timing.',['Explains why timing alone is insufficient.','Contrasts a primary organ with a secondary feature.'])],
 'self':('Would measuring a hormone alone tell you everything about reproductive development?','No. The organ that produces it, its timing, other signals and the target tissue’s ability to respond also matter.')
},
{
 'title':'Male reproductive structures and the sperm pathway','question':'Where are sperm made, and how do they travel out of the body?',
 'goal':'Trace the sperm pathway and distinguish the transport ducts from the glands that add fluid to semen.',
 'prior':'A sperm is a cell. Semen is the mixture containing sperm and gland secretions; these terms do not mean the same thing.',
 'pages':[479,481], 'slides':[7,8,9,10], 'anchors':['testis','epididymis','vas deferens','semen'],
 'sections':[
 ('Begin with the testis',[
 'The testes lie in the scrotum, a pouch outside the main body cavity. This position and adjustments in the scrotum help maintain a temperature suitable for sperm production. The scrotum is the supporting pouch; it is not where sperm cells are formed.',
 'Inside each testis are many tightly coiled seminiferous tubules. These are the sites of sperm production. After leaving these tubules and their connecting ducts, sperm enter the epididymis, a long coiled duct alongside the testis.',
 'Sperm mature in the epididymis and develop the capacity for movement. They may also be stored there. Keep the locations separate: production in seminiferous tubules; maturation and storage in the epididymis.'
 ]),
 ('Follow the ducts in order',[
 'During ejaculation, muscular contractions move sperm from the epididymis into the vas deferens, also called the ductus deferens. This duct travels into the pelvic cavity. It is a transport route, not a gland that produces sperm.',
 'The vas deferens joins the duct from a seminal vesicle to form an ejaculatory duct. The ejaculatory duct carries the mixture through the prostate into the urethra. The urethra then carries semen through the penis to the outside.',
 'In the male system, the urethra is used by both the urinary and reproductive systems, but urine and semen are normally released at different times. Do not put the urinary bladder into the sperm pathway. Sperm do not travel through the bladder.'
 ]),
 ('Glands contribute fluid along the route',[
 'Semen contains sperm and fluid from accessory glands. The seminal vesicles contribute a fructose-containing secretion. Fructose is an energy source that supports sperm activity.',
 'The prostate adds fluid that contributes to the functioning of semen. The bulbourethral glands, also called Cowper’s glands, release lubricating mucus into the urethra. These gland secretions help support and protect sperm, but the glands do not make sperm.',
 'A diagram may show a gland beside a duct. Follow the connection: secretion enters the route through a gland’s duct. A sperm does not need to pass through the interior of each accessory gland to receive its secretion.'
 ]),
 ('Use position to explain function',[
 'The penis provides a route for depositing semen in the female reproductive tract. Successful transport depends on an open duct pathway and coordinated contractions, not only on the number of sperm produced.',
 'A blockage in the vas deferens can prevent sperm from joining the ejaculate even if sperm production and testosterone release continue. This is why you should locate the affected structure before predicting what changes. A transport problem is not automatically a hormone-production problem.'
 ])],
 'figures':{0:'male-anatomy'},
 'worked':('A blocked transport duct','A model shows normal seminiferous tubules and accessory glands but a completely blocked vas deferens.',[
 'Start at the production site. The seminiferous tubules may still produce sperm.',
 'Follow the route. Sperm cannot pass the blockage to reach the ejaculatory duct.',
 'Consider the glands separately. Their ducts may still add fluid downstream.',
 'Predict carefully: the ejaculate can contain gland fluid without sperm. The blockage does not itself establish that testosterone production has stopped.'
 ]),
 'guided':[
 ('After sperm mature in the epididymis, which major duct carries them toward the ejaculatory duct?','Vas deferens','Ureter','Seminal vesicle','Follow the route out of the testis region.','The vas deferens is a transport duct carrying sperm from the epididymis toward the pelvic ducts.'),
 ('A seminal-vesicle secretion contains fructose. Which function does this support?','Providing an energy source for sperm','Producing sperm by meiosis','Producing testosterone','Separate gland secretions from the cells made in the testis.','Fructose in the secretion supplies a usable energy source; sperm production occurs in seminiferous tubules.')],
 'check':[
 ('Which sequence correctly follows sperm after they leave the epididymis?','Vas deferens → ejaculatory duct → urethra',['Urethra → vas deferens → ejaculatory duct','Seminal vesicle → urinary bladder → urethra','Ejaculatory duct → epididymis → vas deferens'],'Trace connected transport ducts, not every nearby organ.','Sperm pass through the vas deferens and ejaculatory duct before entering the urethra.'),
 ('Which statement distinguishes sperm from semen?','Semen contains sperm mixed with accessory-gland secretions',['Semen is produced only by interstitial cells','Sperm are the fluid secreted by the prostate','Sperm and semen name exactly the same material'],'One term names a cell; the other names a mixture.','Sperm are reproductive cells. Semen is the mixture of cells and gland secretions.')],
 'writing':[
 ('Trace the sperm pathway from its production site to the outside. Include where maturation occurs.','Sperm form in seminiferous tubules, enter the epididymis for maturation and storage, then move through the vas deferens, ejaculatory duct and urethra to the outside through the penis.',['Names production and maturation sites correctly.','Places the major transport ducts in order.']),
 ('Explain why a blocked vas deferens could prevent sperm from appearing in semen without stopping all semen production.','The duct blockage interrupts sperm transport. Seminal vesicles, the prostate and bulbourethral glands add secretions through other connections. Some gland fluid can still enter the downstream pathway.',['Distinguishes transport from gland secretion.','Does not infer loss of testosterone solely from a blocked duct.'])],
 'self':('Does a sperm travel through the urinary bladder?','No. Follow the reproductive ducts to the urethra. The bladder belongs to the urine-storage pathway.')
},
{
 'title':'Sperm production and sperm structure','question':'How do cells in the testis produce and support a specialised gamete?',
 'goal':'Distinguish developing sperm, Sertoli cells and interstitial cells, and connect sperm structures with their functions.',
 'prior':'Seminiferous tubules produce sperm. The epididymis provides a different location for maturation.',
 'pages':[480,481], 'slides':[11,12,13,14,15], 'anchors':['spermatogenesis','Sertoli cell','interstitial cell','acrosome'],
 'sections':[
 ('Three cell roles in and around a tubule',[
 'Spermatogenesis is the production of sperm. It takes place in the seminiferous tubules. The tubule wall contains developing reproductive cells at different stages, with more mature cells generally nearer the central space, or lumen.',
 'Sertoli cells lie within the tubules and support developing sperm. They provide nourishment and help maintain the local conditions needed for development. A Sertoli cell is not an immature sperm and does not turn into one.',
 'Interstitial cells, also called Leydig cells, lie between the seminiferous tubules. They release testosterone. This location is a useful diagram clue: support cells within the tubule; testosterone-producing cells between tubules.'
 ]),
 ('One meiosis has two divisions',[
 'Spermatogonia are the starting reproductive cells. They divide by mitosis, maintaining a supply of cells and producing cells that can develop into primary spermatocytes. Before meiosis, DNA is copied.',
 'A primary spermatocyte undergoes meiosis I to produce two secondary spermatocytes. Each secondary spermatocyte then undergoes meiosis II, producing a total of four spermatids from the original primary spermatocyte. These are two divisions within one process of meiosis, not two complete cycles of meiosis.',
 'The resulting spermatids are haploid: they contain one set of chromosomes, 23 in humans. They then differentiate, or become specialised, into sperm. Differentiation changes their structure; it is not another division that halves the chromosome number. Chapter 16 will explain the chromosome movements in detail.'
 ]),
 ('A sperm is specialised for transport and fertilization',[
 'The head contains the nucleus with the haploid chromosome set. The acrosome is a cap near the front of the head. It contains enzymes that help the sperm pass through the egg’s surrounding layers.',
 'The middle piece contains many mitochondria. These supply ATP used in sperm activity. The long flagellum, or tail, produces movement. The tail does not carry the main nuclear chromosome set, and the acrosome is not the sperm’s energy source.',
 'Sperm released from the tubules are not yet fully ready for their journey. Maturation in the epididymis develops their capacity to move. Additional changes occur in the female reproductive tract before fertilization; these do not change the site where sperm were originally produced.'
 ]),
 ('Predict a change by identifying the cell or structure',[
 'Damage to a Sertoli cell can disrupt support for developing sperm. Damage to an interstitial cell can reduce testosterone production. Damage to a sperm’s flagellum can affect movement even when the head carries a chromosome set.',
 'These are different problems with different first effects. In a question, name the affected part, state its normal role and then explain the likely consequence. Do not answer every testis question with “less testosterone” or every sperm question with “cannot fertilize” without explaining the link.'
 ])],
 'figures':{0:'testis-cells',2:'sperm-structure'},
 'worked':('Normal sperm count, poor movement','A sample contains many sperm with heads and acrosomes, but their flagella are not functioning normally.',[
 'Identify the affected structure: the flagellum.',
 'Recall its role: movement, powered by ATP supplied through cell metabolism.',
 'Predict the immediate consequence: reduced ability to move effectively along the reproductive tract.',
 'Limit the conclusion: this observation does not itself show that meiosis, chromosome number or testosterone production was abnormal.'
 ]),
 'guided':[
 ('Which cell is inside a seminiferous tubule and supports developing sperm?','Sertoli cell','Interstitial cell','Secondary spermatocyte','Which cells provide support rather than becoming gametes?','Sertoli cells support developing sperm. Secondary spermatocytes are stages in the reproductive-cell pathway.'),
 ('Four haploid spermatids have formed. What must happen next to produce specialised sperm?','Differentiation','Another reduction of chromosome number','Formation of four interstitial cells','Separate a change of cell shape from another division.','Spermatids differentiate by developing structures such as the acrosome and flagellum.')],
 'check':[
 ('A cell lies between seminiferous tubules and releases testosterone. What is it?','Interstitial cell',['Sertoli cell','Spermatid','Spermatogonium'],'Use both its position and its product.','Interstitial, or Leydig, cells between tubules release testosterone.'),
 ('Which sperm structure is most directly involved in helping penetrate the egg’s surrounding layers?','Acrosome',['Flagellum','Middle piece','Nuclear chromosome set'],'Look for the structure containing enzymes rather than ATP-producing organelles.','Acrosomal enzymes help the sperm pass through surrounding layers; the tail mainly contributes movement.')],
 'writing':[
 ('Explain why Sertoli cells and interstitial cells are not interchangeable. Include location and function.','Sertoli cells are within seminiferous tubules and support developing sperm. Interstitial cells are between tubules and release testosterone. Both contribute to reproduction but perform different jobs.',['Gives both locations.','Connects each cell type to its correct function.']),
 ('Trace the main stages from a primary spermatocyte to sperm. Distinguish meiosis from differentiation.','Meiosis I produces two secondary spermatocytes. Meiosis II produces four haploid spermatids in total. These differentiate into sperm with specialised heads, middle pieces and flagella. Differentiation does not halve chromosome number again.',['Distinguishes the two meiotic divisions.','States the four haploid products and subsequent differentiation.'])],
 'self':('Would four sperm produced from one primary spermatocyte be four identical copies?','No. Meiosis produces haploid cells with genetic variation. Their detailed chromosome combinations are studied in Chapter 16.')
},
{
 'title':'Hormonal control of the male reproductive system','question':'How can a hormone from the testis regulate the signals that stimulated it?',
 'goal':'Trace GnRH, FSH, LH and testosterone through their release sites and targets, and use negative feedback to predict a change.',
 'prior':'The hypothalamus and anterior pituitary are different structures. A tropic hormone acts on another endocrine gland.',
 'pages':[492,495], 'slides':[16,17,18,19,20], 'anchors':['GnRH','FSH','LH','testosterone'],
 'sections':[
 ('Start the pathway at the hypothalamus',[
 'The hypothalamus releases gonadotropin-releasing hormone, abbreviated GnRH. GnRH stimulates the anterior pituitary to release follicle-stimulating hormone, FSH, and luteinizing hormone, LH. The names can be misleading in males, so focus on the target of each signal.',
 'FSH acts on Sertoli cells in the seminiferous tubules. It supports the Sertoli-cell functions needed for sperm production. LH acts on interstitial cells between the tubules, stimulating them to release testosterone.',
 'FSH and LH therefore leave the same gland but act on different cells. Do not draw a single arrow from both hormones to an undifferentiated “testis” and stop there. Identifying the target cells explains the different effects.'
 ]),
 ('Testosterone supports more than one response',[
 'Testosterone helps maintain sperm production and reproductive tissues. At puberty it contributes to changes such as facial-hair growth, a deeper voice and changes in muscle development. The hormone reaches target tissues through the blood.',
 'Inside the testis, testosterone and FSH-supported Sertoli-cell activity work together to support spermatogenesis. Testosterone is not a sperm cell, and an LH signal does not directly turn an interstitial cell into a sperm.',
 'Androgens are a group of hormones associated with male reproductive development; testosterone is the main androgen considered here. Small amounts of hormones commonly associated with one reproductive system may also occur in the other. Their effects depend on concentration, timing and responsive tissues.'
 ]),
 ('Follow the feedback arrows back',[
 'As testosterone rises, it reduces the stimulation coming from the hypothalamus and anterior pituitary. This negative feedback limits GnRH and especially LH release, which in turn reduces stimulation of testosterone-producing cells.',
 'Sertoli cells also release inhibin. Inhibin reduces FSH release from the anterior pituitary and helps regulate the sperm-production pathway. Treat inhibin as an additional feedback signal; the main named pathway to master is GnRH, FSH, LH and testosterone.',
 'Negative feedback does not mean that a hormone is harmful or that every concentration is falling. It means the response tends to oppose the change that initiated it. When testosterone is low and the control centres function, reduced feedback can permit more stimulation.'
 ]),
 ('Explain an outside-hormone effect using the normal loop',[
 'An outside source of testosterone or an anabolic androgen can increase androgen feedback. The hypothalamus and anterior pituitary may then reduce their signals. Lower FSH and LH can reduce the testis’s own activity and sperm production.',
 'The prediction comes from the loop: a higher hormone measurement does not necessarily mean more sperm are being made. This is an explanation of feedback, not advice about using hormones. Do not infer a person’s hormone state from appearance or one nonspecific symptom.'
 ])],
 'figures':{0:'male-feedback'},
 'worked':('Low LH with functioning interstitial cells','In a simplified model, LH release falls while the interstitial cells remain capable of responding.',[
 'Locate LH’s source: the anterior pituitary.',
 'Locate LH’s target: interstitial cells in the testis.',
 'Reduce the stimulation in the model: less LH tends to mean less testosterone release.',
 'Consider feedback: lower testosterone reduces inhibitory feedback. If the control centres can respond, they may increase stimulation. The reason LH first fell is not established by this model.'
 ]),
 'guided':[
 ('FSH release falls. Which target loses direct stimulation first?','Sertoli cells','Interstitial cells','The epididymal duct wall','FSH and LH have different targets within the testis.','FSH supports Sertoli-cell activity; LH is the direct signal to interstitial cells.'),
 ('Testosterone rises above its usual level in this functioning model. What feedback response is expected?','Reduced GnRH and LH stimulation','Increased GnRH and LH stimulation','Conversion of LH into FSH','Trace the return arrow, not just the downward pathway.','Higher testosterone strengthens negative feedback, reducing upstream stimulation.')],
 'check':[
 ('Which source → hormone → target chain is correct?','Anterior pituitary → LH → interstitial cells',['Hypothalamus → testosterone → anterior pituitary','Interstitial cells → FSH → Sertoli cells','Anterior pituitary → FSH → interstitial cells'],'Match a release site and its direct target.','LH is released by the anterior pituitary and stimulates testosterone-producing interstitial cells.'),
 ('Why can an outside androgen source reduce sperm production?','Negative feedback can reduce FSH and LH stimulation',['The androgen must block the vas deferens physically','Androgens change sperm into Sertoli cells','The anterior pituitary begins making sperm instead'],'Use the normal feedback loop rather than inventing a duct blockage.','Outside androgen can suppress upstream signals, reducing support for the testis’s normal sperm-production activity.')],
 'writing':[
 ('Trace two branches from GnRH to their testicular targets. Explain how the branches support sperm production.','GnRH from the hypothalamus stimulates the anterior pituitary. FSH supports Sertoli cells in seminiferous tubules; LH stimulates interstitial cells to release testosterone. Sertoli-cell activity and testosterone support sperm production.',['Correct sources, hormones and targets.','Explains the relationship to spermatogenesis.']),
 ('In a functioning feedback model, explain what rising testosterone does to its upstream stimulation. Why is this negative feedback?','Rising testosterone inhibits hypothalamic and pituitary stimulation, reducing GnRH and LH. This tends to limit further testosterone production, opposing the initial rise. Negative refers to the opposing response, not an undesirable effect.',['Traces feedback back to control centres.','Explains opposition to the original change.'])],
 'self':('Does LH make sperm directly?','No. LH stimulates interstitial cells to release testosterone. FSH acts on Sertoli cells; these signals support the sperm-production process.')
},
{
 'title':'Female reproductive structures and the egg pathway','question':'How do the reproductive structures support transport, fertilization and development?',
 'goal':'Locate the ovaries, oviducts, uterus, endometrium, cervix and vagina, and trace the paths of an egg and sperm.',
 'prior':'Keep an organ separate from its lining. The uterus is an organ; the endometrium is its inner lining.',
 'pages':[482,485], 'slides':[21,22,23], 'anchors':['ovary','oviduct','uterus','endometrium'],
 'sections':[
 ('The ovaries and oviducts have different jobs',[
 'The ovaries contain developing oocytes and the supporting cells around them. These supporting cells also release hormones. Ovulation is the release of a secondary oocyte from an ovary. We often call this released cell an egg in general explanations.',
 'Each oviduct, also called a Fallopian tube or uterine tube, leads toward the uterus. Its fringed end lies near an ovary but is not a sealed pipe attached directly to it. The fimbriae and movement near the tube opening help guide the released oocyte into the oviduct.',
 'Cilia and muscular activity move material along the oviduct. Fertilization normally occurs in an oviduct, not in the ovary or the uterus. Producing an oocyte and providing the site where it may meet a sperm are different functions.'
 ]),
 ('The uterus is more than its lining',[
 'The uterus is a muscular organ in which development can continue after implantation. Its thick muscular wall can contract. The endometrium is the inner lining, which changes during the menstrual cycle.',
 'The endometrium develops a blood supply and glandular tissue that help prepare for possible implantation. If a pregnancy is not maintained, part of this lining is shed during menstruation. Menstruation is not the loss of the entire uterine wall.',
 'The cervix is the lower, narrow region of the uterus that opens into the vagina. The vagina connects the cervix to the outside and receives semen during vaginal intercourse. It also provides a route for menstrual flow and, during vaginal birth, for delivery.'
 ]),
 ('Trace two travellers, not one memorized arrow',[
 'Follow an oocyte after ovulation: ovary → region of the fimbriae → oviduct → uterus. An unfertilized oocyte does not attach to the endometrium and develop into an embryo.',
 'Sperm deposited in the vagina must move through the cervix and uterus toward an oviduct. The travellers approach from different directions. Their usual meeting place is the oviduct.',
 'If fertilization occurs, early cell divisions can begin as the developing structure moves toward the uterus. Implantation occurs later in the endometrium. Fertilization and implantation are different events in different locations; Chapter 15 develops that sequence.'
 ]),
 ('Locate a problem before predicting the effect',[
 'A blocked oviduct can interfere with sperm reaching the oocyte or with movement toward the uterus. That does not by itself show that the ovary has stopped releasing hormones.',
 'Likewise, damage to the endometrium concerns the implantation environment rather than the initial production of an oocyte. Distinguishing production, transport and support makes anatomy questions much easier to reason through.'
 ])],
 'figures':{0:'female-anatomy'},
 'worked':('Fertilization versus implantation','A student places both fertilization and implantation in the uterus because it is where pregnancy develops.',[
 'Separate the events. Fertilization combines the genetic contributions of sperm and egg.',
 'Identify the usual meeting place: an oviduct.',
 'Identify the later attachment site: the endometrium of the uterus.',
 'Connect them with transport and early division. They belong to one developmental sequence but do not occur at the same place or time.'
 ]),
 'guided':[
 ('Which structure is the inner lining that changes during the menstrual cycle?','Endometrium','Cervix','Oviduct','One answer is a tissue layer rather than a passage.','The endometrium is the uterine lining. The cervix and oviduct are different structures.'),
 ('What is the next major region sperm reach after passing through the cervix?','Uterus','Ovary','Vagina','Trace inward from the vagina.','The cervix opens into the uterus. Sperm can then move toward an oviduct.')],
 'check':[
 ('Where does fertilization normally occur?','Oviduct',['Endometrium','Ovary','Cervix'],'Distinguish the site where gametes meet from the later site of attachment.','Fertilization normally occurs in an oviduct. Implantation occurs later in the uterine endometrium.'),
 ('A model has an open oviduct but a damaged endometrium. Which function is most directly threatened?','Providing a suitable site for implantation',['Producing testosterone in interstitial cells','Producing oocytes in ovarian follicles','Moving sperm through the epididymis'],'Identify the endometrium’s normal role.','The endometrium provides the uterine environment for implantation; it is not the site of oocyte production.')],
 'writing':[
 ('Trace the usual routes of a sperm deposited in the vagina and an oocyte released from an ovary until they may meet.','Sperm move from the vagina through the cervix and uterus toward an oviduct. The released oocyte is guided near the fimbriae into an oviduct. Fertilization can occur there.',['Correctly orders both routes.','Identifies the normal meeting site.']),
 ('Explain the difference between uterus, endometrium and cervix. Connect each with one function.','The uterus is a muscular organ supporting pregnancy. The endometrium is its inner lining and the implantation site. The cervix is the narrow lower region connecting the uterus with the vagina.',['Distinguishes organ, lining and lower opening region.','Assigns an appropriate function to each.'])],
 'self':('Is menstruation the shedding of the whole uterus?','No. Part of the endometrium is shed. The muscular organ remains.')
},
{
 'title':'Oogenesis and ovarian follicles','question':'What happens to the oocyte and its surrounding cells before and after ovulation?',
 'goal':'Distinguish an oocyte, a follicle and a corpus luteum, and explain how their roles change across ovulation.',
 'prior':'An ovary is an organ. An oocyte is a cell within it. Do not use these names interchangeably.',
 'pages':[482,484,496,497], 'slides':[24,25,26], 'anchors':['oogenesis','oocyte','follicle','corpus luteum'],
 'sections':[
 ('An oocyte develops with support',[
 'Oogenesis is the process that produces the female gamete. Oocytes develop within ovarian follicles. A follicle contains an oocyte surrounded by supporting cells, so it is not simply another name for the egg.',
 'Before birth, many oocytes begin development and enter meiosis. They remain paused for an extended period. From puberty onward, hormonal signals support further development of a group of follicles during a cycle. Usually one becomes the dominant follicle that proceeds toward ovulation.',
 'The ovaries begin life with a finite supply of oocytes rather than continually replacing that supply in the same way as spermatogonia in the testes. Do not assume the two ovaries must take perfectly alternating monthly turns.'
 ]),
 ('Unequal division leaves one large cell',[
 'During oogenesis, cell divisions do not divide the cytoplasm equally among four equally sized cells. Most cytoplasm is retained in one large cell, while smaller polar bodies receive much less. Retaining cytoplasm supports the early stages after fertilization.',
 'The cell released at ovulation is a secondary oocyte. It has one set of chromosomes but has not yet completed meiosis II. Entry of a sperm can trigger completion of that division. At this stage of the course, “egg” is a convenient general term; recognise the more precise oocyte term when identifying a diagram.',
 'This differs from spermatogenesis, where one primary spermatocyte can yield four sperm. The comparison concerns chromosome reduction and the distribution of cytoplasm, not which gamete is more important.'
 ]),
 ('The follicle changes before ovulation',[
 'As a follicle grows, its supporting cells increase their release of estrogen. A developing follicle therefore has both a support role for an oocyte and an endocrine role. Estrogen helps stimulate growth of the endometrium.',
 'Ovulation releases the oocyte from the mature follicle. The whole ovary is not released, and the entire follicle does not travel down the oviduct. Most of the follicular tissue remains in the ovary.'
 ]),
 ('After ovulation, the remaining tissue changes roles',[
 'The remaining follicular tissue forms the corpus luteum, a temporary endocrine structure in the ovary. It releases progesterone and some estrogen. Progesterone supports the endometrium after ovulation.',
 'Without a signal supporting pregnancy, the corpus luteum regresses. Its hormone output falls. That fall is important for the start of the next menstrual flow; it is not caused simply by the egg reaching a particular place.',
 'The same original follicle therefore gives rise to two different things: an oocyte released toward the oviduct and hormone-producing tissue that remains in the ovary. Keep these two paths separate when you read a follicle diagram.'
 ])],
 'figures':{2:'follicle-development'},
 'worked':('What remains in the ovary?','A diagram shows a cell leaving a mature follicle and a yellow structure developing where the follicle was.',[
 'The released cell is the secondary oocyte; its route is toward the oviduct.',
 'The remaining follicular tissue stays in the ovary.',
 'That tissue forms the corpus luteum, which releases mainly progesterone as well as estrogen.',
 'Connect the effect: these hormones support the endometrium. The corpus luteum is not the released egg or a developing embryo.'
 ]),
 'guided':[
 ('What does a follicle contain before ovulation?','An oocyte and supporting cells','Only a mature sperm','A complete embryo implanted in the uterus','Separate the reproductive cell from its support structure.','A follicle consists of an oocyte and the surrounding supporting cells.'),
 ('Which structure forms from tissue remaining after the oocyte is released?','Corpus luteum','Endometrium','Epididymis','Follow the tissue left in the ovary.','The remaining follicular tissue forms the corpus luteum; it does not become the uterine lining.')],
 'check':[
 ('Which statement correctly distinguishes an oocyte from the corpus luteum?','The oocyte is released; the corpus luteum forms from tissue remaining in the ovary',['The corpus luteum is the released oocyte','Both move through the oviduct together','The oocyte forms from the uterine lining'],'Track what leaves the ovary and what remains.','Ovulation releases the oocyte while the remaining follicular tissue forms a temporary endocrine structure.'),
 ('Why is cytokinesis unequal during oogenesis?','It retains most cytoplasm in one large reproductive cell',['It doubles the final chromosome number','It creates four equally sized motile gametes','It prevents any cell from becoming haploid'],'Focus on cytoplasm, not an extra chromosome set.','Most cytoplasm and its resources remain in one large cell rather than being divided equally among four gametes.')],
 'writing':[
 ('Follow an ovarian follicle from growth through ovulation and corpus-luteum formation. Include the changing hormone output.','Growing follicles support an oocyte and release increasing estrogen. Ovulation releases the secondary oocyte. Remaining follicular tissue forms the corpus luteum, which releases mainly progesterone and some estrogen.',['Separates released cell from remaining tissue.','Associates estrogen and progesterone with the correct stages.']),
 ('Compare the products of spermatogenesis and oogenesis without giving the detailed phases of meiosis.','Both reduce the chromosome sets to produce haploid reproductive cells. A primary spermatocyte can yield four sperm. Oogenesis retains most cytoplasm in one large cell and produces small polar bodies; the released secondary oocyte completes meiosis II if fertilization occurs.',['Recognises haploid outcome.','Explains the unequal distribution of cytoplasm and different functional products.'])],
 'self':('Does the corpus luteum travel to the uterus?','No. It remains in the ovary and releases hormones into the blood. Those hormones act on target tissues, including the uterus.')
},
{
 'title':'Coordinating the ovarian and uterine cycles','question':'How can events in the ovary prepare a different organ for implantation?',
 'goal':'Connect follicular development, ovulation and corpus-luteum activity with changes in the endometrium.',
 'prior':'Estrogen from a developing follicle supports endometrial growth. Progesterone from the corpus luteum supports the lining after ovulation.',
 'pages':[496,498,500], 'slides':[29,30,31,32,33], 'anchors':['menstruation','follicular phase','ovulation','luteal phase'],
 'sections':[
 ('Two cycles describe two locations',[
 'The ovarian cycle describes changes in the ovary: follicle development, ovulation and corpus-luteum activity. The uterine cycle describes changes in the endometrium. These events are coordinated by hormones carried in the blood.',
 'The familiar 28-day cycle is an illustrative model, not a timetable that every person follows. In this model, day 1 is the first day of menstrual flow and ovulation is placed near day 14. Real cycle lengths and ovulation timing vary.',
 'The ovarian cycle has a follicular phase before ovulation and a luteal phase after it. Menstrual flow occurs during the early follicular phase. Flow, follicular development, ovulation and luteal activity are useful teaching landmarks, but flow and the follicular phase are not completely separate time periods.'
 ]),
 ('Flow and early follicular development overlap',[
 'Near the end of a cycle without pregnancy, the corpus luteum regresses and estrogen and progesterone fall. Part of the endometrium then breaks down and is shed. This menstrual flow marks the beginning of the next cycle.',
 'At the same time, reduced hormone feedback allows FSH-supported follicular development to begin again. A student who draws menstruation as a period when nothing happens in the ovary has missed this overlap.',
 'As a follicle develops, estrogen output rises. Estrogen helps rebuild and thicken the endometrium. An event in the ovary produces a signal that reaches the uterus; the follicle itself does not move there.'
 ]),
 ('Ovulation separates the two ovarian phases',[
 'Ovulation releases the secondary oocyte. In the 28-day model it is drawn near the midpoint, but the biological event—not simply a calendar number—marks the transition.',
 'After ovulation, remaining follicular tissue forms the corpus luteum. Its progesterone output helps maintain and prepare the endometrium. Estrogen also contributes. The lining becomes a supportive environment for possible implantation.',
 'The luteal phase therefore has a different dominant ovarian structure and hormone pattern from the follicular phase. Before ovulation, think growing follicle and rising estrogen. After ovulation, think corpus luteum and elevated progesterone.'
 ]),
 ('Explain how the next cycle begins',[
 'If pregnancy is not established, the corpus luteum regresses and hormone levels fall. The endometrium is no longer maintained in the same way, so menstrual flow follows. A decline in ovarian hormones links the end of one cycle with the start of another.',
 'An unfertilized oocyte survives for a limited time after ovulation, but menstruation does not begin immediately when it is no longer viable. The hormone-producing corpus luteum can remain active for days afterwards. Use the hormone sequence, not the egg’s survival alone, to explain menstrual timing.'
 ])],
 'figures':{2:'cycle-coordination'},
 'worked':('A change in one organ affects another','A model shows the corpus luteum regressing while the endometrium begins to break down.',[
 'Locate the initial change in the ovary: corpus-luteum regression.',
 'Identify the hormonal consequence: progesterone and estrogen fall.',
 'Identify the target response in the uterus: the endometrium loses hormonal support.',
 'Explain the observed flow: part of the lining is shed, beginning the next cycle. The ovary and uterus are linked by signals, not by the corpus luteum moving into the uterus.'
 ]),
 'guided':[
 ('On day 2 of the illustrative cycle, menstrual flow is occurring. Which ovarian phase is also underway?','Follicular phase','Luteal phase','Ovulation','Flow is a uterine event; ovarian development does not pause.','Menstrual flow occurs during the early follicular phase.'),
 ('Progesterone has risen after ovulation. Which ovarian structure is the main source in this cycle?','Corpus luteum','Endometrium','An unfertilized oocyte','Look for the endocrine tissue that forms after ovulation.','The corpus luteum releases progesterone, supporting the endometrium.')],
 'check':[
 ('What most directly links corpus-luteum regression with menstruation?','A fall in progesterone and estrogen',['A rise in sperm production','The corpus luteum entering the cervix','A new oocyte becoming diploid'],'Follow the chemical signals between ovary and uterus.','Regression reduces hormone support for the endometrium, contributing to its shedding.'),
 ('Which statement uses the 28-day model appropriately?','It illustrates a sequence; actual cycle lengths and ovulation timing can vary',['Every person ovulates exactly on day 14','The follicular phase starts only after menstrual flow ends','The model guarantees which days cannot result in pregnancy'],'A model can explain relationships without giving a universal calendar.','The model illustrates coordination, not an exact prediction for every individual or a contraceptive guarantee.')],
 'writing':[
 ('Connect ovarian and uterine events before and after ovulation. Include the source and effect of estrogen and progesterone.','Before ovulation, a growing follicle releases estrogen that helps rebuild the endometrium. After ovulation, the corpus luteum releases progesterone and some estrogen that maintain and prepare the lining. These hormones coordinate organs through the blood.',['Correctly distinguishes before and after ovulation.','Connects ovarian structures, hormones and uterine responses.']),
 ('Why can menstrual flow and follicular development occur at the same time?','They describe events in different organs. At the start of a cycle, part of the endometrium is being shed while FSH supports development of follicles in the ovary. The ovarian and uterine cycles overlap and are hormonally coordinated.',['Names the two locations.','Explains simultaneous events rather than mutually exclusive phases.'])],
 'self':('Does an oocyte’s failure to be fertilized cause menstruation the next day?','No. The important link is the later decline in corpus-luteum hormone output, which removes support for the endometrium.')
},
{
 'title':'Hormone changes across the menstrual cycle','question':'How do hormone graphs reveal the control sequence behind the cycle?',
 'goal':'Interpret FSH, LH, estrogen and progesterone patterns and explain the switch from negative to positive feedback before ovulation.',
 'prior':'A graph shows a variable against an axis. Check what is measured before comparing the height of different curves.',
 'pages':[495,498,500,502], 'slides':[27,28,29,30,31,32,33], 'anchors':['estrogen','progesterone','LH surge','negative feedback'],
 'sections':[
 ('Build the normal pathway before reading the graph',[
 'GnRH from the hypothalamus stimulates the anterior pituitary. The anterior pituitary releases FSH and LH. These are pituitary hormones, whereas estrogen and progesterone in this cycle are produced by ovarian tissues.',
 'FSH supports follicular development. As the dominant follicle develops, estrogen increases and promotes endometrial growth. Through much of the follicular phase, estrogen contributes to negative feedback that limits further FSH stimulation.',
 'Do not use “female hormone” as a substitute for a source and target. A graph question often depends on distinguishing the hormone that stimulates an ovarian event from the hormone released as a result of that event.'
 ]),
 ('The pre-ovulatory rise changes the feedback response',[
 'Sustained high estrogen near the end of follicular development produces a different feedback response: it promotes a strong pituitary LH surge. This is positive feedback because the high estrogen signal promotes further stimulation rather than limiting it.',
 'The LH surge helps trigger ovulation and the changes that form the corpus luteum. FSH also shows a smaller rise around this time. The large, brief midcycle LH peak is the clearest landmark in the usual graph.',
 '“Estrogen inhibits the pituitary” is therefore incomplete without the timing and level. Most of the time we describe an inhibitory contribution; sustained high pre-ovulatory estrogen contributes to the positive-feedback event that leads to the LH surge.'
 ]),
 ('After ovulation, follow progesterone',[
 'Once the corpus luteum forms, progesterone rises and estrogen also remains present. These hormones support the endometrium and provide negative feedback on the hypothalamic-pituitary signals. This helps limit another ovulation during the same luteal phase.',
 'Without pregnancy support, corpus-luteum activity declines and progesterone and estrogen fall near the end of the cycle. A broad progesterone rise after the LH surge therefore fits the sequence better than a progesterone peak causing the earlier follicle to begin growing.'
 ]),
 ('Read a hormone graph in four passes',[
 'First, read the axes and key. A curve drawn higher on a graph of relative levels does not prove that hormone has the greatest mass concentration in blood. Different hormones may use different scales.',
 'Second, identify the order of changes: estrogen rises before the large LH surge; progesterone rises after ovulation. Third, connect each change to its source and target. Fourth, state the limits of the evidence. A model graph supports a sequence; it does not diagnose an individual from one sample.',
 'When comparing an unfamiliar graph with the normal model, name the missing or shifted event. “There is no clear LH surge” is a more useful observation than “the graph is wrong.” Then explain what that change could mean within the stated model.'
 ])],
 'figures':{3:'cycle-hormones'},
 'worked':('A rise followed by a surge','An illustrative graph shows a sustained estrogen rise, then a short LH peak, followed by a broad progesterone rise.',[
 'Read the order rather than memorizing colours: estrogen first, LH surge next, progesterone later.',
 'Connect the first transition: sustained high estrogen supports positive feedback and an LH surge.',
 'Connect LH to ovulation and formation of the corpus luteum.',
 'Connect the later progesterone rise to corpus-luteum activity and support of the endometrium. The graph uses relative levels, so do not compare absolute hormone quantities.'
 ]),
 'guided':[
 ('What change most directly precedes the LH surge in the normal model?','Sustained high estrogen from the developing follicle','Regression of the corpus luteum at the end of the cycle','A fall in all ovarian hormones','Look immediately before ovulation, not at the start of the next cycle.','Sustained high pre-ovulatory estrogen contributes to positive feedback and the LH surge.'),
 ('A broad progesterone rise occurs after the LH peak. What ovarian change explains it?','Formation of an active corpus luteum','Loss of every follicular cell from the ovary','The oocyte becoming a hormone-producing gland','Which endocrine structure develops after ovulation?','The corpus luteum forms from remaining follicular tissue and releases progesterone.')],
 'check':[
 ('Which hormone change most directly triggers ovulation in the usual cycle?','LH surge',['Fall in all pituitary hormones','Peak in inhibin alone','Regression of the corpus luteum'],'Identify the pituitary signal linked to the release event.','A large LH surge helps trigger ovulation and luteinization of the remaining follicular tissue.'),
 ('Why is the pre-ovulatory estrogen–LH relationship an example of positive feedback?','High estrogen promotes increased pituitary stimulation leading to an LH surge',['Estrogen removes every inhibitory signal permanently','Progesterone has already caused menstruation','The hormone concentrations cannot change after the surge'],'Positive feedback reinforces a response rather than opposing it.','Sustained high estrogen promotes the LH surge; this differs from its inhibitory contribution at other parts of the cycle.')],
 'writing':[
 ('Explain the normal order of estrogen, LH and progesterone changes around ovulation. Name the relevant ovarian structures.','A growing follicle releases increasing estrogen. Sustained high estrogen promotes an LH surge from the anterior pituitary. The surge triggers ovulation and corpus-luteum formation. The corpus luteum releases progesterone after ovulation.',['Correct order and hormone sources.','Connects hormone changes with follicle, ovulation and corpus luteum.']),
 ('Two curves use different vertical scales. Explain why comparing their visual heights may be misleading and describe a comparison you can still make.','Height on different scales does not directly compare absolute blood concentrations. We can compare the timing of increases, peaks and decreases and relate their order to events such as ovulation.',['Recognises the scale limitation.','Uses timing or within-hormone change for a valid comparison.'])],
 'self':('Is estrogen’s feedback always negative?','No. Sustained high estrogen before ovulation contributes to positive feedback that helps produce the LH surge. Timing and level matter.')
},
{
 'title':'When hormone patterns change','question':'How can you use the normal feedback system without jumping to a diagnosis?',
 'goal':'Explain model changes associated with ovarian ageing, early pregnancy and combined hormonal contraception using hormone sources, targets and feedback.',
 'prior':'Learn the normal follicle → ovulation → corpus luteum sequence before using it to predict a change.',
 'pages':[495,498,499,502], 'slides':[19,20,34,35], 'anchors':['menopause','hCG','hormonal contraception','feedback'],
 'sections':[
 ('A change in a pattern is evidence, not a complete diagnosis',[
 'A hormone graph may show no LH surge, low progesterone after the expected ovulation time, or unusually sustained ovarian-hormone levels. Start by describing the observation before explaining it.',
 'Within a simplified model, no LH surge can mean that the normal trigger for ovulation is missing. Low progesterone later can be consistent with little corpus-luteum activity. These observations do not identify every possible cause, and a single sample may miss a brief peak.',
 'Reproductive hormone patterns can change with developmental stage, pregnancy, health and external hormone exposure. Symptoms such as fatigue or a changed menstrual pattern are not enough by themselves to diagnose a specific hormonal condition.'
 ]),
 ('Ovarian ageing changes the feedback signal',[
 'As the supply and activity of ovarian follicles decline, ovulation becomes less regular. During the transition to menopause, hormone patterns can fluctuate. After menopause, ovarian estrogen and progesterone output is lower than during typical reproductive cycles.',
 'Reduced ovarian feedback can allow FSH and LH levels to rise. This is a useful contrast: a reduced response from the ovary does not necessarily mean reduced pituitary stimulation.',
 'Do not assume that reproductive ageing is identical in the male and female systems. The gradual changes described for testosterone do not represent a monthly cycle or a universal sudden stop in sperm production.'
 ]),
 ('Early pregnancy prevents the usual loss of support',[
 'In a cycle without pregnancy, the corpus luteum regresses and progesterone falls. During early pregnancy, developing trophoblast tissue releases human chorionic gonadotropin, hCG. This signal supports the corpus luteum so that it continues releasing hormones.',
 'Maintained progesterone helps maintain the endometrium instead of allowing the usual menstrual shedding. The placenta takes on a larger hormone-producing role later. Chapter 15 explains implantation and this transition in detail.',
 'Keep the roles separate: hCG supports the corpus luteum; the corpus luteum releases progesterone and estrogen; those hormones act on target tissues. A pregnancy test is an application of detecting hCG, but this lesson is not a guide to diagnosing pregnancy from symptoms.'
 ]),
 ('Use contraception to apply negative feedback',[
 'Combined hormonal contraceptives provide an estrogen and a progestin, a substance with progesterone-like activity. Their feedback effects reduce the normal FSH/LH stimulation and help prevent the LH surge and ovulation. Effects on cervical mucus and the uterine lining also contribute.',
 'The key relationship is external hormone signal → altered feedback → altered ovarian activity. Do not describe all contraceptive methods as working this way. Physical barriers and surgery act through different mechanisms, and not every hormonal method suppresses ovulation in exactly the same way.',
 'Preventing pregnancy and reducing infection transmission are different goals. A contraceptive pill does not provide protection against STIs. This is a mechanism comparison, not a recommendation for an individual method or a dosing instruction.'
 ])],
 'worked':('Less ovarian output, more pituitary stimulation','A simplified model has declining follicular activity and reduced ovarian-hormone feedback, with a functioning hypothalamus and pituitary.',[
 'Identify the initial change: less ovarian hormone output.',
 'Trace feedback backward: less inhibitory signal reaches the control centres.',
 'Predict the upstream response: FSH and LH stimulation can rise.',
 'State the limitation: more stimulation does not ensure that the ovary can respond. This model alone does not identify the cause in an individual.'
 ]),
 'guided':[
 ('Which signal helps maintain the corpus luteum in early pregnancy?','hCG','A new monthly LH surge','The loss of all pituitary activity','Follow the signal from developing trophoblast tissue.','hCG supports the corpus luteum, helping sustain progesterone and estrogen output.'),
 ('Why does a combined contraceptive pill not protect against an STI?','Changing hormonal feedback does not create a barrier to pathogen transmission','FSH is itself a pathogen','Every STI can enter only during ovulation','Separate the target of the hormone from the route of infection.','A hormonal method alters reproductive signalling; it does not prevent exposure to infectious organisms.')],
 'check':[
 ('In a functioning control system, reduced ovarian hormone feedback can produce which response?','Increased FSH and LH stimulation',['A guaranteed new pregnancy','A complete loss of all pituitary hormone production','Movement of the ovaries into the uterus'],'Less inhibition can permit more upstream stimulation.','Reduced ovarian feedback can allow the pituitary signals to rise even when ovarian responsiveness is reduced.'),
 ('Which statement correctly explains one effect of combined hormonal contraception?','Feedback can reduce the normal LH surge and prevent ovulation',['It permanently removes all oocytes','It blocks the vas deferens','It guarantees protection against bacterial and viral STIs'],'Identify the hormonal signal controlling ovulation.','The supplied hormone signals alter feedback and help prevent the pituitary surge needed for ovulation.')],
 'writing':[
 ('Explain why low ovarian hormone output and high pituitary hormone output can occur together.','Lower ovarian estrogen/progesterone reduces inhibitory feedback on the hypothalamus and anterior pituitary. FSH and LH can therefore rise. Increased stimulation does not guarantee an ovarian response.',['Uses negative feedback correctly.','Separates stimulation from target responsiveness.']),
 ('Contrast a cycle without pregnancy with early pregnancy in terms of corpus-luteum activity and endometrial support.','Without pregnancy support the corpus luteum regresses, progesterone and estrogen fall, and part of the endometrium is shed. During early pregnancy, hCG supports the corpus luteum and hormone output helps maintain the lining.',['Connects corpus luteum to hormones and lining in both cases.','Identifies hCG’s early supporting role.'])],
 'self':('Would low progesterone in one sample prove that ovulation never occurred?','No. Sample timing and the wider pattern matter. State what the sample shows before deciding what it can support.')
},
{
 'title':'STIs and reproductive function','question':'How can an infection interfere with reproduction even when hormone production continues?',
 'goal':'Explain how sexually transmitted infections can affect tissue, transport and fertility, and distinguish infection prevention from conception control.',
 'prior':'An open, functioning reproductive pathway matters as well as gamete production and hormonal signalling.',
 'pages':[486,491], 'slides':[3], 'anchors':['STI','pathogen','pelvic inflammatory disease','infertility'],
 'sections':[
 ('An STI is an infection, not a judgement about a person',[
 'A sexually transmitted infection, or STI, is an infection that can pass through sexual contact. Different pathogens cause different infections. A pathogen is an organism or infectious agent capable of causing disease.',
 'Chlamydia, gonorrhea and syphilis are bacterial infections. HIV, hepatitis B, genital herpes and HPV are caused by viruses. You do not need to memorize every symptom. You do need to connect examples with their possible effects on health and reproduction.',
 'An infection can be present without obvious symptoms. Appearance or the absence of discomfort is therefore not a reliable way to establish that no infection is present. Avoid assumptions about a person’s behaviour or identity from an infection.'
 ]),
 ('Inflammation and scarring can interrupt transport',[
 'Untreated chlamydia or gonorrhea can cause inflammation in reproductive tissues. In the female reproductive tract, infection may spread upward and contribute to pelvic inflammatory disease, or PID. Scarring can damage or narrow oviducts.',
 'A scarred oviduct can interfere with sperm reaching an oocyte or with movement of a fertilized structure toward the uterus. This can reduce fertility and increase the risk of an ectopic pregnancy, in which implantation occurs outside the normal uterine site.',
 'In the male reproductive tract, infection and inflammation can affect structures such as the epididymis. Tissue damage can disrupt sperm maturation or transport. These consequences concern the pathway; they do not require every hormone-producing cell to stop functioning.'
 ]),
 ('Different pathogens can have different consequences',[
 'Some STIs affect more than reproductive ducts. HIV damages important immune cells; hepatitis B affects the liver. Some HPV types can cause changes in cells that increase cancer risk. Other infections can cause local lesions or inflammation.',
 'Certain infections can also pass to a developing fetus or a baby during pregnancy or birth. The route and consequences depend on the pathogen. Do not assume that every STI has the same effect or that every exposure produces the same outcome.',
 'Antibiotics act against bacteria, not viruses. This difference helps explain why treatments are not interchangeable. Treatment can address an infection without necessarily reversing scarring that has already occurred. This chapter does not provide personal treatment instructions.'
 ]),
 ('Separate three questions about prevention',[
 'First ask whether a method reduces exposure to a pathogen. Correct use of condoms reduces the risk of many STIs, although it does not eliminate every risk, especially when affected skin lies outside the covered area.',
 'Second ask whether a method prevents conception. A contraceptive pill can prevent ovulation without preventing pathogen exposure. A blocked sperm duct can prevent sperm entering semen without providing an infection barrier.',
 'Third ask whether infection has been identified and addressed. Testing and appropriate professional care matter because symptoms may be absent. In an assessment, explain the biological mechanism rather than guessing about someone’s personal health.'
 ])],
 'worked':('Normal ovulation, damaged oviduct','A hypothetical case describes normal ovulation and a scarred, blocked oviduct after an infection.',[
 'Identify what still occurs: the ovary releases an oocyte.',
 'Locate the problem: transport through the oviduct is impaired.',
 'Explain the consequence: sperm and the oocyte may not meet, or movement toward the uterus may be disrupted.',
 'Do not overstate: this description does not show that FSH, LH or ovarian hormone production has stopped. The immediate explanation is tissue damage along the pathway.'
 ]),
 'guided':[
 ('Why might the absence of symptoms fail to rule out an STI?','Some infections are asymptomatic','All pathogens immediately cause pain','Only hormone-producing cells can be infected','Consider whether every infection produces visible signs.','Some infections produce no obvious symptoms, so symptoms alone cannot establish infection status.'),
 ('Which consequence most directly follows scarring that blocks an oviduct?','Disrupted reproductive-cell transport','Automatic loss of all ovarian chromosomes','Direct conversion of bacteria into hormones','Use the normal function of an oviduct.','Scarring can obstruct the pathway where gametes meet and early development moves toward the uterus.')],
 'check':[
 ('Which chain best explains one way an STI can reduce fertility?','Infection → inflammation and scarring → disrupted transport',['Infection → guaranteed loss of all gametes → higher fertility','Infection → conversion of LH into sperm → duct blockage','Infection → immediate menstruation in every case → fertilization'],'Look for a mechanism linking tissue damage with normal reproductive function.','Inflammation and scarring can damage reproductive passages and interfere with transport.'),
 ('Which comparison is accurate?','Hormonal contraception and STI risk reduction are different functions',['All contraceptive methods prevent every STI','Antibiotics treat every viral STI','No symptoms means no infection'],'Separate pathogens, hormone signals and physical barriers.','A method that prevents ovulation does not necessarily reduce exposure to infectious organisms.')],
 'writing':[
 ('Explain how an STI could interfere with reproduction while gamete and hormone production continue.','Infection may cause inflammation and scarring in a duct such as an oviduct or epididymis. Damage can interfere with maturation or transport even when gonads continue producing cells or hormones.',['Gives a relevant reproductive structure.','Explains tissue damage and its functional effect.']),
 ('A student says, “If a method prevents pregnancy, it must prevent STIs too.” Explain the flaw using two different mechanisms.','Hormonal contraception can prevent an LH surge and ovulation; it does not form a pathogen barrier. Condoms reduce contact with some infectious material and also obstruct sperm passage, but do not eliminate every infection risk. Conception and transmission are different processes.',['Separates conception from infection transmission.','Contrasts hormonal action with barrier action without promising complete protection.'])],
 'self':('Would treating an infection necessarily remove all scarring it caused?','No. Addressing the pathogen and reversing existing tissue damage are different things.')
}
]

# Term records: term, meaning, function/example, true distinction, useful aliases, first lesson.
WORDS = [
('gonad','An organ that produces gametes and reproductive hormones.','Testes and ovaries are gonads.','A gonad is an organ, not the gamete it produces.',[],1),
('gamete','A reproductive cell containing one chromosome set.','A human sperm or egg carries 23 chromosomes.','A gamete is a cell; a reproductive hormone is a chemical signal.',['sex cell'],1),
('primary sex characteristic','A reproductive organ or structure.','Examples include the testes, ovaries, penis, uterus and vagina.','A primary organ can continue developing at puberty.',['primary sex characteristics'],1),
('secondary sex characteristic','A physical feature associated with sexual maturation that is not a reproductive organ itself.','A deeper voice or facial-hair growth can develop at puberty.','Timing alone does not determine whether a characteristic is primary or secondary.',['secondary sex characteristics'],1),
('puberty','The developmental period when reproductive hormone activity and reproductive capacity increase.','Reproductive organs mature and secondary sex characteristics become more noticeable.','Puberty does not change a primary organ into a secondary characteristic.',[],1),
('sex chromosome','A chromosome involved in the typical XX or XY pattern of human sexual development.','The X and Y are the human sex chromosomes.','Chromosome pattern, hormones and tissue responses are distinct parts of development.',['sex chromosomes'],1),
('SRY','A gene, usually on the Y chromosome, involved in initiating testis development.','Its activity helps initiate a developmental pathway.','SRY is a gene, not testosterone or a whole chromosome.',[],1),
('testis','A male gonad containing seminiferous tubules and testosterone-producing interstitial cells.','It contributes sperm and hormones to reproduction.','The testis is the organ; the scrotum is the pouch supporting it.',['testes'],2),
('scrotum','The pouch containing the testes outside the main body cavity.','Its position helps maintain a temperature suitable for sperm production.','Sperm form inside seminiferous tubules, not in the scrotal wall.',[],2),
('seminiferous tubule','A coiled tube inside a testis where sperm develop.','Developing reproductive cells move toward its lumen as they mature.','Sperm maturation continues later in the epididymis.',['seminiferous tubules'],2),
('epididymis','A coiled duct beside a testis where sperm mature and can be stored.','Sperm develop the capacity for movement there.','It is not the original site of sperm production.',['epididymides'],2),
('vas deferens','The duct carrying sperm from the epididymis toward the ejaculatory duct.','Muscular contractions move sperm along it.','It transports sperm; it does not produce testosterone.',['ductus deferens','vasa deferentia'],2),
('ejaculatory duct','A duct formed where the sperm pathway joins the duct of a seminal vesicle.','It carries material into the urethra through the prostate.','Sperm do not pass through the urinary bladder on this route.',['ejaculatory ducts'],2),
('urethra','A passage carrying urine out of the body and, in the male reproductive system, carrying semen during ejaculation.','Semen leaves through the urethra within the penis.','Urine and semen are normally released at different times.',[],2),
('seminal vesicle','An accessory gland contributing fructose-containing fluid to semen.','Its secretion provides an energy source for sperm.','A seminal vesicle adds fluid; sperm are produced in seminiferous tubules.',['seminal vesicles'],2),
('prostate gland','An accessory gland surrounding part of the urethra below the bladder.','It adds fluid that contributes to semen function.','It is not a sperm-production site.',['prostate'],2),
('bulbourethral gland','An accessory gland releasing lubricating mucus into the urethra.','Its secretion helps prepare and protect the passage.','It is also called a Cowper’s gland, not a seminal vesicle.',['bulbourethral glands',"Cowper's gland","Cowper’s glands"],2),
('semen','The mixture of sperm and accessory-gland secretions.','It provides a fluid medium for sperm transport.','Semen and sperm are not interchangeable names.',[],2),
('penis','An external reproductive organ containing the urethra.','It provides a route for depositing semen in the female reproductive tract.','It transports semen; it does not produce sperm.',[],2),
('spermatogenesis','The process of producing sperm in seminiferous tubules.','It includes reproductive-cell divisions and subsequent differentiation.','Meiosis has two divisions; differentiation into sperm is not another reduction division.',[],3),
('Sertoli cell','A supporting cell within a seminiferous tubule.','It nourishes and supports developing sperm and responds to FSH.','Sertoli cells support sperm; they do not become sperm.',['Sertoli cells'],3),
('interstitial cell','A cell between seminiferous tubules that releases testosterone.','LH stimulates these cells.','These are also called Leydig cells; they are distinct from Sertoli cells.',['Leydig cell','Leydig cells','interstitial cells'],3),
('spermatogonium','A reproductive starting cell that divides by mitosis in the testis.','It helps maintain a supply of cells for sperm production.','It is not yet a mature sperm.',['spermatogonia'],3),
('primary spermatocyte','A reproductive cell that begins meiosis I after DNA replication.','It can produce two secondary spermatocytes.','It precedes the first meiotic division.',['primary spermatocytes'],3),
('secondary spermatocyte','A cell produced by meiosis I during spermatogenesis.','It undergoes meiosis II to produce spermatids.','It has one chromosome set but the chromosomes have not yet completed sister-chromatid separation.',['secondary spermatocytes'],3),
('spermatid','A haploid cell produced by meiosis II during sperm formation.','It differentiates into a specialised sperm.','It is not a Sertoli support cell.',['spermatids'],3),
('acrosome','An enzyme-containing cap on the sperm head.','Its enzymes help sperm pass through layers around the egg.','ATP supply is associated with mitochondria, not the acrosome.',[],3),
('flagellum','The long tail-like structure that produces sperm movement.','Its movement requires energy from ATP.','It is not the location of the sperm’s main nuclear chromosome set.',['tail'],3),
('lumen','The inner space of a tube.','Developing sperm are released toward the lumen of a seminiferous tubule.','The lumen is a space, not a cell type.',[],3),
('differentiation','A process in which a cell becomes specialised in structure and function.','A spermatid develops sperm structures.','Differentiation is not necessarily another cell division.',[],3),
('GnRH','Gonadotropin-releasing hormone, released by the hypothalamus.','It stimulates the anterior pituitary to release FSH and LH.','GnRH does not come from the ovary or testis.',['gonadotropin-releasing hormone','gonadotropic-releasing hormone'],4),
('FSH','Follicle-stimulating hormone, released by the anterior pituitary.','It supports Sertoli-cell activity in males and follicular development in females.','Its name does not mean it has a function only in females.',['follicle-stimulating hormone'],4),
('LH','Luteinizing hormone, released by the anterior pituitary.','It stimulates interstitial cells in males and helps trigger ovulation in females.','LH and FSH leave the same gland but have different direct targets.',['luteinizing hormone'],4),
('testosterone','An androgen released mainly by interstitial cells of the testes in the male pathway.','It supports reproductive function and many secondary sex characteristics.','A high outside androgen signal can suppress upstream stimulation rather than increase sperm production.',[],4),
('androgen','A group of hormones associated with male reproductive development and function.','Testosterone is the main example considered here.','Human growth hormone is not an androgen or a steroid hormone.',['androgens'],4),
('inhibin','A hormone that helps limit FSH release.','Sertoli cells release inhibin as part of sperm-production feedback.','It is a feedback signal, not a sperm-producing cell.',[],4),
('ovary','A female gonad containing oocytes and hormone-producing follicular tissues.','It releases an oocyte at ovulation.','The ovary does not travel into the oviduct.',['ovaries'],5),
('oviduct','A tube leading from near an ovary toward the uterus; the usual site of fertilization.','Cilia and muscular activity help move material toward the uterus.','Fertilization in an oviduct is different from implantation in the endometrium.',['Fallopian tube','uterine tube','oviducts'],5),
('fimbriae','Fringed structures near the ovarian end of an oviduct.','They help guide a released oocyte toward the tube opening.','The oviduct is not a sealed tube attached directly to the ovary.',[],5),
('uterus','A muscular organ supporting development after implantation.','Its wall contracts during labour.','The endometrium is its inner lining, not the entire uterus.',[],5),
('endometrium','The inner lining of the uterus.','It grows and changes under hormone control and supports implantation.','Menstruation sheds part of the lining, not the complete muscular uterine wall.',[],5),
('cervix','The narrow lower region of the uterus opening into the vagina.','It is part of the route sperm pass on their way toward the uterus.','It is not an ovary or the usual fertilization site.',[],5),
('vagina','The passage connecting the cervix with the outside.','It receives semen and provides a route for menstrual flow and vaginal birth.','It is distinct from the urethra.',[],5),
('oogenesis','The process producing the female gamete.','Unequal division retains most cytoplasm in one large reproductive cell.','It does not normally produce four equally sized functional eggs.',[],6),
('oocyte','A developing female reproductive cell.','A secondary oocyte is released at ovulation.','An oocyte is a cell within a follicle, not the whole follicle.',['secondary oocyte'],6),
('follicle','An ovarian structure containing an oocyte and supporting cells.','Growing follicles release estrogen.','A follicle includes support tissue; it is not just another name for an egg.',['ovarian follicle'],6),
('corpus luteum','A temporary endocrine structure formed from follicular tissue after ovulation.','It releases progesterone and some estrogen.','It remains in the ovary while the released oocyte enters a different route.',[],6),
('polar body','A small cell receiving relatively little cytoplasm during oogenesis.','Unequal division leaves most cytoplasm in the large reproductive cell.','Polar bodies are not four equally sized eggs.',['polar bodies'],6),
('menstruation','Shedding of part of the endometrium after a fall in ovarian-hormone support.','The first day of flow is day 1 of the cycle.','Menstrual flow overlaps the early follicular phase.',[],7),
('follicular phase','The ovarian phase before ovulation, during which follicles develop.','Estrogen from a growing follicle supports endometrial rebuilding.','Menstrual flow occurs within its early part, not before all follicular activity begins.',[],7),
('ovulation','Release of a secondary oocyte from a mature ovarian follicle.','An LH surge helps trigger this event.','It is different from fertilization and from menstruation.',[],7),
('luteal phase','The ovarian phase after ovulation, characterised by corpus-luteum activity.','Progesterone supports the endometrium during this phase.','It begins after ovulation, not after the next menstrual flow.',[],7),
('estrogen','An ovarian hormone that supports endometrial growth and participates in feedback.','A developing follicle releases rising estrogen.','Sustained high pre-ovulatory estrogen can promote positive feedback, unlike its usual inhibitory contribution.',[],8),
('progesterone','A hormone that supports and maintains the endometrium after ovulation.','The corpus luteum is a major source during the luteal phase.','Its broad rise usually follows ovulation rather than being the LH surge that triggers it.',[],8),
('LH surge','A large, brief increase in LH release associated with ovulation.','It follows sustained high estrogen in the normal model.','A progesterone rise after ovulation is a different pattern.',[],8),
('negative feedback','A response that tends to oppose the initial change.','Rising testosterone reduces upstream stimulation.','Negative means opposing the change, not harmful.',[],4),
('positive feedback','A response that reinforces or amplifies a change.','Sustained high pre-ovulatory estrogen promotes the LH surge.','Positive does not mean healthy or permanent.',[],8),
('menopause','The end of menstrual cycling associated with declining ovarian follicular activity.','Reduced ovarian feedback can be associated with higher FSH and LH.','Pituitary stimulation and ovarian responsiveness can change in different directions.',[],9),
('hCG','Human chorionic gonadotropin, released by developing trophoblast tissue in early pregnancy.','It supports the corpus luteum and therefore continued ovarian-hormone support.','hCG is not the progesterone made by the corpus luteum.',['human chorionic gonadotropin'],9),
('hormonal contraception','Conception control using hormones or hormone-like substances to alter reproductive processes.','Combined methods can inhibit the normal LH surge and ovulation through feedback.','Preventing conception is not the same as preventing STI transmission.',[],9),
('STI','A sexually transmitted infection.','Different bacterial and viral pathogens can affect health and reproduction.','No obvious symptoms does not establish that no infection is present.',['sexually transmitted infection'],10),
('pathogen','An organism or infectious agent capable of causing disease.','Bacteria and viruses cause different STIs.','A hormone is a chemical signal, not a pathogen.',[],10),
('pelvic inflammatory disease','Inflammation involving upper female reproductive structures, often associated with infection.','It can damage oviducts and lead to scarring.','Normal ovarian hormones do not guarantee an undamaged transport pathway.',['PID'],10),
('infertility','Difficulty establishing a pregnancy due to one or more reproductive factors.','A damaged reproductive transport pathway can reduce fertility.','It does not automatically mean that all gamete or hormone production has stopped.',[],10),
('ectopic pregnancy','A pregnancy implanted outside the normal uterine site.','Damage to an oviduct can increase the risk of implantation there.','Normal fertilization in an oviduct is not the same as abnormal implantation there.',[],10),
]

FINAL_MC = [
('Sperm production is normal, but a transport duct between the epididymis and ejaculatory duct is blocked. Which structure is affected?','Vas deferens',['Seminiferous tubule','Seminal vesicle','Prostate gland'],'Trace the sperm route after maturation.','The vas deferens carries sperm toward the ejaculatory duct; it is downstream of the epididymis.'),
('FSH is present, but Sertoli cells cannot respond to it. Which function is directly threatened?','Support of developing sperm',['LH release from interstitial cells','Fructose release by the sperm head','Storage of urine in the ovary'],'Identify the direct target and its normal role.','Sertoli cells respond to FSH and support spermatogenesis; the defect is at the target rather than the release site.'),
('Which structure remains in the ovary after ovulation and supports the endometrium through hormone release?','Corpus luteum',['Released secondary oocyte','Oviduct','Cervix'],'Distinguish remaining follicular tissue from the released cell.','The corpus luteum develops from remaining follicular tissue and releases progesterone and some estrogen.'),
('An illustrative graph shows estrogen rising first, a short LH surge, and then a broad progesterone rise. What explains the last rise?','Hormone release by the newly formed corpus luteum',['Menstrual shedding produces progesterone','Progesterone is converted directly from LH in blood','The oocyte releases all progesterone before ovulation'],'Identify the endocrine structure that develops after ovulation.','The corpus luteum releases progesterone after ovulation, linking ovarian events with endometrial support.'),
('Outside testosterone increases feedback on a functioning hypothalamus and pituitary. Which response is most consistent with the model?','Reduced upstream stimulation of the testis',['A required increase in both FSH and LH','A physical blockage of every reproductive duct','Conversion of testosterone into sperm'],'Trace the inhibitory feedback direction.','Increased androgen feedback can reduce GnRH, FSH and LH signalling and thereby reduce testicular activity.'),
('An STI causes scarring of an oviduct. Which explanation best connects this damage to reduced fertility?','The route for gamete encounter or transport can be disrupted',['The scar must directly remove all sex chromosomes','The ovary must stop every hormone immediately','The cervix becomes a new sperm-production site'],'Start with the normal function of the damaged structure.','Oviduct damage can prevent gametes meeting or interrupt transport toward the uterus without necessarily stopping ovarian hormones.')]
FINAL_WRITING = [
('Compare the regulation of sperm production with the sequence leading to ovulation. Use GnRH, FSH, LH and the correct target cells or structures.','Both begin with hypothalamic GnRH and anterior-pituitary FSH/LH. In males FSH supports Sertoli cells and LH stimulates interstitial-cell testosterone production. In females FSH supports follicular development, estrogen rises, and sustained high estrogen promotes an LH surge that triggers ovulation and corpus-luteum formation. Feedback differs with the stage of the cycle.',['Correct hormone sources.','Distinct targets in the two systems.','Explains the pre-ovulatory feedback event rather than only listing hormones.']),
('In a hypothetical cycle, an LH surge is followed by ovulation, but the corpus luteum then fails to remain active. Explain the likely hormone and endometrial consequences. Distinguish this from an oviduct blockage.','Reduced corpus-luteum activity means reduced progesterone and estrogen support for the endometrium. The lining may not be maintained. An oviduct blockage instead disrupts transport and may occur even with normal ovarian hormone activity. Neither description alone provides a complete personal diagnosis.',['Traces structure → hormone → target response.','Contrasts endocrine failure with a transport problem.','Limits the conclusion to the model.'])]
MISCONCEPTIONS={
'gonad':'A gonad is another name for a sperm or egg.', 'gamete':'A human gamete normally carries two chromosome sets.',
'primary sex characteristic':'Any structure that becomes more active at puberty must be a secondary characteristic.',
'secondary sex characteristic':'The ovary is a secondary characteristic because its activity changes at puberty.',
'puberty':'Reproductive organs first appear only when puberty begins.', 'sex chromosome':'A sex chromosome is a hormone released by a gonad.',
'SRY':'SRY is the testosterone hormone itself.', 'testis':'The testis only stores sperm produced in the prostate.',
'scrotum':'Sperm are produced by the wall of the scrotum.', 'seminiferous tubule':'Seminiferous tubules are accessory glands that add fructose to semen.',
'epididymis':'The epididymis is where meiosis first produces all sperm.', 'vas deferens':'The vas deferens is the main source of testosterone.',
'ejaculatory duct':'Sperm must pass through the urinary bladder before entering an ejaculatory duct.',
'urethra':'The male urethra normally releases urine and semen together.', 'seminal vesicle':'The seminal vesicle produces sperm by meiosis.',
'prostate gland':'The prostate produces the sperm cells found in semen.', 'bulbourethral gland':'The bulbourethral gland is another name for a testis.',
'semen':'Semen consists only of sperm cells.', 'penis':'The penis is where spermatogenesis occurs.',
'spermatogenesis':'Spermatogenesis involves two complete cycles of meiosis followed by another reduction division.',
'Sertoli cell':'A Sertoli cell eventually becomes a mature sperm.', 'interstitial cell':'Interstitial cells lie inside the tubule and turn into sperm.',
'spermatogonium':'A spermatogonium is a fully mature sperm ready to fertilize an egg.',
'primary spermatocyte':'A primary spermatocyte has already completed both meiotic divisions.',
'secondary spermatocyte':'A secondary spermatocyte must copy its DNA again before meiosis II.',
'spermatid':'A spermatid must halve its chromosome number again to develop a flagellum.',
'acrosome':'The acrosome is the main ATP-producing part of the sperm.', 'flagellum':'The flagellum stores the sperm’s main nuclear chromosome set.',
'lumen':'The lumen is a type of testosterone-producing cell.', 'differentiation':'Every change in cell shape halves its chromosome number.',
'GnRH':'GnRH is released by interstitial cells in the testes.', 'FSH':'FSH functions only in females.',
'LH':'LH acts directly on Sertoli cells to provide their FSH stimulation.',
 'testosterone':'Adding an outside androgen must increase sperm production because testosterone supports reproduction.',
'androgen':'Human growth hormone is an androgen steroid.', 'inhibin':'Inhibin stimulates unlimited FSH release.',
'ovary':'The whole ovary moves into an oviduct during ovulation.', 'oviduct':'The oviduct is the normal site of implantation.',
'fimbriae':'Fimbriae form a sealed pipe joining the ovary directly to the uterus.', 'uterus':'The entire uterus is shed during menstruation.',
'endometrium':'The endometrium is the muscle organ as a whole.', 'cervix':'The cervix is the normal site where oocytes are produced.',
'vagina':'The vagina and the female urethra are the same passage.', 'oogenesis':'Oogenesis normally produces four equally sized functional eggs.',
'oocyte':'An oocyte is the whole follicle including its supporting tissue.', 'follicle':'A follicle is only an egg with no supporting cells.',
'corpus luteum':'The corpus luteum is the released egg travelling toward the uterus.', 'polar body':'A polar body receives the same amount of cytoplasm as the large oocyte.',
'menstruation':'Menstruation happens immediately when an unfertilized oocyte stops surviving.',
'follicular phase':'The follicular phase cannot overlap menstrual flow.', 'ovulation':'Ovulation and implantation are the same event.',
'luteal phase':'The luteal phase happens before ovulation.', 'estrogen':'Estrogen always has an inhibitory effect on pituitary stimulation, regardless of level or timing.',
'progesterone':'The normal broad progesterone rise occurs before follicle development begins.', 'LH surge':'The LH surge is produced by the corpus luteum after it regresses.',
'negative feedback':'Negative feedback means every hormone concentration must be falling.', 'positive feedback':'Positive feedback is named that way because its effects must be beneficial.',
'menopause':'Reduced ovarian hormone production must mean FSH and LH are also low.', 'hCG':'hCG and progesterone are two names for the same hormone.',
'hormonal contraception':'Any hormonal method that prevents pregnancy also prevents every STI.', 'STI':'A person with no symptoms cannot have an STI.',
'pathogen':'A pathogen is any reproductive hormone in the bloodstream.', 'pelvic inflammatory disease':'Normal ovarian hormones guarantee that infection cannot damage an oviduct.',
'infertility':'Infertility always means every gonad has stopped producing both hormones and gametes.',
'ectopic pregnancy':'Normal fertilization in an oviduct is itself an ectopic pregnancy.'}
TYPED=[
(1,'gonad','A structure produces reproductive cells and releases reproductive hormones. What general term describes this organ?'),
(1,'gamete','A human reproductive cell carries one set of 23 chromosomes. What general name describes this cell?'),
(2,'epididymis','A duct beside the testis supports sperm maturation and storage. Name it.'),
(2,'vas deferens','A transport duct after the epididymis carries sperm toward the ejaculatory duct. Name it.'),
(3,'Sertoli cell','FSH acts on a supporting cell inside a seminiferous tubule. Name this cell.'),
(3,'interstitial cell','LH stimulates a cell between seminiferous tubules to release testosterone. Name it.'),
(3,'acrosome','The sperm head has an enzyme-containing cap that helps it pass through layers around an egg. Name the cap.'),
(3,'spermatid','After meiosis II, a haploid male reproductive cell still needs to differentiate into a sperm. Name this stage.'),
(4,'GnRH','Complete the pathway: hypothalamus → ____ → anterior pituitary → FSH and LH.'),
(4,'LH','Complete the pathway: anterior pituitary → ____ → interstitial cells → testosterone.'),
(5,'oviduct','Sperm and an oocyte normally meet in this transport structure. Name it.'),
(5,'endometrium','An embryo implants in the inner lining of the uterus. Name that lining.'),
(6,'follicle','An oocyte and its surrounding supporting cells form this ovarian structure. Name it.'),
(6,'corpus luteum','After ovulation, remaining follicular tissue becomes a temporary progesterone-producing structure. Name it.'),
(7,'follicular phase','Menstrual flow overlaps the early part of which ovarian phase?'),
(7,'luteal phase','The corpus luteum is active after ovulation. Name this ovarian phase.'),
(8,'LH surge','Sustained high estrogen is followed by a large, brief pituitary signal that triggers ovulation. Name this event.'),
(8,'progesterone','Which ovarian hormone has a broad rise after ovulation and helps maintain the endometrium?'),
(9,'hCG','Which early pregnancy signal supports the corpus luteum?'),
(10,'pelvic inflammatory disease','An infection spreads into upper female reproductive structures and causes inflammation. Name the condition, or give its standard abbreviation.')]
SEQUENCES=[
(2,'Sperm transport','vas deferens',['Seminiferous tubules','Epididymis','Vas deferens','Ejaculatory duct','Urethra']),
(3,'From primary spermatocyte to specialised sperm','spermatogenesis',['Primary spermatocyte begins meiosis I','Two secondary spermatocytes form','Meiosis II produces four spermatids','Spermatids differentiate into sperm']),
(4,'Stimulating testosterone release','LH',['Hypothalamus releases GnRH','Anterior pituitary releases LH','LH stimulates interstitial cells','Interstitial cells release testosterone']),
(5,'Sperm approaching an oviduct','oviduct',['Semen is deposited in the vagina','Sperm pass through the cervix','Sperm move through the uterus','Sperm reach an oviduct']),
(6,'A follicle’s changing role','corpus luteum',['A follicle develops around an oocyte','Ovulation releases the secondary oocyte','Remaining follicular tissue forms the corpus luteum','Corpus-luteum hormones support the endometrium']),
(7,'Beginning another cycle without pregnancy','menstruation',['Corpus luteum regresses','Progesterone and estrogen fall','Endometrial support decreases','Part of the endometrium is shed']),
(8,'Normal events around ovulation','LH surge',['A developing follicle releases increasing estrogen','Sustained high estrogen promotes the LH surge','Ovulation releases the oocyte','Corpus-luteum progesterone rises']),
(9,'Supporting the lining in early pregnancy','hCG',['Developing trophoblast tissue releases hCG','hCG supports the corpus luteum','The corpus luteum continues hormone release','Progesterone helps maintain the endometrium'])]
VIDEOS=[
('-XQcnO4iX_U',2,'Male reproductive anatomy','Follow the production, maturation and transport sites.','Sperm form in seminiferous tubules, mature in the epididymis and move through the vas deferens, ejaculatory duct and urethra. Accessory glands add fluid to semen.'),
('ZFLb19nC2bs',3,'Sperm development','Distinguish the reproductive-cell stages from their supporting cells.','A primary spermatocyte completes two meiotic divisions to produce four haploid spermatids. These differentiate into sperm. Sertoli cells provide support; interstitial cells release testosterone.'),
('6fBa8UqEano',3,'Following sperm formation','Identify where sperm develop and where maturation continues.','Developing cells are found within seminiferous tubules. Their later stages approach the lumen. Sperm then enter the epididymis, where maturation develops the capacity for movement.'),
('RFDatCchpus',5,'Female reproductive anatomy','Locate the ovary, oviduct, uterus, cervix and vagina.','An oocyte is released from the ovary and guided toward the oviduct. Fertilization normally occurs in the oviduct. Implantation occurs later in the endometrium of the uterus.'),
('Is1LOacgWkc',7,'Coordinating the menstrual cycle','Separate ovarian events from uterine events.','Follicles develop and release estrogen before ovulation. After ovulation, the corpus luteum releases progesterone and some estrogen. Menstrual flow overlaps the early follicular phase of the next cycle.'),
('2_owp8kNMus',8,'Hormonal control of the cycle','Trace the estrogen rise, LH surge and later progesterone rise.','Sustained high estrogen before ovulation promotes an LH surge. The surge helps trigger ovulation. The corpus luteum then releases progesterone; its later regression allows hormone support to fall.'),
('hI2C7TsnSfk',9,'Hormonal contraception and feedback','Connect an external hormone signal to altered pituitary stimulation.','Combined hormonal methods provide estrogen and a progestin. Their feedback effects can limit FSH and LH stimulation and help prevent ovulation. They do not protect against STIs.')]
