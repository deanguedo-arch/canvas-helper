"""Generate frozen author arithmetic. No learner files or learner data are accessed."""
from decimal import Decimal as D, ROUND_HALF_UP, getcontext
from pathlib import Path
import json
getcontext().prec=40
CENT=D('0.01')
def cents(n): return D(n).quantize(CENT, rounding=ROUND_HALF_UP)
def rate(j, kind='monthly'):
    j=D(str(j))/100
    return j/12 if kind=='monthly' else (1+j/2)**(D(1)/6)-1
def payment(p,i,n):
    p=D(str(p))
    return cents(p/n if not i else p*i/(1-(1+i)**(-n)))
def schedule(p,annual,months,kind='monthly',changes=None):
    b=cents(p); i=rate(annual,kind); pay=payment(b,i,months); rows=[]; phases=[{'fromMonth':1,'annualPercent':str(annual),'payment':str(pay)}]
    for m in range(1,months+1):
        if changes and m in changes:
            annual=changes[m];i=rate(annual,kind);pay=payment(b,i,months-m+1);phases.append({'fromMonth':m,'annualPercent':str(annual),'payment':str(pay)})
        interest=cents(b*i)
        paid=b+interest if m==months or pay>=b+interest else pay
        principal=paid-interest
        end=cents(b-principal)
        rows.append({'month':m,'opening':str(b),'interest':str(interest),'payment':str(paid),'principal':str(principal),'closing':str(end)})
        b=end
    return {'principal':str(cents(p)),'months':months,'rateConvention':kind,'phases':phases,'totalPayments':str(sum(D(x['payment']) for x in rows)),'totalInterest':str(sum(D(x['interest']) for x in rows)),'rows':rows}
def debt(strategy):
    balances=[D(300),D(900)];rs=[rate(8),rate(19)];minimums=[D(25),D(45)];rows=[]
    while any(b>0 for b in balances):
        old=balances[:]; ints=[cents(b*r) for b,r in zip(balances,rs)]; owes=[b+i for b,i in zip(balances,ints)]
        pays=[min(o,m) for o,m in zip(owes,minimums)]; remaining=D(120)-sum(pays)
        order=sorted(range(2),key=lambda k:(-rs[k] if strategy=='highest-rate' else old[k] if old[k]>0 else D('Infinity')))
        for k in order:
            extra=min(remaining,owes[k]-pays[k]); pays[k]+=extra; remaining-=extra
        balances=[cents(o-p) for o,p in zip(owes,pays)]
        rows.append({'month':len(rows)+1,'opening':[str(x) for x in old],'interest':[str(x) for x in ints],'payment':[str(x) for x in pays],'closing':[str(x) for x in balances]})
        assert len(rows)<500
    return {'policy':'Interest at nominal annual/12; contractual minimums25/45 capped at balance plus interest; total120; unused payment rolls to the other loan in the same month. No new borrowing or fees.','months':len(rows),'totalInterest':str(sum(D(i) for x in rows for i in x['interest'])),'totalPayments':str(sum(D(p) for x in rows for p in x['payment'])),'rows':rows}
cases={
'fl2-03-model':schedule(1000,12,12),
'fl2-03-longer':schedule(1000,12,24),
'fl2-03-independent-12':schedule(1800,9,12),
'fl2-03-independent-24':schedule(1800,9,24),
'fl2-04-highest-rate':debt('highest-rate'),
'fl2-04-smallest-balance':debt('smallest-balance'),
'fl2-06-model-fixed':schedule(5000,6,24),
'fl2-06-model-variable':schedule(5000,5,24,changes={13:7}),
'fl2-06-guided-variable':schedule(5000,5,24,changes={13:10}),
'fl2-06-independent-fixed':schedule(8000,6.5,36),
'fl2-06-independent-variable':schedule(8000,5.5,36,changes={13:8.5}),
'fl2-07-model':schedule(120000,6,300,'semiannual'),
'fl2-07-guided':schedule(120000,6,240,'semiannual'),
'fl2-07-independent-20':schedule(180000,5,240,'semiannual'),
'fl2-07-independent-25':schedule(180000,5,300,'semiannual'),
}
out=Path(__file__).with_name('numeric-fixtures.json')
out.write_text(json.dumps({'date':'2026-09-28','rounding':'ROUND_HALF_UP to cents at every interest posting and payment; final payment adjusted. Mortgage long-run schedules assume unchanged rate solely for comparison; actual term outputs stop at60.','cases':cases},indent=2)+'\n')
for name,c in cases.items():
    print(name, json.dumps({k:c[k] for k in ['phases','months','totalPayments','totalInterest'] if k in c}), 'balance60='+c['rows'][59]['closing'] if len(c['rows'])>=60 else '')
