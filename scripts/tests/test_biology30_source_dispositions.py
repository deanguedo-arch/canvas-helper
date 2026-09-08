import importlib.util
import json
import hashlib
import tempfile
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('bcd_dispositions',Path(__file__).parents[1]/'audit-biology30-source-dispositions.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class SourceDispositionsTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.originals={name:getattr(mod,name) for name in ['ROOT','BASE','PACKET','RELATIONS']}
        self.addCleanup(lambda:[setattr(mod,name,value) for name,value in self.originals.items()])
        mod.ROOT=Path(self.tmp.name);mod.BASE=mod.ROOT/'resources';mod.PACKET=mod.BASE/'intake';mod.RELATIONS=mod.BASE/'relations.json'
        decks=[];plans=[];videos=[];relations={'decks':[],'plans':[]}
        for u in 'BCD':
            blob=u.encode();sha=hashlib.sha256(blob).hexdigest();asset=mod.PACKET/f'{u}.png';asset.parent.mkdir(parents=True,exist_ok=True);asset.write_bytes(blob)
            source={'unit':u,'sourceSha256':sha,'media':[{'part':'ppt/media/image1.png','sha256':sha}]};decks.append(source)
            plan={'unit':u,'sourceSha256':sha,'rows':[{'id':f'{u}-row','cells':['1','Topic','Read']} ]};plans.append(plan)
            rel={'part':'ppt/slides/_rels/slide1.xml.rels','Id':'rId1','Target':f'https://youtu.be/{u}','TargetMode':'External'};media_rel={'part':'ppt/slides/_rels/slide1.xml.rels','Id':'rId2','Target':'../media/image1.png'};relations['decks'].append({'unit':u,'sourceSha256':sha,'relationships':[rel,media_rel]})
            occurrence={'unit':u,'slideId':f'{u}-slide','relationshipId':'rId1'};videos.append({'id':u,'occurrences':[occurrence]})
            folder=mod.BASE/f'units/unit-{u.lower()}'
            self.write(folder/'pilot2-media-dispositions.json',{'unit':u,'teacherDecision':None,'assets':[{'sourceSha256':sha,'packagePart':'ppt/media/image1.png','authoringLocalFile':str(asset.relative_to(mod.ROOT)),'assetSha256':sha,'learnerAsset':None,'rights':'not-cleared-for-learner-reuse','reason':'Preserve as author reference.','relationships':[{**media_rel,'sourcePart':'ppt/slides/slide1.xml','resolvedTarget':'ppt/media/image1.png'}],'directSlideIds':[f'{u}-slide']}]})
            self.write(folder/'pilot2-plan-dispositions.json',{'unit':u,'teacherDecision':None,'rows':[{'rowId':f'{u}-row','sourceCells':plan['rows'][0]['cells'],'sourceSha256':sha,'disposition':'required-topic','reason':'Preserve teacher sequence.'}]})
            self.write(folder/'pilot2-link-dispositions.json',{'unit':u,'teacherDecision':None,'relationships':[{'sourceKind':'decks','sourceSha256':sha,'sourcePart':rel['part'],'relationshipId':'rId1','originalUrl':rel['Target']}],'youtubeCandidates':[{'videoId':u,'sourceOccurrences':[occurrence],'providerFilesDownloaded':False,'learnerSelected':False,'required':False}]})
        for name,data in [('decks',decks),('daily-plans',plans),('videos',videos)]:self.write(mod.PACKET/f'{name}.json',data)
        self.write(mod.RELATIONS,relations)
    def write(self,path,value):
        path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value))
    def mutate(self,name,change):
        path=mod.BASE/f'units/unit-b/pilot2-{name}-dispositions.json';data=json.loads(path.read_text());change(data);self.write(path,data)
    def test_complete_inventory_and_duplicate_relationship_rejection(self):
        self.assertEqual(len(mod.audit()),3)
        self.mutate('link',lambda d:d['relationships'].append(d['relationships'][0]))
        with self.assertRaisesRegex(ValueError,'identity inventory'):mod.audit()
    def test_source_fidelity_and_reference_only_boundary(self):
        self.mutate('plan',lambda d:d['rows'][0]['sourceCells'].append('invented source instruction'))
        with self.assertRaisesRegex(ValueError,'source fidelity'):mod.audit()
    def test_unreviewed_video_cannot_be_selected(self):
        self.mutate('link',lambda d:d['youtubeCandidates'][0].update(learnerSelected=True))
        with self.assertRaisesRegex(ValueError,'silently enabled'):mod.audit()
    def test_media_must_match_original_bytes(self):
        (mod.PACKET/'B.png').write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError,'bytes/path'):mod.audit()
    def test_media_relationships_cannot_drop_original_identity(self):
        self.mutate('media',lambda d:d['assets'][0]['relationships'][0].update(Id='invented'))
        with self.assertRaisesRegex(ValueError,'package relationships'):mod.audit()

if __name__=='__main__':unittest.main()
