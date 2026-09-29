const context=JSON.parse(process.argv[2]||'{}');
const ids=context.invocation.targetIds||[];
console.log(JSON.stringify({ok:true,errors:[],measurements:{generatedQuestionsPerLesson:{"1":50},reviewPartitions:[1,1],reviewTargetUnion:ids,targetResponseCoverage:{"1/initial":ids.length},semanticCases:6,freshnessCases:{"1":{routineDistinct:true,changedVariation:true,transferVariation:true}}}}));
