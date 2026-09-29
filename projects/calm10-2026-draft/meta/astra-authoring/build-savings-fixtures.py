"""Author-only deterministic savings scenarios; final rounding only."""
from decimal import Decimal as D, localcontext, ROUND_HALF_UP
from pathlib import Path
import json
P=Path(__file__).parent
def money(x): return str(x.quantize(D('.01'), rounding=ROUND_HALF_UP))
def calc(start, monthly, years, annual_return, annual_fee, inflation):
    with localcontext() as c:
        c.prec=40
        gross=(1+D(annual_return)/100)**(D(1)/12)
        multiplier=gross*(1-D(annual_fee)/1200)
        balance=D(start)
        for _ in range(int(years)*12): balance=balance*multiplier+D(monthly)
        purchasing=balance/((1+D(inflation)/100)**int(years))
        return dict(start=start,monthly=monthly,years=years,annualReturn=annual_return,annualFee=annual_fee,inflation=inflation,nominal=money(balance),purchasingPower=money(purchasing))
cases={
 'fl3-04-model':calc('100','0',1,'1','0','3'),
 'fl3-04-guided-fee':calc('100','0',1,'4','1','3'),
 'fl3-04-no-fee-comparison':calc('100','0',1,'4','0','3'),
 'fl3-04-zero-growth':calc('120','10',1,'0','0','0'),
}
(P/'savings-fixtures.json').write_text(json.dumps({'rounding':'Full decimal precision through all months; round displayed money half-up to cents only. Gross annual effective return converted to monthly; fee deducted monthly after gross return, before end-of-month deposit. Inflation constant annual.', 'cases':cases},indent=2)+'\n')
print(json.dumps(cases,indent=2))
