from pathlib import Path
import re,base64
ROOT=Path(__file__).resolve().parents[1]
def assemble():
 w=ROOT/'workspace';text=(w/'index.html').read_text()
 text=re.sub(r'<link[^>]*href="(?:\./)?styles.css"[^>]*>',lambda m:'<style>'+ (w/'styles.css').read_text()+'</style>',text)
 text=re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>',lambda m:'<script>'+ (w/m[1]).read_text().replace('</script','<\\/script')+'</script>',text)
 text=text.replace('src="assets/nextstep.png"','src="data:image/png;base64,'+base64.b64encode((w/'assets/nextstep.png').read_bytes()).decode()+'"')
 return text
if __name__=='__main__':
 out=ROOT/'Math10C_Chapter3_Reconciled.html';out.write_text(assemble());print(out)
