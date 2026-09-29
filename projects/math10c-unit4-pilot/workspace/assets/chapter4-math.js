(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Chapter4Math = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var superscripts = {"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁻":"-"};

  function gcd(a, b) { a=a<0n?-a:a; b=b<0n?-b:b; while(b){var t=a%b;a=b;b=t;} return a||1n; }
  function rat(n,d){n=BigInt(n);d=BigInt(d==null?1:d);if(!d)throw new Error("zero denominator");if(d<0n){n=-n;d=-d;}var g=gcd(n,d);return{n:n/g,d:d/g};}
  function add(a,b){return rat(a.n*b.d+b.n*a.d,a.d*b.d);}
  function mul(a,b){return rat(a.n*b.n,a.d*b.d);}
  function neg(a){return rat(-a.n,a.d);}
  function eqRat(a,b){return a.n===b.n&&a.d===b.d;}
  function isZero(a){return a.n===0n;}

  function normalize(value){
    return String(value==null?"":value).toLowerCase()
      .replace(/[−–—]/g,"-")
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,function(run){return"^"+Array.from(run).map(function(c){return superscripts[c];}).join("");})
      .replace(/∛/g,"cbrt")
      .replace(/√/g,"sqrt")
      .replace(/[×·]/g,"*")
      .replace(/≠/g,"!=")
      .replace(/≥/g,">=")
      .replace(/≤/g,"<=")
      .replace(/\*\*/g,"^")
      .replace(/[{}\[\]]/g,function(c){return c==="{"||c==="["?"(":")";})
      .replace(/fourthroot|4throot|4rt/g,"root4")
      .replace(/fifthroot|5throot|5rt/g,"root5")
      .replace(/root3/g,"cbrt")
      .replace(/\s+/g,"")
      .replace(/\*+/g,"*")
      .replace(/^\+/,"")
      .replace(/(^|[^a-z0-9])([0-9]+)\^(-?\d+)\/(\d+)/g,"$1$2^($3/$4)");
  }

  function decimalRat(text){
    var sign=1n,s=String(text);if(s[0]==="-"){sign=-1n;s=s.slice(1);}if(!/^\d+(?:\.\d+)?$/.test(s))throw new Error("invalid number");
    if(s.indexOf(".")<0)return rat(sign*BigInt(s),1);
    var parts=s.split("."),scale=10n**BigInt(parts[1].length);return rat(sign*BigInt(parts[0]+parts[1]),scale);
  }
  function factorInteger(value){
    var n=value<0n?-value:value,out={},p=2n;
    while(p*p<=n){while(n%p===0n){out[String(p)]=(out[String(p)]||0)+1;n/=p;}p=p===2n?3n:p+2n;}
    if(n>1n)out[String(n)]=(out[String(n)]||0)+1;return out;
  }
  function signature(){return{sign:1,zero:false,factors:{}};}
  function addPower(sig,key,power){var prior=sig.factors[key]||rat(0);var next=add(prior,power);if(isZero(next))delete sig.factors[key];else sig.factors[key]=next;}
  function fromRational(value){
    var out=signature();if(value.n===0n){out.zero=true;return out;}if(value.n<0n)out.sign=-1;
    var top=factorInteger(value.n),bottom=factorInteger(value.d);
    Object.keys(top).forEach(function(k){addPower(out,"#"+k,rat(top[k]));});
    Object.keys(bottom).forEach(function(k){addPower(out,"#"+k,rat(-bottom[k]));});return out;
  }
  function clone(a){var out={sign:a.sign,zero:a.zero,factors:{}};Object.keys(a.factors).forEach(function(k){out.factors[k]=rat(a.factors[k].n,a.factors[k].d);});return out;}
  function combine(a,b,divide){if(a.zero||b.zero){if(divide&&b.zero)throw new Error("division by zero");return fromRational(rat(0));}var out=clone(a);out.sign*=b.sign;Object.keys(b.factors).forEach(function(k){addPower(out,k,divide?neg(b.factors[k]):b.factors[k]);});return out;}
  function power(a,e){
    if(a.zero){if(e.n<=0n)throw new Error("undefined zero power");return fromRational(rat(0));}
    var out=signature();
    if(a.sign<0){if(e.d%2n===0n)throw new Error("not real");out.sign=e.n%2n===0n?1:-1;}
    Object.keys(a.factors).forEach(function(k){
      var resultPower=mul(a.factors[k],e),key=k;
      /* An even principal root of an odd power is an absolute value over the
         real-number domain: sqrt(x^2) is |x|, not x. Keep that distinction in
         the canonical signature instead of silently assuming x >= 0. */
      if(k[0]!=="#"&&e.d%2n===0n&&resultPower.d===1n&&resultPower.n%2n!==0n)key="|"+k+"|";
      addPower(out,key,resultPower);
    });return out;
  }
  function equalSignature(a,b){
    if(a.zero||b.zero)return a.zero===b.zero;if(a.sign!==b.sign)return false;
    var keys=Object.keys(Object.assign({},a.factors,b.factors));return keys.every(function(k){return eqRat(a.factors[k]||rat(0),b.factors[k]||rat(0));});
  }
  function signatureKey(sig){if(sig.zero)return"0";return(sig.sign<0?"-":"+")+Object.keys(sig.factors).sort().map(function(k){var p=sig.factors[k];return k+"^"+p.n+"/"+p.d;}).join("|");}

  function tokenize(value){
    var s=normalize(value),tokens=[],i=0;
    while(i<s.length){var c=s[i];
      if(/[0-9.]/.test(c)){var m=s.slice(i).match(/^\d+(?:\.\d+)?/);if(!m)throw new Error("malformed number");tokens.push({t:"num",v:m[0]});i+=m[0].length;continue;}
      if(/[a-z]/.test(c)){var id=s.slice(i).match(/^[a-z]+/)[0];tokens.push({t:"id",v:id});i+=id.length;continue;}
      if("+-*/^(),".indexOf(c)>=0){tokens.push({t:c,v:c});i+=1;continue;}
      throw new Error("unsupported symbol "+c);
    }
    return tokens;
  }
  function parse(value){
    var tokens=tokenize(value),at=0;
    function peek(){return tokens[at];}function take(type){var x=tokens[at];if(!x||type&&x.t!==type)throw new Error("expected "+type);at+=1;return x;}
    function exponent(){var sign=1n;if(peek()&&(peek().t==="+"||peek().t==="-")){if(take().t==="-")sign=-1n;}
      if(peek()&&peek().t==="("){take("(");var n=BigInt(take("num").v);var d=1n;if(peek()&&peek().t==="/"){take("/");d=BigInt(take("num").v);}take(")");return rat(sign*n,d);}
      return rat(sign*BigInt(take("num").v));
    }
    function primary(){var x=peek();if(!x)throw new Error("missing factor");
      if(x.t==="num"){take();return fromRational(decimalRat(x.v));}
      if(x.t==="("){take();var inside=product();take(")");return inside;}
      if(x.t==="id"){
        var id=take().v;
        if(id==="sqrt"||id==="cbrt"||id==="root4"||id==="root5"){
          var index=id==="sqrt"?2:id==="cbrt"?3:id==="root4"?4:5,arg;if(peek()&&peek().t==="("){take();arg=product();take(")");}else arg=primary();return power(arg,rat(1,index));
        }
        var out=signature();Array.from(id).forEach(function(name){addPower(out,name,rat(1));});return out;
      }
      throw new Error("unsupported factor");
    }
    function powered(){var out=primary();while(peek()&&peek().t==="^"){take();out=power(out,exponent());}return out;}
    /* Exponentiation binds before a leading sign: -2^2 means -(2^2), while
       (-2)^2 remains positive. */
    function unary(){if(peek()&&peek().t==="+"){take();return unary();}if(peek()&&peek().t==="-"){take();var out=unary();out=clone(out);out.sign*=-1;return out;}return powered();}
    function startsFactor(x){return x&&(x.t==="num"||x.t==="id"||x.t==="(");}
    function product(){var out=unary();while(peek()&&(peek().t==="*"||peek().t==="/"||startsFactor(peek()))){var op=peek().t;if(op==="*"||op==="/")take();else op="*";out=combine(out,unary(),op==="/");}return out;}
    var result=product();if(at!==tokens.length)throw new Error("unsupported operation");return result;
  }

  function restrictionSet(value){
    var s=normalize(value),matches=s.match(/[a-z]+!=0/g);if(!matches||matches.join(",").replace(/,/g,"")!==s.replace(/[,;&]/g,""))return null;
    return Array.from(new Set(matches.map(function(x){return x.slice(0,-3);}))).sort();
  }
  function sameText(value,answers){var candidate=normalize(value);return answers.some(function(a){return candidate===normalize(a);});}
  function rootFormIsSimplified(value){
    var s=normalize(value),re=/(sqrt|cbrt|root4|root5)\(?([0-9]+)\)?/g,m;
    while((m=re.exec(s))){var index=m[1]==="sqrt"?2:m[1]==="cbrt"?3:m[1]==="root4"?4:5,f=factorInteger(BigInt(m[2]));if(Object.keys(f).some(function(k){return f[k]>=index;}))return false;}
    return true;
  }
  function requestedForm(value,form){var s=normalize(value);if(!form)return true;
    if(form==="positive-exponents")return !/\^-/.test(s);
    if(form==="radical")return /(sqrt|cbrt|root4|root5)/.test(s);
    if(form==="simplified-radical")return /(sqrt|cbrt|root4|root5)/.test(s)&&rootFormIsSimplified(s);
    if(form==="fraction")return /^-?\(?[^=]+\)?\/\(?[^=]+\)?$/.test(s)&&s.indexOf(".")<0;
    return true;
  }
  function classify(field,value){
    var raw=String(value==null?"":value);if(!raw.trim())return{status:"blank_input",correct:false,blank:true,mathematicalFeedback:false};
    var answers=field.answers||[],kind=field.contract&&field.contract.kind||"text";
    if(kind==="expression"||kind==="number"){
      var actual;try{actual=parse(raw);}catch(error){return{status:"unsupported_notation",correct:false,blank:false,mathematicalFeedback:false,detail:error.message};}
      var equivalent=answers.some(function(answer){try{return equalSignature(actual,parse(answer));}catch(_){return false;}});
      if(!equivalent)return{status:"mathematical_error",correct:false,blank:false,mathematicalFeedback:true,signature:signatureKey(actual)};
      if(!requestedForm(raw,field.contract&&field.contract.form)){var form=field.contract&&field.contract.form,status=form==="simplified-radical"&&/(sqrt|cbrt|root4|root5)/.test(normalize(raw))?"valid_intermediate_step":"equivalent_not_requested_form";return{status:status,correct:false,blank:false,mathematicalFeedback:true,signature:signatureKey(actual)};}
      return{status:"correct_complete",correct:true,blank:false,mathematicalFeedback:false,signature:signatureKey(actual)};
    }
    if(kind==="restriction"){
      var actualSet=restrictionSet(raw),ok=actualSet&&answers.some(function(answer){var expected=restrictionSet(answer);return expected&&JSON.stringify(expected)===JSON.stringify(actualSet);});
      if(!actualSet)return{status:"unsupported_notation",correct:false,blank:false,mathematicalFeedback:false};
      return{status:ok?"correct_complete":"mathematical_error",correct:ok,blank:false,mathematicalFeedback:!ok};
    }
    var okText=sameText(raw,answers);return{status:okText?"correct_complete":"mathematical_error",correct:okText,blank:false,mathematicalFeedback:!okText};
  }

  return Object.freeze({normalize:normalize,parse:parse,equivalent:function(a,b){try{return equalSignature(parse(a),parse(b));}catch(_){return false;}},signatureKey:function(value){return signatureKey(parse(value));},classify:classify,restrictionSet:restrictionSet,rootFormIsSimplified:rootFormIsSimplified});
}));
