(function(root,factory){var api=factory(root.Chapter4Checkers,root.Chapter4Math);if(typeof module==="object"&&module.exports)module.exports=api;root.Chapter4PracticeData=api;}(typeof globalThis!=="undefined"?globalThis:this,function(checkers,math){
  "use strict";
  var normalize=checkers&&checkers.normalize?checkers.normalize:function(value){return String(value==null?"":value).toLowerCase().replace(/\s+/g,"");};
  var labels={"41":"Roots and real numbers","42":"Mixed and entire radicals","43":"Product, quotient and zero laws","44":"Powers of powers and products","45":"Negative exponents","46":"Fractional exponents","47":"Applying exponent laws","48":"Roots and powers transfer"};
  function defaultContract(target){
    if(/^C4-44/.test(target))return {kind:"expression"};
    if(/^C4-42b/.test(target)||/^C4-42d/.test(target))return {kind:"expression",form:"simplified-radical"};
    if(/^C4-42c/.test(target))return {kind:"expression",form:"radical"};
    if(/^C4-43[abd]/.test(target))return {kind:"expression"};
    if(/^C4-45[ab]/.test(target))return {kind:"expression",form:"positive-exponents"};
    if(/^C4-45c/.test(target))return {kind:"expression"};
    if(/^C4-45d/.test(target))return {kind:"restriction"};
    if(/^C4-46[ac]/.test(target))return {kind:"number"};
    if(/^C4-47b/.test(target))return {kind:"expression",form:"positive-exponents"};
    if(/^C4-47c/.test(target))return {kind:"number"};
    return {kind:"text"};
  }
  function q(id,target,prompt,answers,hint,solution,extra){var item=Object.assign({id:id,target:target,prompt:prompt,answers:answers,hint:hint,solution:solution,type:"text",contract:defaultContract(target)},extra||{});item.fingerprint=item.fingerprint||("c4-practice|"+target+"|"+normalize(item.answers[0]));return item;}
  var banks={
    "41":[
      q("41a-1","C4-41a","Evaluate √196.",["14"],"Find the positive number whose square is 196.","√196 = 14 because 14² = 196.",{fingerprint:"root|square|evaluate|196"}),
      q("41a-2","C4-41a","Evaluate ∛216.",["6"],"Find the number whose cube is 216.","∛216 = 6 because 6³ = 216."),
      q("41b-1","C4-41b","Between which consecutive whole numbers does √115 lie? Enter lower, upper.",["10,11"],"Compare 115 with nearby perfect squares.","10² = 100 < 115 < 121 = 11², so enter 10, 11."),
      q("41b-2","C4-41b","Between which consecutive whole numbers does ∛200 lie? Enter lower, upper.",["5,6"],"Compare 200 with nearby perfect cubes.","5³ = 125 < 200 < 216 = 6³, so enter 5, 6."),
      q("41c-1","C4-41c","Classify √18 as rational or irrational.",["irrational"],"Check whether 18 is a perfect square.","18 is not a perfect square, so √18 is irrational."),
      q("41c-2","C4-41c","Classify √144 as rational or irrational.",["rational"],"Evaluate the root first.","√144 = 12, an integer, so it is rational."),
      q("41d-1","C4-41d","Order from least to greatest: √45, 6, 7.",["6,sqrt45,7","6,sqrt(45),7"],"Bracket √45 between nearby squares.","36 < 45 < 49, so 6 < √45 < 7."),
      q("41d-2","C4-41d","Order from least to greatest: ∛100, 4, 5.",["4,cbrt100,5","4,cbrt(100),5"],"Bracket ∛100 between nearby cubes.","64 < 100 < 125, so 4 < ∛100 < 5.")
    ],
    "42":[
      q("42a-1","C4-42a","For 4∛54, enter coefficient, index, radicand.",["4,3,54"],"Read outside, the small root index, then inside.","The coefficient is 4, the index is 3 and the radicand is 54."),
      q("42a-2","C4-42a","For 7√11, enter coefficient, index, radicand.",["7,2,11"],"An unprinted square-root index is 2.","The coefficient is 7, index 2 and radicand 11."),
      q("42b-1","C4-42b","Simplify √108.",["6sqrt3","6*sqrt3","6sqrt(3)"],"Expose the perfect-square factor 36.","√108 = √(36·3) = 6√3."),
      q("42b-2","C4-42b","Simplify √200.",["10sqrt2","10*sqrt2","10sqrt(2)"],"Use the largest perfect-square factor.","√200 = √(100·2) = 10√2."),
      q("42b-3","C4-42b","Simplify ∛128.",["4cbrt2","4*cbrt2","4cbrt(2)"],"Expose the perfect cube 64.","∛128 = ∛(64·2) = 4∛2."),
      q("42c-1","C4-42c","Write 3√7 as an entire radical.",["sqrt63","sqrt(63)"],"Move 3 inside as 3².","3√7 = √(9·7) = √63."),
      q("42c-2","C4-42c","Write 2∛5 as an entire radical.",["cbrt40","cbrt(40)"],"Move 2 inside as 2³.","2∛5 = ∛(8·5) = ∛40."),
      q("42d-1","C4-42d","Does √147 represent the same exact value as 7√3? Enter yes or no.",["yes"],"Square 7 and compare the radicand.","Yes. √147 = √(49·3) = 7√3.",{contract:{kind:"text"}})
    ],
    "43":[
      q("43a-1","C4-43a","Simplify x⁴·x⁹.",["x^13","x13"],"Add exponents for a product of like bases.","x⁴·x⁹ = x¹³."),
      q("43a-2","C4-43a","Simplify (r³s²)(r⁵s).",["r^8s^3","r^8*s^3"],"Combine each like base independently.","r³r⁵ = r⁸ and s²s = s³, so the result is r⁸s³."),
      q("43b-1","C4-43b","Simplify a¹²/a⁵.",["a^7","a7"],"Subtract the denominator exponent.","a¹²/a⁵ = a⁷, with a ≠ 0 in the original quotient."),
      q("43b-2","C4-43b","Write t⁴/t⁹ using positive exponents.",["1/t^5","1/(t^5)"],"Subtract first, then rewrite the negative exponent.","t⁴/t⁹ = t⁻⁵ = 1/t⁵, t ≠ 0."),
      q("43c-1","C4-43c","Evaluate z⁰.",["1"],"The base must be nonzero.","z⁰ = 1 for z ≠ 0."),
      q("43c-2","C4-43c","State the restriction for m⁰.",["m!=0","m≠0"],"The zero-exponent law excludes a zero base.","The restriction is m ≠ 0."),
      q("43d-1","C4-43d","Simplify (20p⁷q⁴)/(5p²q).",["4p^5q^3","4*p^5*q^3"],"Divide coefficients and subtract exponents.","The result is 4p⁵q³, with p ≠ 0 and q ≠ 0 in the original quotient."),
      q("43d-2","C4-43d","Which expression cannot use a product-of-powers law: x²·x⁵ or x²+x⁵?",["x^2+x^5","x²+x⁵"],"The law requires multiplication.","x²+x⁵ cannot use the product law because the operation is addition.",{contract:{kind:"text"}})
    ],
    "44":[
      q("44a-1","C4-44a","Simplify (x⁴)³.",["x^12","x12"],"Multiply the exponents.","(x⁴)³ = x¹²."),
      q("44a-2","C4-44a","Simplify (p⁵)².",["p^10","p10"],"Multiply 5 by 2.","(p⁵)² = p¹⁰."),
      q("44b-1","C4-44b","Simplify (2ab²)³.",["8a^3b^6","8*a^3*b^6"],"Cube every factor.","(2ab²)³ = 8a³b⁶."),
      q("44b-2","C4-44b","Simplify (−2x³)⁴.",["16x^12","16*x^12"],"An even power makes the coefficient positive.","(−2x³)⁴ = 16x¹²."),
      q("44c-1","C4-44c","Simplify (3m/4)².",["9m^2/16","(9m^2)/16"],"Square numerator and denominator.","(3m/4)² = 9m²/16."),
      q("44c-2","C4-44c","Simplify (5y/2)³.",["125y^3/8","(125y^3)/8"],"Cube numerator and denominator.","(5y/2)³ = 125y³/8."),
      q("44d-1","C4-44d","Simplify (p²q)³·p/q².",["p^7q","p^7*q","qp^7"],"Distribute the cube, then combine like bases.","p⁶q³·p/q² = p⁷q, q ≠ 0."),
      q("44d-2","C4-44d","Simplify (a³b²)²·a²/b³.",["a^8b","a^8*b","ba^8"],"Apply the square first.","a⁶b⁴·a²/b³ = a⁸b, b ≠ 0.")
    ],
    "45":[
      q("45a-1","C4-45a","Rewrite x⁻⁵ using a positive exponent.",["1/x^5","1/(x^5)"],"Use the reciprocal.","x⁻⁵ = 1/x⁵, x ≠ 0."),
      q("45a-2","C4-45a","Evaluate 10⁻².",["1/100","0.01"],"Use the reciprocal of 10².","10⁻² = 1/100 = 0.01."),
      q("45b-1","C4-45b","Rewrite 4a⁻³/b⁻² using positive exponents.",["4b^2/a^3","4*b^2/a^3"],"Move a⁻³ down and b⁻² up.","4a⁻³/b⁻² = 4b²/a³."),
      q("45b-2","C4-45b","Rewrite 2x⁻²y³ using positive exponents.",["2y^3/x^2","2*y^3/x^2"],"Only the x factor moves.","2x⁻²y³ = 2y³/x²."),
      q("45c-1","C4-45c","Evaluate (2/3)⁻³.",["27/8"],"Invert, then cube.","(2/3)⁻³ = (3/2)³ = 27/8."),
      q("45c-2","C4-45c","Evaluate (−2/5)⁻².",["25/4"],"Invert and apply the even power.","(−2/5)⁻² = (−5/2)² = 25/4."),
      q("45d-1","C4-45d","State the restriction for 3/k⁻².",["k!=0","k≠0"],"Read the restriction from the original negative exponent.","The restriction is k ≠ 0."),
      q("45d-2","C4-45d","Simplify 1/(m⁻³).",["m^3","m3"],"Dividing by a reciprocal multiplies by the original positive power.","1/(m⁻³) = m³, with m ≠ 0 in the original expression.",{contract:{kind:"expression",form:"positive-exponents"}})
    ],
    "46":[
      q("46a-1","C4-46a","Evaluate 64^(1/2).",["8"],"The denominator 2 means square root.","64^(1/2) = √64 = 8."),
      q("46a-2","C4-46a","Evaluate 125^(2/3).",["25"],"Take the cube root, then square.","125^(2/3) = 5² = 25."),
      q("46b-1","C4-46b","Write x^(3/2) in radical form.",["sqrt(x^3)","sqrtx^3","sqrt(x3)"],"Denominator 2 is the root index.","x^(3/2) = √(x³)."),
      q("46b-2","C4-46b","Write y^(2/3) in radical form.",["cbrt(y^2)","cbrty^2","cbrt(y2)"],"Denominator 3 is the root index.","y^(2/3) = ∛(y²)."),
      q("46c-1","C4-46c","Evaluate 16^(3/4).",["8"],"Take the fourth root, then cube.","16^(3/4) = 2³ = 8."),
      q("46c-2","C4-46c","Evaluate 32^(2/5).",["4"],"Take the fifth root, then square.","32^(2/5) = 2² = 4."),
      q("46d-1","C4-46d","Is (−125)^(1/3) real? Enter yes or no.",["yes"],"Odd roots can accept negative radicands.","Yes. ∛(−125) = −5."),
      q("46d-2","C4-46d","Is (−81)^(1/4) real? Enter yes or no.",["no"],"Even roots of negative numbers are not real.","No real number has fourth power −81.")
    ],
    "47":[
      q("47a-1","C4-47a","Name the first law used for (x³)⁴.",["powerofapower","power of a power"],"An exponent is applied to a power.","Use the power-of-a-power law."),
      q("47a-2","C4-47a","Name the law used for z⁵·z².",["productofpowers","product of powers"],"The like bases are multiplied.","Use the product-of-powers law."),
      q("47b-1","C4-47b","Simplify (2x⁻¹)²·x⁵.",["4x^3","4*x^3"],"Square first, then combine x powers.","(2x⁻¹)²·x⁵ = 4x⁻²x⁵ = 4x³."),
      q("47b-2","C4-47b","Simplify (3m²n⁻¹)²/(9m).",["m^3/n^2","m^3/(n^2)"],"Square the group, then divide.","9m⁴n⁻²/(9m) = m³/n², m ≠ 0 and n ≠ 0."),
      q("47c-1","C4-47c","Evaluate 4·3³.",["108"],"Evaluate the exponent before multiplying.","4·3³ = 4·27 = 108."),
      q("47c-2","C4-47c","A quantity doubles for 5 periods from 6. Evaluate 6·2⁵.",["192"],"Evaluate 2⁵ first.","6·2⁵ = 6·32 = 192."),
      q("47d-1","C4-47d","Why is x²+x⁴=x⁶ invalid? Enter: not multiplication.",["not multiplication","notmultiplication"],"The product law needs powers with the same base to be multiplied.","The terms are added, not multiplied, so the product law does not apply.",{contract:{kind:"text"}}),
      q("47d-2","C4-47d","Which reason verifies (a³)²/a⁴=a²: multiply then subtract, or add then divide?",["multiply then subtract","multiplythensubtract"],"Apply the power first, then the quotient law.","Multiply 3·2 to get a⁶, then subtract 4 to get a², with a ≠ 0.",{contract:{kind:"text"}})
    ],
    "48":[
      q("48a-1","C4-48a","A square has area 81 m². Give its side length with unit.",["9m","9 m","9metres","9meters"],"Use the positive square root.","√81 = 9, so the side length is 9 m."),
      q("48a-2","C4-48a","A cube has volume 512 cm³. Give its edge length with unit.",["8cm","8 cm","8centimetres","8centimeters"],"Use the positive cube root.","∛512 = 8, so the edge length is 8 cm."),
      q("48b-1","C4-48b","A square with area 50 m² has side 5√2 m, about 7.1 m. Which form preserves the exact value for checking?",["5sqrt2m","5sqrt2 m","5*sqrt2m","5sqrt(2)m","exact"],"A rounded decimal is useful for size; the radical preserves the exact value.","Keep 5√2 m for exact checking; use 7.1 m only as an estimate.",{contract:{kind:"text"}}),
      q("48b-2","C4-48b","For the edge of a 200 cm³ cube, which strategy preserves exact value: ∛200 or 5.8?",["cbrt200","cbrt(200)","exact"],"The decimal is rounded.","∛200 cm is exact; 5.8 cm is an estimate.",{contract:{kind:"text"}}),
      q("48c-1","C4-48c","A circle has area 36π cm². Find its radius with unit.",["6cm","6 cm","6centimetres","6centimeters"],"Use A=πr², then take the meaningful root.","r²=36, so the physical radius is 6 cm."),
      q("48c-2","C4-48c","A cube edge is 4.5 m. Find its volume with unit.",["91.125m^3","91.125 m^3","91.125m3"],"Cube the edge and use cubic units.","4.5³ = 91.125, so the volume is 91.125 m³."),
      q("48d-1","C4-48d","What linear unit results from √(144 cm²)?",["cm","centimetres","centimeters"],"A square root changes square units to linear units.","The result is measured in centimetres, cm."),
      q("48d-2","C4-48d","State the real-number domain condition for √x.",["x>=0","x≥0"],"An even root needs a nonnegative radicand.","For real √x, x ≥ 0.")
    ]
  };
  var errors=[
    q("e41","C4-41b","A student writes √70=35 because a square root means divide by 2. Diagnose and repair the work.",["8<sqrt70<9"],"Use neighbouring perfect squares, not division.","The first operation is invalid. Since 8²=64 and 9²=81, 8<√70<9.",{contract:{kind:"text"},fields:[
      {name:"operation",label:"First invalid operation",answers:["divideby2"],hint:"A square root asks which number squares to the radicand.",type:"select",options:[["","Choose"],["divideby2","Dividing 70 by 2"],["squaring70","Squaring 70"],["comparingbounds","Comparing neighbouring squares"]],contract:{kind:"text"}},
      {name:"lowerSquare",label:"Lower neighbouring square",answers:["64"],hint:"Use the greatest perfect square below 70.",contract:{kind:"number"}},
      {name:"upperSquare",label:"Upper neighbouring square",answers:["81"],hint:"Use the least perfect square above 70.",contract:{kind:"number"}},
      {name:"repair",label:"Correct bound for √70",answers:["8<sqrt70<9","8<sqrt(70)<9"],hint:"Use the positive square roots of 64 and 81 as the bounds.",contract:{kind:"text"}}
    ],fingerprint:"root|square|error-analysis|70"}),
    q("e42","C4-42c","A student writes 3√5=√15. Name the missing operation.",["square the coefficient","square 3","3^2"],"The radical index is 2.","Move 3 inside as 3²: 3√5=√45.",{contract:{kind:"text"},exposes:["radical|square|entire|3|5|45"]}),
    q("e43","C4-43a","A student writes x²+x³=x⁵. Name the operation that makes the law invalid.",["addition","adding"],"Product laws require multiplication.","Addition does not permit adding exponents.",{contract:{kind:"text"}}),
    q("e44","C4-44b","A student writes (2xy)³=2x³y³. Which factor was not cubed?",["2","coefficient","the coefficient"],"The outside exponent applies to every factor.","2³=8, so the correct expression is 8x³y³.",{contract:{kind:"text"}}),
    q("e45","C4-45a","A student writes x⁻³=−x³. What idea repairs the work?",["reciprocal","use the reciprocal","1/x^3"],"A negative exponent changes position, not sign.","x⁻³=1/x³ for x≠0.",{contract:{kind:"text"}}),
    q("e46","C4-46a","A student reads 16^(3/4) as cube root then fourth power. Which number is the root index?",["4"],"The denominator is the root index.","Take the fourth root, then cube: 2³=8.",{contract:{kind:"number"}}),
    q("e47","C4-47b","A student simplifies (x²)³ as x⁵. What should happen to the exponents?",["multiply","multiply them","2*3"],"This is a power of a power.","Multiply 2 by 3 to get x⁶.",{contract:{kind:"text"}}),
    q("e48","C4-48d","A student gives √(64 cm²)=8 cm². What must change?",["unit","cm","linear unit"],"Taking a square root changes the dimension of the unit.","The answer is 8 cm, a linear unit.",{contract:{kind:"text"}})
  ];
  function familyQuestion(lesson,targetIndex,seed,slot){
    var s=Number(seed||0),n=s*5+slot+1,target="C4-"+lesson+String.fromCharCode(97+targetIndex),id="g"+lesson+"-"+targetIndex+"-"+s+"-"+slot,squareFree=[2,3,5,6,7,10,11,13];
    if(lesson==="41"){
      if(targetIndex===0){var r=13+n;return q(id,target,"Evaluate √"+(r*r)+".",[String(r)],"Find the positive number whose square is the radicand.","√"+(r*r)+" = "+r+" because "+r+"² = "+(r*r)+".",{contract:{kind:"number"},fingerprint:"root|square|evaluate|"+(r*r)});}
      if(targetIndex===1){var low=5+(n%8),rad=low*low+1+(n%(2*low));return q(id,target,"Between which consecutive whole numbers does √"+rad+" lie? Enter lower, upper.",[low+","+(low+1)],"Compare the radicand with the two neighbouring perfect squares.",low+"² < "+rad+" < "+(low+1)+"², so the bounds are "+low+" and "+(low+1)+".",{contract:{kind:"text"},fingerprint:"root|square|bounds|"+rad});}
      if(targetIndex===2){var irr=(7+n)*2+3;while(Math.sqrt(irr)%1===0)irr+=2;return q(id,target,"Classify √"+irr+" as rational or irrational.",["irrational"],"A square root of a whole number is rational only when the radicand is a perfect square.",irr+" is not a perfect square, so √"+irr+" is irrational.",{contract:{kind:"text"},fingerprint:"root|square|classify|"+irr});}
      var l=4+(n%9),inside=l*l+Math.max(1,n%(2*l));return q(id,target,"Order from least to greatest: "+l+", √"+inside+", "+(l+1)+".",[l+",sqrt"+inside+","+(l+1),l+",sqrt("+inside+"),"+(l+1)],"Use the neighbouring squares before placing the root.",l+" < √"+inside+" < "+(l+1)+".",{contract:{kind:"text"},fingerprint:"root|square|order|"+inside});
    }
    if(lesson==="42"){
      if(targetIndex===0){var coef=2+n%7,index=n%2?3:2,radicand=10+n;return q(id,target,"For "+coef+(index===3?"∛":"√")+radicand+", enter coefficient, index, radicand.",[coef+","+index+","+radicand],"Read the factor outside, the root index, then the quantity inside.","The three parts are "+coef+", "+index+", "+radicand+".",{contract:{kind:"text"},fingerprint:"radical|parts|"+coef+"|"+index+"|"+radicand});}
      if(targetIndex===1){var c=2+n,rem=squareFree[n%squareFree.length],rad2=c*c*rem;return q(id,target,"Simplify √"+rad2+".",[c+"sqrt"+rem,c+"*sqrt"+rem,c+"sqrt("+rem+")"],"Expose the largest perfect-square factor.","√"+rad2+" = "+c+"√"+rem+".",{contract:{kind:"expression",form:"simplified-radical"},fingerprint:"radical|square|mixed|"+rad2});}
      if(targetIndex===2){var c2=2+n%7,rem2=squareFree[(n+2)%squareFree.length],whole=c2*c2*rem2;return q(id,target,"Write "+c2+"√"+rem2+" as an entire radical.",["sqrt"+whole,"sqrt("+whole+")"],"Square the coefficient when moving it inside a square root.",c2+"√"+rem2+" = √"+whole+".",{contract:{kind:"expression",form:"radical"},fingerprint:"radical|square|entire|"+c2+"|"+rem2+"|"+whole});}
      var c3=2+n%9,rem3=squareFree[(n+4)%squareFree.length],rad3=c3*c3*rem3;return q(id,target,"Does √"+rad3+" equal "+c3+"√"+rem3+"? Enter yes or no.",["yes"],"Square the outside coefficient and compare the radicand.","Yes. √"+rad3+" = "+c3+"√"+rem3+".",{contract:{kind:"text"},fingerprint:"radical|square|verify|"+rad3});
    }
    if(lesson==="43"){
      if(targetIndex===0){var a=2+n,b=2+(slot%7);return q(id,target,"Simplify x^"+a+" · x^"+b+".",["x^"+(a+b)],"Add exponents when like bases are multiplied.","x^"+a+" · x^"+b+" = x^"+(a+b)+".",{contract:{kind:"expression"},fingerprint:"powers|product|x|"+a+"|"+b});}
      if(targetIndex===1){var top=20+n,bot=2+slot%5;return q(id,target,"Simplify a^"+top+" / a^"+bot+".",["a^"+(top-bot)],"Subtract the denominator exponent.","a^"+top+" / a^"+bot+" = a^"+(top-bot)+", a ≠ 0.",{contract:{kind:"expression"},fingerprint:"powers|quotient|a|"+top+"|"+bot});}
      if(targetIndex===2){return q(id,target,"Evaluate (x+"+n+")^0 and state its restriction. Enter value, restriction.",["1,x!=-"+n,"1,x≠-"+n],"A zero power is 1 only when its whole base is nonzero.","(x+"+n+")⁰ = 1 for x ≠ −"+n+".",{contract:{kind:"text"},fingerprint:"powers|zero|x-plus-"+n});}
      var co=2+n%8,co2=2+n%4,px=7+n%8,py=2+n%5;return q(id,target,"Simplify ("+(co*co2)+"p^"+px+"q^"+py+")/("+co2+"p²q).",[co+"p^"+(px-2)+"q^"+(py-1),co+"*p^"+(px-2)+"*q^"+(py-1)],"Divide coefficients and subtract exponents for each base.","The result is "+co+"p^"+(px-2)+"q^"+(py-1)+".",{contract:{kind:"expression"},fingerprint:"powers|combined-quotient|"+n});
    }
    if(lesson==="44"){
      if(targetIndex===0){var inner=2+n,outer=2+slot%4;return q(id,target,"Simplify (x^"+inner+")^"+outer+".",["x^"+(inner*outer)],"Multiply the exponents.","The result is x^"+(inner*outer)+".",{contract:{kind:"expression"},fingerprint:"power|power|x|"+inner+"|"+outer});}
      if(targetIndex===1){var k=2+n%4,pow=2+n%3;return q(id,target,"Simplify ("+k+"ab²)^"+pow+".",[(Math.pow(k,pow))+"a^"+pow+"b^"+(2*pow)],"Apply the outside power to every factor.","The result is "+Math.pow(k,pow)+"a^"+pow+"b^"+(2*pow)+".",{contract:{kind:"expression"},fingerprint:"power|product|"+k+"|"+pow});}
      if(targetIndex===2){var num=2+n%6,den=2+(n*2)%7,pow2=2+n%2;return q(id,target,"Simplify ("+num+"m/"+den+")^"+pow2+".",[Math.pow(num,pow2)+"m^"+pow2+"/"+Math.pow(den,pow2)],"Apply the power to numerator and denominator.","The result is "+Math.pow(num,pow2)+"m^"+pow2+"/"+Math.pow(den,pow2)+".",{contract:{kind:"expression"},fingerprint:"power|quotient|"+num+"|"+den+"|"+pow2});}
      var p1=2+n%4,p2=2+n%3;return q(id,target,"Simplify (p²q)^"+p1+" · p²/q^"+p2+".",["p^"+(2*p1+2)+"q^"+(p1-p2)],"Distribute the power, then combine like bases.","The result is p^"+(2*p1+2)+"q^"+(p1-p2)+".",{contract:{kind:"expression"},fingerprint:"power|combined|"+p1+"|"+p2});
    }
    if(lesson==="45"){
      if(targetIndex===0){var exp=2+n;return q(id,target,"Rewrite x^(−"+exp+") using a positive exponent.",["1/x^"+exp],"A negative exponent creates a reciprocal.","x^(−"+exp+") = 1/x^"+exp+", x ≠ 0.",{contract:{kind:"expression",form:"positive-exponents"},fingerprint:"negative|reciprocal|x|"+exp});}
      if(targetIndex===1){var e1=2+n%5,e2=2+(n*2)%5;return q(id,target,"Rewrite "+(2+n%7)+"a^(−"+e1+")/b^(−"+e2+") using positive exponents.",[(2+n%7)+"b^"+e2+"/a^"+e1],"Move each negative power across the fraction bar.","The result is "+(2+n%7)+"b^"+e2+"/a^"+e1+".",{contract:{kind:"expression",form:"positive-exponents"},fingerprint:"negative|rewrite|"+n});}
      if(targetIndex===2){var base=2+n,den2=base+1,ep=2+n%2;return q(id,target,"Evaluate ("+base+"/"+den2+")^(−"+ep+").",[Math.pow(den2,ep)+"/"+Math.pow(base,ep),String(Math.pow(den2/base,ep))],"Invert the base, then apply the positive power.","The exact value is "+Math.pow(den2,ep)+"/"+Math.pow(base,ep)+".",{contract:{kind:"expression"},fingerprint:"negative|rational-base|"+base+"|"+den2+"|"+ep});}
      return q(id,target,"State the restriction created by (x+"+n+")^(−2).",["x!=-"+n,"x≠-"+n],"The whole reciprocal base cannot be zero.","The restriction is x ≠ −"+n+".",{contract:{kind:"text"},fingerprint:"negative|restriction|x-plus-"+n});
    }
    if(lesson==="46"){
      if(targetIndex===0){var idx=2+n%4,power=1+n;return q(id,target,"In a^("+power+"/"+idx+"), what is the root index?",[String(idx)],"The denominator is the root index.","The root index is "+idx+".",{contract:{kind:"number"},fingerprint:"rational-exponent|read|"+power+"|"+idx});}
      if(targetIndex===1){var idx2=2+n%4,power2=2+n;return q(id,target,"Write x^("+power2+"/"+idx2+") in radical form.",[idx2===2?"sqrt(x^"+power2+")":idx2===3?"cbrt(x^"+power2+")":"root"+idx2+"(x^"+power2+")"],"The denominator is the root index and the numerator remains the power.","Use root index "+idx2+" and power "+power2+".",{contract:{kind:"text"},fingerprint:"rational-exponent|convert|"+power2+"|"+idx2});}
      if(targetIndex===2){var root=2+n,value=root*root;return q(id,target,"Evaluate "+value+"^(1/2).",[String(root)],"Take the positive square root.","The value is "+root+".",{contract:{kind:"number"},fingerprint:"rational-exponent|evaluate-square-root|"+value});}
      var neg=Math.pow(2+n,2);return q(id,target,"Is (−"+neg+")^(1/2) real? Enter yes or no.",["no"],"An even root of a negative number is not real.","No real square root exists.",{contract:{kind:"text"},fingerprint:"rational-exponent|domain|"+neg});
    }
    if(lesson==="47"){
      if(targetIndex===0){var a2=2+n,b2=2+slot%4;return q(id,target,"Name the first law used for (x^"+a2+")^"+b2+".",["powerofapower","power of a power"],"An exponent is applied to an existing power.","Use the power-of-a-power law.",{contract:{kind:"text"},fingerprint:"apply|choose-law|power-power|"+a2+"|"+b2});}
      if(targetIndex===1){var ee=1+n;return q(id,target,"Simplify (2x^(−"+ee+"))² · x^"+(2*ee+3)+".",["4x^3","4*x^3"],"Square first, then combine x powers.","The result is 4x³.",{contract:{kind:"expression",form:"positive-exponents"},fingerprint:"apply|multistep|"+ee});}
      if(targetIndex===2){var initial=2+n%7,growth=2+n%3,periods=2+n%5,total=initial*Math.pow(growth,periods);return q(id,target,"A quantity starts at "+initial+" and is multiplied by "+growth+" for "+periods+" periods. Evaluate the model.",[String(total)],"Evaluate the power before multiplying by the initial amount.","The model gives "+total+".",{contract:{kind:"number"},fingerprint:"apply|model|"+initial+"|"+growth+"|"+periods});}
      return q(id,target,"Why can the product law not justify x² + x^"+(3+n%5)+" = x^"+(5+n%5)+"? Enter: not multiplication.",["not multiplication","notmultiplication"],"The product law combines powers only when they are multiplied.","The terms are added, not multiplied.",{contract:{kind:"text"},fingerprint:"apply|diagnose-addition|"+n});
    }
    if(targetIndex===0){var side=4+n;return q(id,target,"A square has area "+(side*side)+" m². Give its side length with unit.",[side+"m",side+" m"],"Use the positive square root and a linear unit.","The side length is "+side+" m.",{contract:{kind:"text"},fingerprint:"transfer|measurement|square|"+(side*side)});}
    if(targetIndex===1){var c4=2+n%7,rem4=squareFree[(n+6)%squareFree.length],area=c4*c4*rem4;return q(id,target,"A square has area "+area+" m². Which form should be kept to preserve exact value when comparing methods: "+c4+"√"+rem4+" m or a rounded decimal?",[c4+"sqrt"+rem4+"m",c4+"sqrt"+rem4+" m","exact"],"The radical is exact; the decimal is an estimate.","Keep "+c4+"√"+rem4+" m for exact checking.",{contract:{kind:"text"},fingerprint:"transfer|strategy|exact-length|"+area});}
    if(targetIndex===2){var edge=3+n;return q(id,target,"A cube has volume "+Math.pow(edge,3)+" cm³. Find its edge length with unit.",[edge+"cm",edge+" cm"],"Use the positive cube root.","The edge is "+edge+" cm.",{contract:{kind:"text"},fingerprint:"transfer|measurement|cube|"+Math.pow(edge,3)});}
    var unit=["cm","m","mm"][n%3],sq=(5+n%12);return q(id,target,"What unit results from √("+(sq*sq)+" "+unit+"²)?",[unit],"A square root changes square units to linear units.","The result uses "+unit+".",{contract:{kind:"text"},fingerprint:"transfer|unit|"+unit+"|"+(sq*sq)});
  }
  function lessonSet(lesson,seed,count){lesson=String(lesson);if(!banks[lesson])throw new Error("Unknown practice lesson "+lesson);var total=count||5,out=[];for(var i=0;i<total;i++)out.push(familyQuestion(lesson,i%4,seed,i));return out;}
  function mixedSet(seed){return Object.keys(banks).map(function(id,index){return familyQuestion(id,(Number(seed||0)+index)%4,Number(seed||0),index);});}
  function reviewSet(seed){var half=Math.abs(Number(seed||0))%2,out=[];Object.keys(banks).forEach(function(id,lessonIndex){[half*2,half*2+1].forEach(function(targetIndex,slot){out.push(familyQuestion(id,targetIndex,Number(seed||0)+10,lessonIndex*2+slot));});});return out;}
  function accepted(question,value){if(math&&typeof math.classify==="function")return math.classify(question,value).correct;var candidate=normalize(value);return candidate!==""&&question.answers.some(function(answer){return normalize(answer)===candidate;});}
  function byId(id){var found=null;Object.keys(banks).some(function(lesson){return banks[lesson].some(function(item){if(item.id===id){found=item;return true;}return false;});});if(!found)found=errors.find(function(item){return item.id===id;})||null;return found;}
  return {labels:labels,banks:banks,errors:errors,familyQuestion:familyQuestion,lessonSet:lessonSet,mixedSet:mixedSet,reviewSet:reviewSet,accepted:accepted,byId:byId};
}));
