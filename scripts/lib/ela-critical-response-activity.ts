export type CriticalResponseOption = {
  id: string;
  text: string;
  correct: boolean;
  label?: string;
};

export type CriticalResponseStep = {
  title: string;
  type: "quiz" | "scenario" | "comparison";
  question: string;
  scenarioText?: string;
  options: CriticalResponseOption[];
  explanation: string;
};

export type CriticalResponseWorkshop = {
  id: "textKnowledge" | "thesisControl" | "evidenceQuality";
  title: string;
  icon: string;
  description: string;
  steps: CriticalResponseStep[];
};

export const CRITICAL_RESPONSE_ACTIVITY_SOURCE = "C:\\Users\\dean.guedo\\Downloads\\critical_response_activity.tsx";

export const CRITICAL_RESPONSE_WORKSHOPS: CriticalResponseWorkshop[] = [
  {
    "id": "textKnowledge",
    "title": "Text Knowledge",
    "description": "Choose one studied play and collect evidence tied to conflict, character, theme, and dramatic technique.",
    "steps": [
      {
        "title": "Rule #1: Choosing Your Text",
        "type": "quiz",
        "question": "On the ELA 30-1 diploma, you must focus your Critical/Analytical composition on:",
        "options": [
          {
            "id": "a",
            "text": "The reading selection provided in the examination booklet.",
            "correct": false
          },
          {
            "id": "b",
            "text": "A literary text you have studied well in class, such as A Streetcar Named Desire.",
            "correct": true
          },
          {
            "id": "c",
            "text": "A personal experience that relates to the given topic.",
            "correct": false
          }
        ],
        "explanation": "Compositions that refer only to the texts provided in the examination or that make no reference to literature studied are assessed as Insufficient."
      },
      {
        "title": "Identifying Dramatic Technique: Music",
        "type": "scenario",
        "question": "You want to discuss Blanche's descent into madness and her haunting past. Which dramatic technique provides the best evidence for this internal conflict?",
        "options": [
          {
            "id": "a",
            "text": "The changing colors of the lighting in the Elysian Fields apartment.",
            "correct": false
          },
          {
            "id": "b",
            "text": "The recurring auditory motif of the Varsouviana Polka music.",
            "correct": true
          }
        ],
        "explanation": "The Varsouviana Polka specifically triggers whenever Blanche thinks of her husband's death, acting as an auditory representation of her trauma and fracturing mind that only she (and the audience) can hear."
      },
      {
        "title": "Defining the Core Conflict",
        "type": "comparison",
        "question": "Which statement best captures the fundamental conflict of the play for an analytical essay?",
        "options": [
          {
            "id": "a",
            "text": "Blanche and Stanley fight because Blanche is a snob who looks down on his apartment, and Stanley doesn't like her interfering with his marriage.",
            "correct": false,
            "label": "Plot Level"
          },
          {
            "id": "b",
            "text": "The conflict between Blanche and Stanley represents the clash between the fading, illusion-driven aristocracy of the Old South and the brutal, realistic industrialism of the New South.",
            "correct": true,
            "label": "Analytical Level"
          }
        ],
        "explanation": "The second option connects the character-level conflict to the broader thematic meaning of the play."
      },
      {
        "title": "Symbolism: The Paper Lantern",
        "type": "quiz",
        "question": "What does Blanche's paper lantern placed over the naked light bulb primarily symbolize?",
        "options": [
          {
            "id": "a",
            "text": "Her desire to make the apartment look more expensive and upper-class.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Her desperate need to soften harsh realities and hide her fading youth behind artificial illusions.",
            "correct": true
          }
        ],
        "explanation": "The naked bulb represents the harsh, unforgiving truth (Stanley's domain), while the lantern represents Blanche's fragile manufactured reality."
      },
      {
        "title": "Thematic Motif: Bathing",
        "type": "scenario",
        "question": "Blanche constantly takes long, hot baths throughout the play. If writing about the theme of guilt, how would you analyze this?",
        "options": [
          {
            "id": "a",
            "text": "It is a physical manifestation of her psychological desire to cleanse herself of her sordid past in Laurel.",
            "correct": true
          },
          {
            "id": "b",
            "text": "It shows how she uses up all of Stanley and Stella's resources, causing domestic tension in the household.",
            "correct": false
          }
        ],
        "explanation": "While it does cause tension (plot), analytically, the bathing is a ritualistic attempt at purification and washing away her guilt."
      },
      {
        "title": "Setting Analysis: Elysian Fields",
        "type": "quiz",
        "question": "What is the literary significance of the street name 'Elysian Fields' where Stella and Stanley live?",
        "options": [
          {
            "id": "a",
            "text": "It is an ironic allusion to the Greek afterlife for heroes, contrasting with the grim, industrial reality of the setting.",
            "correct": true
          },
          {
            "id": "b",
            "text": "It is a direct reference to the wealthy plantation that Blanche and Stella lost in Mississippi.",
            "correct": false
          }
        ],
        "explanation": "In mythology, Elysian Fields is paradise. Williams uses this ironically; for Blanche, this 'afterlife' (the end of her line) is a brutal, cramped purgatory."
      },
      {
        "title": "Character Motivation: Napoleonic Code",
        "type": "comparison",
        "question": "When Stanley brings up the 'Napoleonic Code', what does it reveal about his character for an essay?",
        "options": [
          {
            "id": "a",
            "text": "It reveals his deep knowledge of Louisiana law and his desire to protect his wife's financial interests.",
            "correct": false,
            "label": "Surface Reading"
          },
          {
            "id": "b",
            "text": "It reveals his primal need for dominance and territorial control, as he views his wife's property - and by extension, his wife - as entirely his own.",
            "correct": true,
            "label": "Analytical Reading"
          }
        ],
        "explanation": "Stanley is not a legal scholar; he uses the Code to assert patriarchal dominance and ensure he isn't being swindled out of what he believes is rightfully his territory."
      },
      {
        "title": "Symbolism: Belle Reve",
        "type": "quiz",
        "question": "The Dubois family plantation is named 'Belle Reve'. Translated, this means 'Beautiful Dream'. Why is this significant?",
        "options": [
          {
            "id": "a",
            "text": "It highlights that the plantation was always a magical place that Blanche dreams of returning to.",
            "correct": false
          },
          {
            "id": "b",
            "text": "It emphasizes that the aristocratic lifestyle of the Old South was ultimately an unsustainable illusion - a dream that had to end.",
            "correct": true
          }
        ],
        "explanation": "Belle Reve was built on a foundation of debt and slavery. Its loss signifies the inevitable collapse of the 'beautiful dream' of the Old South when faced with modern reality."
      },
      {
        "title": "Identifying Dramatic Technique: Blue Piano",
        "type": "quiz",
        "question": "Unlike the Varsouviana, which only Blanche hears, the 'blue piano' is heard by everyone. What does it represent?",
        "options": [
          {
            "id": "a",
            "text": "The vibrant, cyclical, and unapologetic spirit of life in New Orleans.",
            "correct": true
          },
          {
            "id": "b",
            "text": "The tragic death of Allan Grey and Blanche's lingering sorrow.",
            "correct": false
          }
        ],
        "explanation": "The blue piano expresses the spirit of the vibrant, raw, New South. It often swells during moments of passion, life, and the cyclical nature of the city."
      },
      {
        "title": "Quote Analysis: The Final Scene",
        "type": "scenario",
        "question": "Blanche's final line is: 'I have always depended on the kindness of strangers.' What does this indicate about her character arc?",
        "options": [
          {
            "id": "a",
            "text": "She has finally found a doctor who will treat her kindly and cure her.",
            "correct": false
          },
          {
            "id": "b",
            "text": "She has completely severed ties with reality, retreating into a final, permanent illusion where the doctor is a 'gentleman' rescuing her.",
            "correct": true
          }
        ],
        "explanation": "The tragedy is complete. Unable to face the trauma of the rape and her sister's betrayal, her mind entirely fractures, clinging to the illusion of Southern gentility."
      },
      {
        "title": "Allegory: The Streetcars",
        "type": "quiz",
        "question": "Blanche explains her route: 'They told me to take a street-car named Desire, and then transfer to one called Cemeteries... and get off at - Elysian Fields!' This represents:",
        "options": [
          {
            "id": "a",
            "text": "The confusing public transit system of 1940s New Orleans.",
            "correct": false
          },
          {
            "id": "b",
            "text": "An allegorical journey showing that unchecked desire inevitably leads to death/destruction, and finally to the afterlife.",
            "correct": true
          }
        ],
        "explanation": "Williams explicitly lays out the thematic trajectory of Blanche's life in her very first lines. Her desires led to her social 'death' in Laurel, bringing her to her final resting place."
      },
      {
        "title": "Character Analysis: Stella's Choice",
        "type": "comparison",
        "question": "How should an analytical essay treat Stella's decision to stay with Stanley at the end?",
        "options": [
          {
            "id": "a",
            "text": "She chooses Stanley because she hates Blanche for lying to everyone.",
            "correct": false,
            "label": "Incorrect Motivation"
          },
          {
            "id": "b",
            "text": "She consciously chooses self-deception ('I couldn't believe her story and go on living with Stanley') because her primal bond to him and her new baby outweigh her loyalty to the past.",
            "correct": true,
            "label": "Analytical Truth"
          }
        ],
        "explanation": "Stella represents the bridge between the Old and New South. Her tragedy is that she must sacrifice her sister and embrace an illusion to survive in Stanley's world."
      },
      {
        "title": "The Poker Night Dynamics",
        "type": "scenario",
        "question": "The stage directions describe the men at the poker table wearing 'solid blues, a purple, a red-and-white check, a light green'. What is the purpose of this primary color imagery?",
        "options": [
          {
            "id": "a",
            "text": "To contrast the men's raw, vivid, physical masculinity against Blanche's faded, moth-like delicacy.",
            "correct": true
          },
          {
            "id": "b",
            "text": "To show that the men are wealthy enough to afford brightly colored clothing.",
            "correct": false
          }
        ],
        "explanation": "Williams calls them the 'raw colors of childhood's spectrum'. It establishes the men as coarse, direct, and overwhelmingly physical."
      },
      {
        "title": "Character Foil: Mitch",
        "type": "quiz",
        "question": "What thematic role does Mitch serve in the play?",
        "options": [
          {
            "id": "a",
            "text": "He serves as a symbol of the perfect gentleman who could have saved Blanche if Stanley hadn't interfered.",
            "correct": false
          },
          {
            "id": "b",
            "text": "He represents a temporary illusion of sanctuary for Blanche, but ultimately proves to be bound by the same crude reality as Stanley.",
            "correct": true
          }
        ],
        "explanation": "While softer than Stanley, Mitch's brutal reaction to Blanche's past ('You're not clean enough to bring in the house with my mother') proves he is still part of the unforgiving reality she cannot escape."
      },
      {
        "title": "The Climax: Scene 10",
        "type": "comparison",
        "question": "When Stanley says, 'We've had this date with each other from the beginning!' right before the assault, it signifies:",
        "options": [
          {
            "id": "a",
            "text": "The inevitable, destructive conquest of the New South's brutal reality over the Old South's fragile illusions.",
            "correct": true,
            "label": "Thematic Level"
          },
          {
            "id": "b",
            "text": "That Stanley had been planning this specific moment since the day she arrived.",
            "correct": false,
            "label": "Plot Level"
          }
        ],
        "explanation": "Their conflict was fundamentally irreconcilable. Stanley's raw, animalistic realism was always destined to destroy Blanche's delicate, fabricated world."
      }
    ],
    "icon": "menu_book"
  },
  {
    "id": "thesisControl",
    "title": "Thesis Control",
    "description": "State how the playwright develops the topic, then keep each body paragraph anchored to that interpretation.",
    "steps": [
      {
        "title": "Crafting a Strong Thesis",
        "type": "comparison",
        "question": "If the exam topic is 'the impact of illusions on an individual's reality', which is the strongest thesis statement?",
        "options": [
          {
            "id": "a",
            "text": "In A Streetcar Named Desire, Tennessee Williams shows that Blanche relies on illusions because her reality is too hard to deal with, which eventually causes her to go crazy.",
            "correct": false,
            "label": "Draft Thesis"
          },
          {
            "id": "b",
            "text": "In A Streetcar Named Desire, Williams suggests that when an individual relies on fragile illusions to survive a traumatic past, they inevitably fracture their psychological reality when confronted with brutal, uncompromising truths.",
            "correct": true,
            "label": "Refined Thesis"
          }
        ],
        "explanation": "The second thesis is stronger because it defines the *impact* clearly (fracturing psychological reality) and uses precise, analytical vocabulary."
      },
      {
        "title": "Avoiding Moralizing",
        "type": "quiz",
        "question": "A common mistake is writing a 'moralizing' thesis that judges characters instead of analyzing them. Which of these is an analytical thesis?",
        "options": [
          {
            "id": "a",
            "text": "Stanley Kowalski is an evil and abusive man, proving that bad people will always destroy good people.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Stanley Kowalski embodies the ruthless, unapologetic force of modern reality, acting as the primary catalyst for the destruction of Blanche's illusions.",
            "correct": true
          }
        ],
        "explanation": "Avoid terms like 'good', 'evil', or 'mean'. Analyze what the character *represents* and their *function* in the playwright's thematic message."
      },
      {
        "title": "Decoding the Prompt",
        "type": "scenario",
        "question": "The diploma prompt asks you to discuss 'the significance of an individual's attempt to escape reality'. What must your thesis address?",
        "options": [
          {
            "id": "a",
            "text": "How Blanche tries to escape reality by drinking, lying, and taking baths.",
            "correct": false
          },
          {
            "id": "b",
            "text": "WHY Blanche attempts to escape, and the ultimate CONSEQUENCES (the significance) of that attempt.",
            "correct": true
          }
        ],
        "explanation": "Option A just lists plot points. Option B addresses 'significance' - the *meaning* and *result* of the behavior."
      },
      {
        "title": "Topic Sentence Alignment",
        "type": "scenario",
        "question": "Your thesis argues that 'fragile illusions fracture against brutal truths.' Which topic sentence best anchors your first body paragraph to this specific thesis?",
        "options": [
          {
            "id": "a",
            "text": "Blanche's meticulous construction of her 'Southern belle' persona serves as a desperate psychological shield against her traumatic history in Laurel.",
            "correct": true
          },
          {
            "id": "b",
            "text": "When Blanche arrives at Elysian Fields, she immediately begins lying about drinking Stanley's liquor.",
            "correct": false
          }
        ],
        "explanation": "The first option establishes the 'illusion' and connects it to the 'why' (psychological shield), tying directly back to your thesis. The second is plot summary."
      },
      {
        "title": "Topic Sentence on Setting",
        "type": "comparison",
        "question": "How can you write a topic sentence that uses SETTING to advance your thesis about 'the inescapable nature of reality'?",
        "options": [
          {
            "id": "a",
            "text": "The cramped, claustrophobic setting of the Elysian Fields apartment serves as a physical manifestation of the reality Blanche cannot escape.",
            "correct": true,
            "label": "Analytical"
          },
          {
            "id": "b",
            "text": "Stanley and Stella live in a two-room apartment in New Orleans called Elysian Fields.",
            "correct": false,
            "label": "Descriptive"
          }
        ],
        "explanation": "A topic sentence must make an arguable claim that supports the thesis, not just state a fact about the play."
      },
      {
        "title": "Integrating Technique into Thesis",
        "type": "quiz",
        "question": "Which thesis successfully incorporates dramatic technique into its core argument?",
        "options": [
          {
            "id": "a",
            "text": "Williams uses music, lighting, and stage directions to make the play more interesting for the audience.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Through the expressionistic use of the Varsouviana polka and harsh lighting, Williams externalizes Blanche's internal psychological deterioration.",
            "correct": true
          }
        ],
        "explanation": "Don't just list techniques; explain *how* the playwright uses them to construct meaning."
      },
      {
        "title": "Spotting the Drift",
        "type": "scenario",
        "question": "Your paragraph is arguing that Stanley destroys Blanche's illusions. Which sentence drifts OFF TOPIC into summary?",
        "options": [
          {
            "id": "a",
            "text": "By revealing her sordid past to Mitch, Stanley systematically dismantles the respectable persona she has constructed.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Mitch was going to marry her, and they had gone on several dates, including one where they talked in French.",
            "correct": true
          }
        ],
        "explanation": "Sentence B drifts into retelling the story of Mitch and Blanche's dates, abandoning the analysis of Stanley's destruction of her illusion."
      },
      {
        "title": "Aligning Evidence to Thesis",
        "type": "comparison",
        "question": "Thesis: 'Stella actively chooses self-deception to survive.' Which piece of evidence best supports this specific claim?",
        "options": [
          {
            "id": "a",
            "text": "Stella says, 'I couldn't believe her story and go on living with Stanley.'",
            "correct": true,
            "label": "Strong Alignment"
          },
          {
            "id": "b",
            "text": "Stella tells Blanche to stop being so critical of the apartment.",
            "correct": false,
            "label": "Weak Alignment"
          }
        ],
        "explanation": "The quote in Option A explicitly demonstrates Stella making a conscious choice to disbelieve the truth (self-deception) in order to maintain her life (survival)."
      },
      {
        "title": "Paragraph Transitions",
        "type": "quiz",
        "question": "You just finished a paragraph on Blanche's illusions. Your next paragraph is about Stanley breaking them. Which is the best transitional phrase?",
        "options": [
          {
            "id": "a",
            "text": "Another thing that happens in the play is Stanley getting mad.",
            "correct": false
          },
          {
            "id": "b",
            "text": "However, Blanche's carefully constructed sanctuary is ultimately unsustainable when confronted by Stanley's relentless realism.",
            "correct": true
          }
        ],
        "explanation": "A good transition bridges the concept of the previous paragraph (sanctuary) with the new concept (Stanley's realism)."
      },
      {
        "title": "Maintaining the Thread",
        "type": "quiz",
        "question": "You are concluding a paragraph about Stanley tearing the paper lantern off the lightbulb. How do you tie this back to your thesis about 'brutal truths'?",
        "options": [
          {
            "id": "a",
            "text": "This shows how mean Stanley is and how much he wants to hurt Blanche by exposing her age.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Ultimately, Blanche's manufactured sanctuary is destroyed by Stanley's deliberate intrusion of raw truth, physically tearing away the illusion that protected her.",
            "correct": true
          }
        ],
        "explanation": "To control your thesis, you must constantly return to the key terms of your argument. Option B brings back 'sanctuary', 'truth', and 'illusion'."
      },
      {
        "title": "Evaluating a 'Desire' Thesis",
        "type": "scenario",
        "question": "If the topic is 'the role of desire', which thesis asserts better control?",
        "options": [
          {
            "id": "a",
            "text": "Williams portrays desire as a destructive, uncontrollable force that overpowers rationality and drives individuals to their tragic downfall.",
            "correct": true
          },
          {
            "id": "b",
            "text": "Desire is a major theme because Blanche desires to be young, Stanley desires Stella, and Stella desires Stanley.",
            "correct": false
          }
        ],
        "explanation": "Option A makes an overarching, arguable claim about the *nature* of desire. Option B merely lists examples of characters wanting things."
      },
      {
        "title": "Introduction Funnel Strategy",
        "type": "quiz",
        "question": "A strong introduction starts broad and narrows to the thesis. Which sequence is correct?",
        "options": [
          {
            "id": "a",
            "text": "Universal hook -> Introduce Play/Author -> Context of characters -> Thesis statement.",
            "correct": true
          },
          {
            "id": "b",
            "text": "Thesis statement -> List of characters -> Summary of Scene 1 -> Universal hook.",
            "correct": false
          }
        ],
        "explanation": "The 'funnel' method pulls the reader from a universal human truth down into the specific mechanics of how Tennessee Williams explores that truth in this specific play."
      },
      {
        "title": "Concluding the Essay",
        "type": "comparison",
        "question": "What is the primary goal of the concluding paragraph in a diploma essay?",
        "options": [
          {
            "id": "a",
            "text": "To restate the thesis word-for-word and list the three examples used in the body paragraphs.",
            "correct": false,
            "label": "Middle School Style"
          },
          {
            "id": "b",
            "text": "To synthesize the arguments and explain the broader significance - the 'so what' - of the playwright's message regarding human nature.",
            "correct": true,
            "label": "Diploma Style"
          }
        ],
        "explanation": "A 30-1 conclusion should elevate the argument. Don't just repeat yourself; tell the marker why this interpretation matters to our understanding of the human condition."
      },
      {
        "title": "The 'So What?' Factor",
        "type": "scenario",
        "question": "How do you add the 'So What?' factor to the end of an essay about the destruction of the Old South?",
        "options": [
          {
            "id": "a",
            "text": "Therefore, Blanche goes to an asylum and Stanley wins the conflict.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Through Blanche's demise, Williams offers a bleak commentary: in the modern world, brutal pragmatism will inevitably eradicate fragile idealism.",
            "correct": true
          }
        ],
        "explanation": "Option B steps back from the plot and explains the universal, thematic message the playwright is trying to convey."
      },
      {
        "title": "Final Thesis Check",
        "type": "quiz",
        "question": "Read your thesis, then read the prompt. If the prompt asks about 'the impact of significant experience,' and your thesis is 'Stanley's poker games show masculinity,' what went wrong?",
        "options": [
          {
            "id": "a",
            "text": "Nothing. Poker games are a significant experience for Stanley.",
            "correct": false
          },
          {
            "id": "b",
            "text": "You failed to answer the prompt. You must explicitly address how an experience impacts an individual's perspective or reality.",
            "correct": true
          }
        ],
        "explanation": "Thesis control begins with explicitly answering the prompt provided. If you write a great essay on a topic you weren't asked about, the mark will be heavily penalized."
      }
    ],
    "icon": "edit_note"
  },
  {
    "id": "evidenceQuality",
    "title": "Evidence Quality",
    "description": "Use precise moments from the drama rather than broad plot summary. Explain how each detail proves the claim.",
    "steps": [
      {
        "title": "Analysis vs. Plot Summary",
        "type": "comparison",
        "question": "The guidelines state: 'Do not merely retell the sequence of events...' Which is an example of strong ANALYSIS rather than plot summary?",
        "options": [
          {
            "id": "a",
            "text": "Blanche arrives at Elysian Fields and criticizes Stella's apartment. Later, Stanley throws the radio out the window during a poker game.",
            "correct": false,
            "label": "Example A"
          },
          {
            "id": "b",
            "text": "Williams utilizes the confined setting of the apartment to trap Blanche in a primal reality she cannot escape. Stanley's violent destruction of the radio serves as a physical manifestation of his dominance.",
            "correct": true,
            "label": "Example B"
          }
        ],
        "explanation": "Example B uses the events to prove a point about character conflict and symbolism, whereas Example A just lists what happens chronologically."
      },
      {
        "title": "Quoting vs. Paraphrasing",
        "type": "scenario",
        "question": "You want to emphasize Blanche's desperate reliance on illusion. How should you integrate this evidence?",
        "options": [
          {
            "id": "a",
            "text": "Quote it directly. The quotation is emphatically stated and perfectly captures the essence of her character.",
            "correct": true
          },
          {
            "id": "b",
            "text": "Paraphrase it. You should always avoid quoting dialogue in an essay.",
            "correct": false
          }
        ],
        "explanation": "The guidelines state you should quote when 'the quotation is so apt or emphatically stated that a paraphrase would not recapture the eloquence of the text.' This famous line is a perfect time to quote!"
      },
      {
        "title": "Fixing 'Dropped Quotes'",
        "type": "comparison",
        "question": "A 'dropped quote' is dumped into a paragraph without context. Which option integrates the evidence correctly?",
        "options": [
          {
            "id": "a",
            "text": "Blanche is scared of the light. \"I can't stand a naked light bulb, any more than I can a rude remark or a vulgar action.\" This shows she hides from reality.",
            "correct": false,
            "label": "Dropped Quote"
          },
          {
            "id": "b",
            "text": "Blanche's aversion to truth is immediately apparent when she insists on covering the bare bulb, equating a \"naked light bulb\" with a \"vulgar action,\" thereby revealing how she equates harsh light with the exposure of her true self.",
            "correct": true,
            "label": "Integrated Quote"
          }
        ],
        "explanation": "Option B flawlessly weaves the exact words into the writer's own sentence, explaining exactly *how* the detail proves the claim."
      },
      {
        "title": "Selecting Evidence: Stanley's Dominance",
        "type": "quiz",
        "question": "You are arguing that Stanley establishes primal dominance over his household immediately in Scene 1. Which detail is the highest quality evidence?",
        "options": [
          {
            "id": "a",
            "text": "He says hello to Eunice and goes bowling with Mitch.",
            "correct": false
          },
          {
            "id": "b",
            "text": "He heaves a blood-stained package of meat at Stella, commanding her to catch it.",
            "correct": true
          }
        ],
        "explanation": "The meat-throwing is a powerful, symbolic stage action that establishes him as the 'hunter/gatherer' and demands Stella's subservience."
      },
      {
        "title": "Grammatical Embedding",
        "type": "scenario",
        "question": "How do you weave a quote so it grammatically fits your own sentence?",
        "scenarioText": "Quote: \"We've had this date with each other from the beginning!\"",
        "options": [
          {
            "id": "a",
            "text": "Stanley reveals that the assault was inevitable, declaring that they have \"had this date with each other from the beginning!\"",
            "correct": true
          },
          {
            "id": "b",
            "text": "Stanley says \"We've had this date with each other from the beginning!\" which means it was inevitable.",
            "correct": false
          }
        ],
        "explanation": "Option A blends the quoted phrase seamlessly into the syntax of the student's own sentence, making for a much smoother read."
      },
      {
        "title": "Analyzing the Meat Scene",
        "type": "comparison",
        "question": "Which explanation offers the best analysis of the meat-throwing incident in Scene 1?",
        "options": [
          {
            "id": "a",
            "text": "This shows that Stanley went to the butcher to get food for his wife.",
            "correct": false,
            "label": "Literal"
          },
          {
            "id": "b",
            "text": "This gesture establishes the primal, sexual undercurrent of their marriage, reducing their dynamic to that of a caveman providing for his mate.",
            "correct": true,
            "label": "Analytical"
          }
        ],
        "explanation": "Always push past the literal action to the symbolic meaning. Evidence Quality requires you to explain *why* the playwright included the detail."
      },
      {
        "title": "Paraphrasing a Monologue",
        "type": "quiz",
        "question": "Blanche gives a page-long monologue detailing the deaths at Belle Reve and the loss of the estate. How should you use this in a first draft?",
        "options": [
          {
            "id": "a",
            "text": "Embed the entire lengthy quotation so the marker can read her exact words.",
            "correct": false
          },
          {
            "id": "b",
            "text": "Paraphrase the relentless sequence of deaths she describes to illustrate the trauma that fractured her sanity, keeping quotes limited to key phrases like \"the grim reaper had put up his tent on our doorstep.\"",
            "correct": true
          }
        ],
        "explanation": "The diploma guidelines warn against embedding lengthy quotations. Summarize the bulk of it, and extract only the most powerful snippets to quote directly."
      },
      {
        "title": "Utilizing Stage Directions",
        "type": "scenario",
        "question": "You want to prove Stanley's animalistic nature using Williams' stage directions. How do you refer to it?",
        "options": [
          {
            "id": "a",
            "text": "Williams characterizes Stanley with \"animal joy in his being,\" implicitly comparing him to a primal force.",
            "correct": true
          },
          {
            "id": "b",
            "text": "Stanley says that he has animal joy in his being.",
            "correct": false
          }
        ],
        "explanation": "Stanley doesn't say this; it's in the stage directions. Acknowledge that the *playwright* is using these words to characterize him."
      },
      {
        "title": "Evaluating the Analysis",
        "type": "comparison",
        "question": "Read this sentence. Does the analysis actually match the quote provided? \n'Blanche loves wearing nice clothes, as seen when she says, \"I can't stand a naked light bulb.\"'",
        "options": [
          {
            "id": "a",
            "text": "Yes, light bulbs are related to getting dressed.",
            "correct": false,
            "label": "Mismatched"
          },
          {
            "id": "b",
            "text": "No. The quote is about her fear of harsh reality and exposure, not her fashion sense. The evidence does not prove the claim.",
            "correct": true,
            "label": "Accurate Assessment"
          }
        ],
        "explanation": "The biggest error students make is dropping a quote that doesn't actually prove the point they are trying to make in that specific sentence."
      },
      {
        "title": "Using Ellipses",
        "type": "quiz",
        "question": "You want to quote Blanche: 'I don't want realism. I want magic! Yes, yes, magic! I try to give that to people.' You only need the first and last part. How do you format this?",
        "options": [
          {
            "id": "a",
            "text": "\"I don't want realism... I try to give that to people.\"",
            "correct": true
          },
          {
            "id": "b",
            "text": "\"I don't want realism I try to give that to people.\"",
            "correct": false
          }
        ],
        "explanation": "Use an ellipsis (...) to indicate that you have omitted words from the middle of a continuous quotation, ensuring the grammar still makes sense."
      },
      {
        "title": "Selecting Evidence: Alcoholism",
        "type": "scenario",
        "question": "You want to prove Blanche is an alcoholic who hides her addiction to maintain her 'proper' facade. Best evidence?",
        "options": [
          {
            "id": "a",
            "text": "She drinks a beer with Stanley at the poker game.",
            "correct": false
          },
          {
            "id": "b",
            "text": "In Scene 1, she nervously searches for Stanley's whiskey, drinks a half-tumbler, and then carefully washes the glass before anyone sees.",
            "correct": true
          }
        ],
        "explanation": "The *action* of washing the glass and hiding the evidence is what proves the *facade*, making it much higher quality evidence than simply stating she drinks."
      },
      {
        "title": "Analyzing the Spilled Coke",
        "type": "quiz",
        "question": "When Blanche spills Coca-Cola on her white dress, she gasps in panic. Analytically, what does this evidence suggest?",
        "options": [
          {
            "id": "a",
            "text": "It is a symbolic threat to her constructed purity; the stain represents the inescapable reality of her tarnished past bleeding through her white facade.",
            "correct": true
          },
          {
            "id": "b",
            "text": "It shows she is clumsy because she is drinking too much alcohol.",
            "correct": false
          }
        ],
        "explanation": "White represents purity/innocence. The dark stain on the white dress is a visual metaphor for her past sins ruining her illusion of perfection."
      },
      {
        "title": "Specific vs Vague Evidence",
        "type": "comparison",
        "question": "Which of these provides the level of specificity expected on a 30-1 Diploma?",
        "options": [
          {
            "id": "a",
            "text": "Mitch gets really mad at Blanche and makes her feel bad about lying.",
            "correct": false,
            "label": "Vague"
          },
          {
            "id": "b",
            "text": "Mitch brutally tears the paper lantern off the bulb to get a 'good look' at Blanche, physically violating her sanctuary.",
            "correct": true,
            "label": "Specific"
          }
        ],
        "explanation": "Broad summaries ('Mitch gets mad') score poorly. Precise moments from the drama ('tears the paper lantern') score in the Proficient/Excellent range."
      },
      {
        "title": "Deconstructing 'Animal Joy'",
        "type": "quiz",
        "question": "Williams writes that the 'center of [Stanley's] life has been pleasure with women... with the power and pride of a richly feathered male bird among hens.' This evidence proves:",
        "options": [
          {
            "id": "a",
            "text": "Stanley is primarily driven by primal instinct, physical gratification, and an unwavering belief in his own patriarchal supremacy.",
            "correct": true
          },
          {
            "id": "b",
            "text": "Stanley likes to keep chickens in his backyard in New Orleans.",
            "correct": false
          }
        ],
        "explanation": "The metaphor of the 'feathered male bird' explicitly connects his character to the animal kingdom, stripping away civilized refinement."
      },
      {
        "title": "Explaining the Torn Lantern",
        "type": "scenario",
        "question": "Stanley hands Blanche the torn paper lantern as she is being taken to the asylum. How do you explain the significance of this final piece of evidence?",
        "options": [
          {
            "id": "a",
            "text": "He is cleaning up the apartment and returning her property to her before she leaves.",
            "correct": false
          },
          {
            "id": "b",
            "text": "It is a final act of cruelty; handing her the shredded symbol of her illusions signifies his complete, uncompromising victory over her fragile world.",
            "correct": true
          }
        ],
        "explanation": "Always connect the final piece of evidence back to the core conflict and the thesis. Stanley's gesture is the ultimate triumph of brutal reality."
      }
    ],
    "icon": "tips_and_updates"
  }
];
