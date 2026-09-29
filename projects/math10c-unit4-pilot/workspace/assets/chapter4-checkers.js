(function (root, factory) {
  var api = factory(root.Chapter4Math);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Chapter4Checkers = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (math) {
  "use strict";

  var superscripts = {"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁻":"-"};
  function normalize(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (run) { return "^" + Array.from(run).map(function (c) { return superscripts[c]; }).join(""); })
      .replace(/∛/g, "cbrt")
      .replace(/√/g, "sqrt")
      .replace(/[×·]/g, "*")
      .replace(/≠/g, "!=")
      .replace(/\*\*/g, "^")
      .replace(/\s+/g, "")
      .replace(/[{}]/g, function (c) { return c === "{" ? "(" : ")"; })
      .replace(/\*+/g, "*")
      .replace(/^\+/, "");
  }

  function inferredContract(label, answers, extra) {
    if (extra && extra.contract) return extra.contract;
    if (extra && extra.type === "select") return { kind:"text" };
    if (/restriction/i.test(label)) return { kind:"restriction" };
    if (/order|classify|unit|operation|law|closer|reason|invalid|real\?/i.test(label)) return { kind:"text" };
    var expressionLike = answers.length && answers.every(function(answer){return /^[-−+]?([0-9]+(?:\.[0-9]+)?|[0-9a-z()^*/√∛.−-]+)$/i.test(String(answer).replace(/\s+/g,""));});
    if (!expressionLike) return { kind:"text" };
    var radicalLabel=/radical|√|∛|⁴√|fourth root/i.test(label);
    var form = radicalLabel&&/simplest|simplified/i.test(label) ? "simplified-radical" : (/radical form|entire radical/i.test(label) ? "radical" : null);
    return { kind:/^[0-9.−-]+$/.test(String(answers[0]))?"number":"expression", form:form };
  }
  function field(label, answers, hint, extra) {
    var supplied=extra||{};
    return Object.assign({ label: label, answers: answers, hint: hint, type: "text", placeholder: "", contract:inferredContract(label,answers,supplied) }, supplied);
  }
  function stableIdentity(value){var hash=2166136261,text=normalize(value);for(var i=0;i<text.length;i+=1){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}

  var tasks = {
    "41": {
      title: "Fresh lesson check: roots and real numbers",
      prompt: "Evaluate √144. Then bracket √70 between consecutive whole numbers, classify √50, and order 7, √50 and 8 from least to greatest.",
      fields: {
        exact: field("√144", ["12"], "Which positive number squared equals 144?"),
        lower: field("Lower bound for √70", ["8"], "Compare 70 with nearby perfect squares."),
        upper: field("Upper bound for √70", ["9"], "The upper bound is the next whole number after the lower bound."),
        classify: field("Classify √50", ["irrational"], "A non-perfect square root does not terminate or repeat.", {type:"select", options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}),
        order: field("Least-to-greatest order", ["7,sqrt50,8", "7,sqrt(50),8"], "Estimate √50 before placing it between the whole numbers.", {placeholder:"Example: 6, sqrt40, 7"})
      }
    },
    "42": {
      title: "Fresh lesson check: radical forms",
      prompt: "For 3∛54, identify the coefficient, index and radicand. Simplify √75, then write 2√7 as an entire radical.",
      fields: {
        coefficient: field("Coefficient", ["3"], "The coefficient is outside the radical."),
        index: field("Index", ["3"], "The small number on the radical names the root."),
        radicand: field("Radicand", ["54"], "The radicand is under the radical sign."),
        mixed: field("√75 in simplest mixed form", ["5sqrt3", "5*sqrt3", "5sqrt(3)", "5*sqrt(3)"], "Factor 75 using its largest perfect-square factor."),
        entire: field("2√7 as an entire radical", ["sqrt28", "sqrt(28)"], "Move 2 inside by squaring it.")
      }
    },
    "43": {
      title: "Fresh lesson check: product, quotient and zero laws",
      prompt: "Simplify each expression. Use positive exponents and include the restriction for the zero-exponent statement.",
      fields: {
        product: field("x⁴ · x⁷", ["x^11", "x11"], "Like bases multiply by adding exponents."),
        quotient: field("y⁹ ÷ y³", ["y^6", "y6"], "Like bases divide by subtracting exponents."),
        zero: field("a⁰", ["1"], "Any nonzero base to exponent zero equals one."),
        restriction: field("Restriction for a⁰", ["a!=0", "a≠0"], "The zero-exponent law excludes a zero base.", {placeholder:"variable != value"}),
        combined: field("(12x⁵y³) ÷ (3x²y)", ["4x^3y^2", "4*x^3*y^2", "4y^2x^3", "4*y^2*x^3"], "Divide coefficients, then subtract exponents for each like base.")
      }
    },
    "44": {
      title: "Fresh lesson check: powers of powers and products",
      prompt: "Simplify each expression. Apply the outside exponent to every factor it governs.",
      fields: {
        power: field("(x³)⁴", ["x^12", "x12"], "Multiply the two exponents."),
        product: field("(2xy²)³", ["8x^3y^6", "8*x^3*y^6"], "Cube the coefficient and every variable factor."),
        quotient: field("(3x/2)²", ["9x^2/4", "(9x^2)/4", "9*x^2/4"], "Square the numerator and the denominator."),
        combined: field("(x²y)³ · x/y²", ["x^7y", "x^7*y", "yx^7", "y*x^7"], "Distribute the cube first, then combine like bases.")
      }
    },
    "45": {
      title: "Fresh lesson check: negative exponents",
      prompt: "Rewrite using positive exponents, evaluate the rational-base power, and state the restriction.",
      fields: {
        reciprocal: field("x⁻⁴", ["1/x^4", "1/(x^4)"], "A negative exponent moves the factor across the fraction bar."),
        rewrite: field("3x⁻²/y⁻¹", ["3y/x^2", "(3y)/x^2", "3*y/x^2"], "Move x⁻² to the denominator and y⁻¹ to the numerator."),
        evaluate: field("(2/3)⁻²", ["9/4"], "Invert the base, then square."),
        restriction: field("Restriction for x⁻⁴", ["x!=0", "x≠0"], "A negative exponent creates a denominator.", {placeholder:"variable != value"})
      }
    },
    "46": {
      title: "Fresh lesson check: fractional exponents",
      prompt: "Evaluate two rational exponents, convert one expression to radical form, and classify the real-number result.",
      fields: {
        square: field("81^(1/2)", ["9"], "The denominator 2 means square root."),
        cube: field("27^(2/3)", ["9"], "Take the cube root, then square."),
        radical: field("x^(3/4) in radical form", ["4rt(x^3)", "fourthroot(x^3)", "root4(x^3)", "4throot(x^3)"], "The denominator 4 is the root index and the numerator 3 is the power.", {placeholder:"Example notation: 4rt(x^3)"}),
        domain: field("Is (−16)^(1/2) real?", ["no"], "An even root of a negative number is not real.", {type:"select", options:[["","Choose"],["yes","Yes"],["no","No"]]})
      }
    },
    "47": {
      title: "Fresh lesson check: applying exponent laws",
      prompt: "Name the first law, simplify a multi-step expression, evaluate a model, and identify the invalid claim.",
      fields: {
        law: field("First law for (x²)³", ["powerofapower"], "An exponent is applied to an existing power.", {type:"select", options:[["","Choose"],["product","Product of powers"],["quotient","Quotient of powers"],["powerofapower","Power of a power"]]}),
        simplify: field("(2x⁻¹)² · x³", ["4x", "4*x"], "Square the grouped factor, then combine the x powers."),
        model: field("3 · 2⁴", ["48"], "Evaluate the exponent before multiplying by 3."),
        invalid: field("Invalid claim", ["addition"], "Exponent product laws do not apply across addition.", {type:"select", options:[["","Choose"],["addition","x² + x³ = x⁵"],["product","x² · x³ = x⁵"],["power","(x²)³ = x⁶"]]})
      }
    },
    "48": {
      title: "Fresh lesson check: roots and powers transfer",
      prompt: "A cube has volume 125 cm³. Give its edge length, an equivalent exponent form, the operation used and the correct unit.",
      fields: {
        length: field("Edge length", ["5"], "Find the number whose cube is 125."),
        exponent: field("Equivalent exponent form", ["125^(1/3)", "125^1/3", "125^(0.3333333333)"], "A cube root uses exponent 1/3.", {placeholder:"Use ^ for an exponent"}),
        operation: field("Operation", ["cuberoot"], "Volume to edge length requires a cube root.", {type:"select", options:[["","Choose"],["square","Square"],["squareroot","Square root"],["cuberoot","Cube root"]]}),
        unit: field("Linear unit", ["cm", "centimetres", "centimeters"], "A cube root of cubic centimetres is measured in centimetres.")
      }
    }
  };

  var variants = {
    "41": {
      fresh: { title:"Different fresh check: roots and real numbers", prompt:"Evaluate √169. Bracket √90, classify √81, and order 9, √90 and 10.", fields:{
        exact:field("√169",["13"],"Which positive number squared equals 169?"), lower:field("Lower bound for √90",["9"],"Use nearby perfect squares."), upper:field("Upper bound for √90",["10"],"Use the next consecutive whole number."), classify:field("Classify √81",["rational"],"A perfect square has an integer root.",{type:"select",options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}), order:field("Least-to-greatest order",["9,sqrt90,10","9,sqrt(90),10"],"Estimate √90 before ordering.") }},
      transfer: { title:"Changed-form transfer: roots", prompt:"A cube has volume 100 cm³. Bracket and order its exact edge length between whole centimetres, classify the exact value, and give the linear unit.", fields:{
        lower:field("Lower whole-number bound",["4"],"Compare 100 with nearby perfect cubes."), upper:field("Upper whole-number bound",["5"],"Use the next whole number."), exact:field("Exact edge length",["cbrt100","cbrt(100)"],"Volume to edge length requires a cube root."), classify:field("Classify ∛100",["irrational"],"100 is not a perfect cube.",{type:"select",options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}), order:field("Least-to-greatest order",["4,cbrt100,5","4,cbrt(100),5"],"Place the exact edge between its bounds."), unit:field("Unit",["cm","centimetres","centimeters"],"The cube root of cubic centimetres is linear centimetres.") }}
    },
    "42": {
      fresh:{title:"Different fresh check: radical forms",prompt:"For 2∛40, identify coefficient, index and radicand. Simplify √48 and write 3√5 as an entire radical.",fields:{ coefficient:field("Coefficient",["2"],"Look outside the radical."),index:field("Index",["3"],"Read the small root index."),radicand:field("Radicand",["40"],"Look under the radical."),mixed:field("√48 in simplest mixed form",["4sqrt3","4*sqrt3","4sqrt(3)"],"Extract the largest perfect square."),entire:field("3√5 as an entire radical",["sqrt45","sqrt(45)"],"Square 3 when moving it inside.")}},
      transfer:{title:"Changed-index transfer: radical forms",prompt:"Simplify ∛54, then write 2∛3 as an entire radical and identify why the conversion uses a cube.",fields:{mixed:field("∛54 in simplest mixed form",["3cbrt2","3*cbrt2","3cbrt(2)"],"Extract the largest perfect cube."),entire:field("2∛3 as an entire radical",["cbrt24","cbrt(24)"],"Move 2 inside using 2³."),reason:field("Power used to move the coefficient",["3","cube"],"The radical index determines the power.")}}
    },
    "43": {
      fresh:{title:"Different fresh check: same-base laws",prompt:"Simplify z³·z⁸, p¹⁰÷p⁴, b⁰, and (18m⁶n⁴)÷(6m²n). State the restriction for b⁰.",fields:{product:field("z³·z⁸",["z^11","z11"],"Add exponents."),quotient:field("p¹⁰÷p⁴",["p^6","p6"],"Subtract exponents."),zero:field("b⁰",["1"],"A nonzero base to zero is one."),restriction:field("Restriction",["b!=0","b≠0"],"Exclude zero."),combined:field("Combined quotient",["3m^4n^3","3*m^4*n^3"],"Divide coefficients and subtract each exponent.")}},
      transfer:{title:"Context transfer: zero and quotient laws",prompt:"A model simplifies (15r⁷s²)/(5r³s²). Give the simplified expression, the cancelled s factor, and both original restrictions.",fields:{combined:field("Simplified expression",["3r^4","3*r^4"],"Subtract like-base exponents."),zero:field("Value of s²/s²",["1"],"A nonzero quantity divided by itself is one."),restriction:field("Restrictions",["r!=0,s!=0","s!=0,r!=0","r≠0,s≠0","s≠0,r≠0"],"Read restrictions from the original denominator.")}}
    },
    "44": {
      fresh:{title:"Different fresh check: powers of grouped factors",prompt:"Simplify (q²)⁵, (3ab³)², (2k/5)³ and (m³n²)²·m/n³.",fields:{power:field("(q²)⁵",["q^10","q10"],"Multiply exponents."),product:field("(3ab³)²",["9a^2b^6","9*a^2*b^6"],"Square every factor."),quotient:field("(2k/5)³",["8k^3/125","(8k^3)/125"],"Cube numerator and denominator."),combined:field("Combined expression",["m^7n","m^7*n","nm^7"],"Distribute the square, then combine bases.")}},
      transfer:{title:"Error-analysis transfer: grouped powers",prompt:"A student writes (−2x²)³ = −6x⁵. Give the correct coefficient, x exponent, and the law needed.",fields:{coefficient:field("Correct coefficient",["-8","−8"],"Cube −2."),power:field("Correct x exponent",["6"],"Multiply the exponents 2 and 3."),law:field("Law",["powerofaproduct","powerofapower"],"The outside exponent applies to every factor.",{type:"select",options:[["","Choose"],["powerofaproduct","Power of a product"],["productofpowers","Product of powers"]]})}}
    },
    "45": {
      fresh:{title:"Different fresh check: negative exponents",prompt:"Rewrite y⁻³ and 4a⁻²/b⁻¹ using positive exponents. Evaluate (3/5)⁻² and state the restriction.",fields:{reciprocal:field("y⁻³",["1/y^3","1/(y^3)"],"Move the factor to the denominator."),rewrite:field("4a⁻²/b⁻¹",["4b/a^2","(4b)/a^2","4*b/a^2"],"Move both negative-exponent factors."),evaluate:field("(3/5)⁻²",["25/9"],"Invert, then square."),restriction:field("Restriction",["a!=0","a≠0"],"The negative exponent creates a denominator.")}},
      transfer:{title:"Context transfer: reciprocal scaling",prompt:"A scale factor is k⁻². Rewrite 4k⁻² with positive exponents. For k=4, give the reciprocal value and restriction.",fields:{reciprocal:field("Reciprocal form of k⁻²",["1/k^2","1/(k^2)"],"Move k² to the denominator."),rewrite:field("Positive-exponent form of 4k⁻²",["4/k^2","4/(k^2)"],"Keep the coefficient in the numerator."),evaluate:field("Value of k⁻² when k=4",["1/16","0.0625"],"Square 4 in the denominator."),restriction:field("Restriction",["k!=0","k≠0"],"The denominator cannot be zero.")}}
    },
    "46": {
      fresh:{title:"Different fresh check: rational exponents",prompt:"Evaluate 16^(1/2) and 8^(2/3), write y^(5/4) in radical form, and classify (−27)^(1/3).",fields:{square:field("16^(1/2)",["4"],"Take the square root."),cube:field("8^(2/3)",["4"],"Take the cube root, then square."),radical:field("y^(5/4) in radical form",["4rt(y^5)","fourthroot(y^5)","root4(y^5)","4throot(y^5)"],"Use index 4 and power 5."),domain:field("Is (−27)^(1/3) real?",["yes"],"Odd roots accept negative radicands.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]})}},
      transfer:{title:"Changed-form transfer: rational exponents",prompt:"A square has area 50 m². Give its exact side length in radical and exponent form, bracket it, evaluate 125^(2/3), and state the unit.",fields:{radical:field("Radical form",["sqrt50","sqrt(50)"],"Area to side length uses a square root."),exponent:field("Exponent form",["50^(1/2)","50^1/2"],"Square root corresponds to exponent 1/2."),evaluate:field("125^(2/3)",["25"],"Take the cube root, then square."),lower:field("Lower bound",["7"],"Compare with nearby squares."),upper:field("Upper bound",["8"],"Use the next whole number."),unit:field("Unit",["m","metres","meters"],"A side length uses linear metres.")}}
    },
    "47": {
      fresh:{title:"Different fresh check: combined exponent laws",prompt:"Name the first law for (y³)², simplify (3y⁻¹)²·y⁴, evaluate 5·2³, and identify the invalid claim.",fields:{law:field("First law",["powerofapower"],"An exponent applies to a power.",{type:"select",options:[["","Choose"],["product","Product of powers"],["quotient","Quotient of powers"],["powerofapower","Power of a power"]]}),simplify:field("Simplified expression",["9y^2","9*y^2"],"Square first, then add y exponents."),model:field("5·2³",["40"],"Evaluate the exponent first."),invalid:field("Invalid claim",["addition"],"Laws do not cross addition.",{type:"select",options:[["","Choose"],["addition","y² + y⁴ = y⁶"],["product","y² · y⁴ = y⁶"],["power","(y²)³ = y⁶"]]})}},
      transfer:{title:"Error-analysis transfer: combined laws",prompt:"A student changes (x⁻²)³/x⁻¹ into x⁻⁵ and then 1/x⁵. Give the exponent after the power, the exponent after division, and decide whether the final answer is valid.",fields:{power:field("Exponent after the power",["-6","−6"],"Multiply −2 by 3."),simplify:field("Exponent after division",["-5","−5"],"Subtract −1 from −6."),valid:field("Is 1/x⁵ valid?",["yes"],"Rewrite x⁻⁵ with a positive exponent.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]}),restriction:field("Restriction",["x!=0","x≠0"],"Read it from the original expression.")}}
    },
    "48": {
      fresh:{title:"Different fresh check: roots and powers transfer",prompt:"A cube has volume 216 cm³. Give its edge length, exponent form, operation and unit.",fields:{length:field("Edge length",["6"],"Find the number whose cube is 216."),exponent:field("Exponent form",["216^(1/3)","216^1/3"],"Cube root uses exponent 1/3."),operation:field("Operation",["cuberoot"],"Volume to edge uses a cube root.",{type:"select",options:[["","Choose"],["square","Square"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["cm","centimetres","centimeters"],"Use linear centimetres.")}},
      transfer:{title:"Changed-context transfer: area to length",prompt:"A square has area 196 m². Give its side length, exponent form, operation and unit.",fields:{length:field("Side length",["14"],"Find the positive square root of 196."),exponent:field("Exponent form",["196^(1/2)","196^1/2"],"Square root uses exponent 1/2."),operation:field("Operation",["squareroot"],"Area to side uses a square root.",{type:"select",options:[["","Choose"],["square","Square"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["m","metres","meters"],"Use linear metres.")}}
    }
  };

  var additionalVariants = {
    "41": {
      fresh2:{title:"Additional fresh check: roots",prompt:"Evaluate √196, bracket √110, classify √121, and order 10, √110 and 11.",fields:{exact:field("√196",["14"],"Use a perfect square."),lower:field("Lower bound",["10"],"Compare 110 with nearby squares."),upper:field("Upper bound",["11"],"Use consecutive whole numbers."),classify:field("Classify √121",["rational"],"It is a perfect square.",{type:"select",options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}),order:field("Least-to-greatest",["10,sqrt110,11","10,sqrt(110),11"],"Estimate before ordering.")}},
      retention:{title:"Later-session retention: roots",prompt:"Evaluate √225, bracket √130, classify √13, and order 11, √130 and 12.",fields:{exact:field("√225",["15"],"Use a perfect square."),lower:field("Lower bound",["11"],"Compare nearby squares."),upper:field("Upper bound",["12"],"Use consecutive whole numbers."),classify:field("Classify √13",["irrational"],"It is not a perfect square.",{type:"select",options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}),order:field("Least-to-greatest",["11,sqrt130,12","11,sqrt(130),12"],"Estimate before ordering.")}}
    },
    "42": {
      fresh2:{title:"Additional fresh check: radical forms",prompt:"For 4√18 identify coefficient, index and radicand. Simplify √27 and write 2√11 as an entire radical.",fields:{coefficient:field("Coefficient",["4"],"Look outside."),index:field("Index",["2"],"An unprinted square-root index is 2."),radicand:field("Radicand",["18"],"Look inside."),mixed:field("√27",["3sqrt3","3*sqrt3","3sqrt(3)"],"Extract 9."),entire:field("2√11",["sqrt44","sqrt(44)"],"Square 2 inside.")}},
      retention:{title:"Later-session retention: radical forms",prompt:"For 5∛16 identify coefficient, index and radicand. Simplify √98 and write 3√2 as an entire radical.",fields:{coefficient:field("Coefficient",["5"],"Look outside."),index:field("Index",["3"],"Read the root index."),radicand:field("Radicand",["16"],"Look inside."),mixed:field("√98",["7sqrt2","7*sqrt2","7sqrt(2)"],"Extract 49."),entire:field("3√2",["sqrt18","sqrt(18)"],"Square 3 inside.")}}
    },
    "43": {
      fresh2:{title:"Additional fresh check: same-base laws",prompt:"Simplify t⁵·t⁶, c¹²÷c⁵, d⁰, and (20p⁷q³)÷(4p²q). State the restriction for d⁰.",fields:{product:field("t⁵·t⁶",["t^11","t11"],"Add exponents."),quotient:field("c¹²÷c⁵",["c^7","c7"],"Subtract exponents."),zero:field("d⁰",["1"],"Nonzero base."),restriction:field("Restriction",["d!=0","d≠0"],"Exclude zero."),combined:field("Combined quotient",["5p^5q^2","5*p^5*q^2"],"Divide and subtract.")}},
      retention:{title:"Later-session retention: same-base laws",prompt:"Simplify h⁷·h², k¹¹÷k³, e⁰, and (24r⁸s⁵)÷(6r³s²). State the restriction for e⁰.",fields:{product:field("h⁷·h²",["h^9","h9"],"Add exponents."),quotient:field("k¹¹÷k³",["k^8","k8"],"Subtract exponents."),zero:field("e⁰",["1"],"Nonzero base."),restriction:field("Restriction",["e!=0","e≠0"],"Exclude zero."),combined:field("Combined quotient",["4r^5s^3","4*r^5*s^3"],"Divide and subtract.")}}
    },
    "44": {
      fresh2:{title:"Additional fresh check: grouped powers",prompt:"Simplify (r⁴)³, (2mn²)⁴, (4z/3)² and (a²b³)²·a/b⁴.",fields:{power:field("(r⁴)³",["r^12","r12"],"Multiply exponents."),product:field("(2mn²)⁴",["16m^4n^8","16*m^4*n^8"],"Apply the fourth power."),quotient:field("(4z/3)²",["16z^2/9","(16z^2)/9"],"Square numerator and denominator."),combined:field("Combined expression",["a^5b^2","a^5*b^2"],"Distribute then combine.")}},
      retention:{title:"Later-session retention: grouped powers",prompt:"Simplify (w²)⁶, (−3uv²)², (5j/2)² and (c³d)²·c²/d.",fields:{power:field("(w²)⁶",["w^12","w12"],"Multiply exponents."),product:field("(−3uv²)²",["9u^2v^4","9*u^2*v^4"],"Square every factor."),quotient:field("(5j/2)²",["25j^2/4","(25j^2)/4"],"Square numerator and denominator."),combined:field("Combined expression",["c^8d","c^8*d","dc^8"],"Distribute then combine.")}}
    },
    "45": {
      fresh2:{title:"Additional fresh check: negative exponents",prompt:"Rewrite z⁻⁵ and 6m⁻³/n⁻² using positive exponents. Evaluate (4/7)⁻² and state the restriction.",fields:{reciprocal:field("z⁻⁵",["1/z^5","1/(z^5)"],"Use a reciprocal."),rewrite:field("6m⁻³/n⁻²",["6n^2/m^3","6*n^2/m^3"],"Move negative powers."),evaluate:field("(4/7)⁻²",["49/16"],"Invert then square."),restriction:field("Restriction",["m!=0","m≠0"],"A denominator is created.")}},
      retention:{title:"Later-session retention: negative exponents",prompt:"Rewrite p⁻² and 5a⁻⁴/b⁻¹ using positive exponents. Evaluate (2/5)⁻³ and state the restriction.",fields:{reciprocal:field("p⁻²",["1/p^2","1/(p^2)"],"Use a reciprocal."),rewrite:field("5a⁻⁴/b⁻¹",["5b/a^4","5*b/a^4"],"Move negative powers."),evaluate:field("(2/5)⁻³",["125/8"],"Invert then cube."),restriction:field("Restriction",["a!=0","a≠0"],"A denominator is created.")}}
    },
    "46": {
      fresh2:{title:"Additional fresh check: rational exponents",prompt:"Evaluate 25^(1/2) and 64^(2/3), write z^(3/5) in radical form, and classify (−32)^(1/5).",fields:{square:field("25^(1/2)",["5"],"Square root."),cube:field("64^(2/3)",["16"],"Cube root then square."),radical:field("z^(3/5)",["5rt(z^3)","fifthroot(z^3)","root5(z^3)","5throot(z^3)"],"Index 5, power 3."),domain:field("Is (−32)^(1/5) real?",["yes"],"Odd roots accept negative radicands.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]})}},
      retention:{title:"Later-session retention: rational exponents",prompt:"Evaluate 36^(1/2) and 125^(2/3), write q^(7/4) in radical form, and classify (−25)^(1/2).",fields:{square:field("36^(1/2)",["6"],"Square root."),cube:field("125^(2/3)",["25"],"Cube root then square."),radical:field("q^(7/4)",["4rt(q^7)","fourthroot(q^7)","root4(q^7)","4throot(q^7)"],"Index 4, power 7."),domain:field("Is (−25)^(1/2) real?",["no"],"Even roots of negatives are not real.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]})}}
    },
    "47": {
      fresh2:{title:"Additional fresh check: combined laws",prompt:"Name the first law for (k⁴)², simplify (2k⁻²)²·k⁵, evaluate 4·3², and identify the invalid claim.",fields:{law:field("First law",["powerofapower"],"Exponent on a power.",{type:"select",options:[["","Choose"],["product","Product of powers"],["powerofapower","Power of a power"]]}),simplify:field("Simplified expression",["4k","4*k"],"Square then combine."),model:field("4·3²",["36"],"Exponent first."),invalid:field("Invalid claim",["addition"],"No addition law.",{type:"select",options:[["","Choose"],["addition","k³ + k² = k⁵"],["product","k³ · k² = k⁵"]]})}},
      retention:{title:"Later-session retention: combined laws",prompt:"Name the first law for (m²)⁵, simplify (3m⁻¹)²·m⁴, evaluate 2·5², and identify the invalid claim.",fields:{law:field("First law",["powerofapower"],"Exponent on a power.",{type:"select",options:[["","Choose"],["product","Product of powers"],["powerofapower","Power of a power"]]}),simplify:field("Simplified expression",["9m^2","9*m^2"],"Square then combine."),model:field("2·5²",["50"],"Exponent first."),invalid:field("Invalid claim",["addition"],"No addition law.",{type:"select",options:[["","Choose"],["addition","m⁴ + m³ = m⁷"],["product","m⁴ · m³ = m⁷"]]})}}
    },
    "48": {
      fresh2:{title:"Additional fresh check: measurement transfer",prompt:"A square has area 144 m². Give side length, exponent form, operation and unit.",fields:{length:field("Side length",["12"],"Positive square root."),exponent:field("Exponent form",["144^(1/2)","144^1/2"],"Square root exponent."),operation:field("Operation",["squareroot"],"Area to side.",{type:"select",options:[["","Choose"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["m","metres","meters"],"Linear unit.")}},
      retention:{title:"Later-session retention: measurement transfer",prompt:"A cube has volume 343 cm³. Give edge length, exponent form, operation and unit.",fields:{length:field("Edge length",["7"],"Positive cube root."),exponent:field("Exponent form",["343^(1/3)","343^1/3"],"Cube root exponent."),operation:field("Operation",["cuberoot"],"Volume to edge.",{type:"select",options:[["","Choose"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["cm","centimetres","centimeters"],"Linear unit.")}}
    }
  };
  Object.keys(additionalVariants).forEach(function(id){Object.assign(variants[id],additionalVariants[id]);});

  /* A second changed-form and later-session identity keeps support or a repair
     from stranding a learner at either mastery stage. These are deliberately
     different mathematical instances, not relabelled copies. */
  var recoveryVariants = {
    "41": {
      transfer2:{title:"Alternate transfer: cube-root magnitude",prompt:"A cube has volume 170 cm³. Bound its edge between whole centimetres, give the exact radical, and explain whether it is closer to the lower or upper bound.",fields:{lower:field("Lower bound",["5"],"Compare 170 with nearby cubes."),upper:field("Upper bound",["6"],"Use the next whole number."),exact:field("Exact edge",["cbrt170","cbrt(170)"],"Volume to edge uses a cube root."),closer:field("Closer bound",["6","upper"],"Compare 170 with 125 and 216.")}},
      retention2:{title:"Alternate later-session retention: roots",prompt:"Evaluate √256, bracket √150, classify √17, and order 12, √150 and 13.",fields:{exact:field("√256",["16"],"Use a perfect square."),lower:field("Lower bound",["12"],"Compare nearby squares."),upper:field("Upper bound",["13"],"Use consecutive whole numbers."),classify:field("Classify √17",["irrational"],"It is not a perfect square.",{type:"select",options:[["","Choose"],["rational","Rational"],["irrational","Irrational"]]}),order:field("Least-to-greatest",["12,sqrt150,13","12,sqrt(150),13"],"Estimate before ordering.")}}
    },
    "42": {
      transfer2:{title:"Alternate transfer: fourth-root form",prompt:"Simplify ⁴√48, write 2·⁴√3 as an entire radical, and name the power used to move the coefficient.",fields:{mixed:field("⁴√48",["2*4rt3","2(4rt3)","2fourthroot3","2*fourthroot(3)"],"Extract the perfect fourth power 16."),entire:field("2·⁴√3",["4rt48","fourthroot48","root4(48)","4throot(48)"],"Move 2 inside using 2⁴."),reason:field("Power used",["4","fourth power"],"The radical index determines the power.")}},
      retention2:{title:"Alternate later-session retention: radical forms",prompt:"For 3∛20 identify coefficient, index and radicand. Simplify √192 and write 4√3 as an entire radical.",fields:{coefficient:field("Coefficient",["3"],"Look outside."),index:field("Index",["3"],"Read the root index."),radicand:field("Radicand",["20"],"Look inside."),mixed:field("√192",["8sqrt3","8*sqrt3","8sqrt(3)"],"Extract 64."),entire:field("4√3",["sqrt48","sqrt(48)"],"Square 4 inside.")}}
    },
    "43": {
      transfer2:{title:"Alternate transfer: diagnose same-base laws",prompt:"Simplify (18a⁹b⁴)/(3a³b²), state the original restrictions, and explain why a⁴+a² cannot become a⁶.",fields:{simplify:field("Simplified quotient",["6a^6b^2","6*a^6*b^2"],"Divide coefficients and subtract exponents."),restrictionA:field("Restriction for a",["a!=0","a≠0"],"Read the original denominator."),restrictionB:field("Restriction for b",["b!=0","b≠0"],"Read the original denominator."),reason:field("Why not a⁶?",["addition","not multiplication","terms are added"],"The product law needs multiplication.")}},
      retention2:{title:"Alternate later-session retention: same-base laws",prompt:"Simplify n⁶·n⁵, w¹⁴÷w⁶, f⁰, and (35p⁹q⁶)÷(7p⁴q²). State the restriction for f⁰.",fields:{product:field("n⁶·n⁵",["n^11","n11"],"Add exponents."),quotient:field("w¹⁴÷w⁶",["w^8","w8"],"Subtract exponents."),zero:field("f⁰",["1"],"Nonzero base."),restriction:field("Restriction",["f!=0","f≠0"],"Exclude zero."),combined:field("Combined quotient",["5p^5q^4","5*p^5*q^4"],"Divide and subtract.")}}
    },
    "44": {
      transfer2:{title:"Alternate transfer: compare grouped powers",prompt:"Simplify (−2a²b)³ and (3a/5)², then simplify their variable-only product a⁶b³·a²/b.",fields:{product:field("(−2a²b)³",["-8a^6b^3","-8*a^6*b^3"],"Cube every factor."),quotient:field("(3a/5)²",["9a^2/25","(9a^2)/25"],"Square numerator and denominator."),combined:field("a⁶b³·a²/b",["a^8b^2","a^8*b^2"],"Combine like bases."),restriction:field("Restriction from division",["b!=0","b≠0"],"The original denominator cannot be zero.")}},
      retention2:{title:"Alternate later-session retention: grouped powers",prompt:"Simplify (t³)⁴, (2rs³)³, (7k/3)² and (g²h²)³·g/h⁴.",fields:{power:field("(t³)⁴",["t^12","t12"],"Multiply exponents."),product:field("(2rs³)³",["8r^3s^9","8*r^3*s^9"],"Cube every factor."),quotient:field("(7k/3)²",["49k^2/9","(49k^2)/9"],"Square numerator and denominator."),combined:field("Combined expression",["g^7h^2","g^7*h^2"],"Distribute then combine.")}}
    },
    "45": {
      transfer2:{title:"Alternate transfer: repair reciprocal structure",prompt:"Rewrite 7r⁻²/s⁻³ with positive exponents, evaluate (−3/4)⁻², and state both original variable restrictions.",fields:{rewrite:field("Positive-exponent form",["7s^3/r^2","7*s^3/r^2"],"Move each negative power across the fraction bar."),evaluate:field("(−3/4)⁻²",["16/9"],"Invert, then square."),restrictionR:field("Restriction for r",["r!=0","r≠0"],"A negative exponent creates a reciprocal."),restrictionS:field("Restriction for s",["s!=0","s≠0"],"Preserve the original restriction.")}},
      retention2:{title:"Alternate later-session retention: negative exponents",prompt:"Rewrite q⁻⁶ and 8c⁻²/d⁻³ using positive exponents. Evaluate (3/5)⁻² and state the restriction.",fields:{reciprocal:field("q⁻⁶",["1/q^6","1/(q^6)"],"Use a reciprocal."),rewrite:field("8c⁻²/d⁻³",["8d^3/c^2","8*d^3/c^2"],"Move negative powers."),evaluate:field("(3/5)⁻²",["25/9"],"Invert then square."),restriction:field("Restriction",["c!=0","c≠0"],"A denominator is created.")}}
    },
    "46": {
      transfer2:{title:"Alternate transfer: rational exponent decisions",prompt:"Evaluate 81^(3/4), write p^(5/3) in radical form, and decide whether (−16)^(3/4) is real.",fields:{evaluate:field("81^(3/4)",["27"],"Take the fourth root, then cube."),radical:field("p^(5/3)",["cbrt(p^5)","cbrtp^5","cbrt(p5)"],"The denominator is the root index."),domain:field("Is (−16)^(3/4) real?",["no"],"The fourth root is even.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]}),reason:field("Root index",["4"],"Read the denominator of the exponent.")}},
      retention2:{title:"Alternate later-session retention: rational exponents",prompt:"Evaluate 49^(1/2) and 216^(2/3), write s^(5/4) in radical form, and classify (−64)^(1/3).",fields:{square:field("49^(1/2)",["7"],"Square root."),cube:field("216^(2/3)",["36"],"Cube root then square."),radical:field("s^(5/4)",["4rt(s^5)","fourthroot(s^5)","root4(s^5)","4throot(s^5)"],"Index 4, power 5."),domain:field("Is (−64)^(1/3) real?",["yes"],"Odd roots accept negative radicands.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]})}}
    },
    "47": {
      transfer2:{title:"Alternate transfer: model and diagnose exponent laws",prompt:"Simplify (2y⁻²)³·y⁸, evaluate a model 5·2⁴, name the first law used, and reject the invalid additive claim.",fields:{simplify:field("Simplified expression",["8y^2","8*y^2"],"Cube first, then combine."),model:field("5·2⁴",["80"],"Evaluate the exponent first."),law:field("First law",["powerofapower"],"An exponent applies to a power.",{type:"select",options:[["","Choose"],["product","Product of powers"],["powerofapower","Power of a power"]]}),invalid:field("Invalid operation",["addition"],"Exponent laws do not cross addition.",{type:"select",options:[["","Choose"],["addition","Addition"],["multiplication","Multiplication"]]})}},
      retention2:{title:"Alternate later-session retention: combined laws",prompt:"Name the first law for (r³)⁴, simplify (2r⁻²)²·r⁷, evaluate 3·4², and identify the invalid claim.",fields:{law:field("First law",["powerofapower"],"Exponent on a power.",{type:"select",options:[["","Choose"],["product","Product of powers"],["powerofapower","Power of a power"]]}),simplify:field("Simplified expression",["4r^3","4*r^3"],"Square then combine."),model:field("3·4²",["48"],"Exponent first."),invalid:field("Invalid claim",["addition"],"No addition law.",{type:"select",options:[["","Choose"],["addition","r⁵ + r² = r⁷"],["product","r⁵ · r² = r⁷"]]})}}
    },
    "48": {
      transfer2:{title:"Alternate transfer: exact measurement",prompt:"A square has area 72 m². Give the exact simplified side length, a decimal estimate to one place, the operation and the linear unit.",fields:{exact:field("Exact side length",["6sqrt2","6sqrt(2)","6*sqrt2"],"Simplify √72."),estimate:field("One-decimal estimate",["8.5"],"√72 is about 8.485."),operation:field("Operation",["squareroot"],"Area to side uses a square root.",{type:"select",options:[["","Choose"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["m","metres","meters"],"Use a linear unit.")}},
      retention2:{title:"Alternate later-session retention: measurement transfer",prompt:"A cube has volume 729 cm³. Give edge length, exponent form, operation and unit.",fields:{length:field("Edge length",["9"],"Positive cube root."),exponent:field("Exponent form",["729^(1/3)","729^1/3"],"Cube-root exponent."),operation:field("Operation",["cuberoot"],"Volume to edge.",{type:"select",options:[["","Choose"],["squareroot","Square root"],["cuberoot","Cube root"]]}),unit:field("Unit",["cm","centimetres","centimeters"],"Linear unit.")}}
    }
  };
  Object.keys(recoveryVariants).forEach(function(id){Object.assign(variants[id],recoveryVariants[id]);});

  /* Every variant explicitly asks for the three evidence components that were
     under-specified in the audit. These are bounded decisions, not free-text
     keyword guesses, and each statement changes with the frozen task. */
  var radicalChecks={initial:"Does √75 equal 5√3?",fresh:"Does 3√5 equal √45?",fresh2:"Does √27 equal 3√3?",transfer:"Does 3∛2 equal ∛54?",transfer2:"Does 2·⁴√3 equal ⁴√48?",retention:"Does √98 equal 7√2?",retention2:"Does √192 equal 8√3?"};
  var variationKinds={initial:"routine-symbolic",fresh:"routine-symbolic",fresh2:"changed-representation",transfer:"context-transfer",transfer2:"error-analysis-transfer",retention:"later-routine",retention2:"later-changed-representation"};
  Object.keys(radicalChecks).forEach(function(variant){
    var task=variant==="initial"?tasks["42"]:variants["42"][variant];
    task.fields.verify=field(radicalChecks[variant],["yes"],"Compare the two expressions by simplifying both.",{type:"select",options:[["","Choose"],["yes","Yes"],["no","No"]]});
  });
  ["initial","fresh","fresh2","transfer","transfer2","retention","retention2"].forEach(function(variant){
    var task47=variant==="initial"?tasks["47"]:variants["47"][variant];
    task47.fields.reason=field("Why is the selected additive claim invalid?",["notmultiplication"],"Product and quotient exponent laws require multiplication or division, not addition.",{type:"select",options:[["","Choose"],["notmultiplication","The terms are not being multiplied"],["differentbases","The variables use different bases"]]});
    var task48=variant==="initial"?tasks["48"]:variants["48"][variant];
    task48.fields.strategy=field("Which form should be kept to preserve the exact value when comparing strategies?",["exact"],"A radical or rational-exponent form preserves the exact value; a rounded decimal does not.",{type:"select",options:[["","Choose"],["exact","Exact radical or exponent form"],["rounded","Rounded decimal only"]]});
  });

  var TARGET_CONTRACT_VERSION="c4-target-evidence-3";
  var fieldTargets={
    "41":{exact:["C4-41a"],lower:["C4-41b"],upper:["C4-41b"],closer:["C4-41b"],classify:["C4-41c"],order:["C4-41d"],unit:["C4-41a"]},
    "42":{coefficient:["C4-42a"],index:["C4-42a"],radicand:["C4-42a"],mixed:["C4-42b"],entire:["C4-42c"],reason:["C4-42a"],verify:["C4-42d"]},
    "43":{product:["C4-43a"],quotient:["C4-43b"],zero:["C4-43c"],restriction:["C4-43c"],combined:["C4-43b","C4-43d"],simplify:["C4-43b","C4-43d"],restrictionA:["C4-43b"],restrictionB:["C4-43b"],reason:["C4-43a"]},
    "44":{power:["C4-44a"],product:["C4-44a","C4-44b"],coefficient:["C4-44b"],law:["C4-44b"],quotient:["C4-44c"],restriction:["C4-44c"],combined:["C4-44d"]},
    "45":{reciprocal:["C4-45a"],rewrite:["C4-45b"],evaluate:["C4-45c"],restriction:["C4-45d"],restrictionR:["C4-45d"],restrictionS:["C4-45d"]},
    "46":{reason:["C4-46a"],radical:["C4-46a","C4-46b"],exponent:["C4-46b"],square:["C4-46c"],cube:["C4-46c"],evaluate:["C4-46c"],domain:["C4-46d"],lower:["C4-46d"],upper:["C4-46d"],unit:["C4-46d"]},
    "47":{law:["C4-47a"],simplify:["C4-47b"],power:["C4-47b"],model:["C4-47c"],invalid:["C4-47d"],valid:["C4-47d"],restriction:["C4-47d"],reason:["C4-47d"]},
    "48":{length:["C4-48a","C4-48c"],exponent:["C4-48a"],exact:["C4-48a"],estimate:["C4-48d"],operation:["C4-48c"],unit:["C4-48d"],strategy:["C4-48b"]}
  };
  function enrichTask(taskId,variant,task){
    task.taskVersion="c4-"+taskId+"-"+variant+"-v3";
    task.contractVersion=TARGET_CONTRACT_VERSION;
    task.variation=variationKinds[variant]||variant;
    task.reasoningTargets=variant.indexOf("transfer")===0?Object.keys(fieldTargets[taskId]).reduce(function(all,name){(fieldTargets[taskId][name]||[]).forEach(function(id){if(all.indexOf(id)<0)all.push(id);});return all;},[]):[];
    Object.keys(task.fields).forEach(function(name){
      var config=task.fields[name];config.targets=(fieldTargets[taskId]&&fieldTargets[taskId][name]||[]).slice();
      if(!config.fingerprint){config.fingerprint="c4|"+(config.targets.join("+")||"practice")+"|"+name+"|"+stableIdentity(task.prompt+"|"+config.label);}
    });
  }
  Object.keys(tasks).forEach(function(id){enrichTask(id,"initial",tasks[id]);Object.keys(variants[id]||{}).forEach(function(variant){enrichTask(id,variant,variants[id][variant]);});});
  variants["41"].fresh2.fields.exact.fingerprint="root|square|evaluate|196";
  tasks["42"].fields.entire.fingerprint="radical|square|entire|2|7|28";
  variants["42"].fresh.fields.entire.fingerprint="radical|square|entire|3|5|45";
  tasks["43"].fields.product.fingerprint="exponent|product|x|4|7";
  tasks["43"].fields.quotient.fingerprint="exponent|quotient|y|9|3";
  tasks["44"].fields.power.fingerprint="exponent|power|x|3|4";

  function getTask(taskId, variant) {
    if (!tasks[taskId]) throw new Error("Unknown Chapter 4 task: " + taskId);
    if (!variant || variant === "initial") return tasks[taskId];
    if (!variants[taskId] || !variants[taskId][variant]) throw new Error("Unknown Chapter 4 variant: " + taskId + "/" + variant);
    return variants[taskId][variant];
  }

  function accepted(fieldConfig, value) {
    if(math&&typeof math.classify==="function")return math.classify(fieldConfig,value).correct;
    var candidate = normalize(value);
    return fieldConfig.answers.some(function (answer) { return candidate === normalize(answer); });
  }

  function checkTask(taskId, answers, variant) {
    var task = getTask(taskId, variant);
    var result = { correct: true, fields: {} };
    Object.keys(task.fields).forEach(function (name) {
      var raw = answers && answers[name] != null ? String(answers[name]) : "";
      var classified=math&&typeof math.classify==="function"?math.classify(task.fields[name],raw):null;
      var blank = classified?classified.blank:normalize(raw) === "";
      var correct = classified?classified.correct:!blank && accepted(task.fields[name], raw);
      result.fields[name] = { blank: blank, correct: correct, status:classified?classified.status:(correct?"correct_complete":blank?"blank_input":"mathematical_error"), mathematicalFeedback:classified?classified.mathematicalFeedback:!blank&&!correct, targets:(task.fields[name].targets||[]).slice(), fingerprint:task.fields[name].fingerprint, hint: blank ? "" : task.fields[name].hint };
      if (!correct) result.correct = false;
    });
    return result;
  }

  return { normalize: normalize, tasks: tasks, variants: variants, fieldTargets:fieldTargets, TARGET_CONTRACT_VERSION:TARGET_CONTRACT_VERSION, getTask: getTask, accepted:accepted, checkTask: checkTask };
}));
