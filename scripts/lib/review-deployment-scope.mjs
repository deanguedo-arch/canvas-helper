const science24Ids=new Set(['science24-unit-a','science24-unit-b','science24-unit-c','science24-unit-d']);

// Refreshing a shared review site never authorizes unrelated local course work.
export function currentReviewRefreshAuthorized(courseId,{refreshBiology=false,refreshScience24=false}={}){
 return refreshScience24&&science24Ids.has(courseId)||refreshBiology&&/^biology30-/.test(courseId);
}
