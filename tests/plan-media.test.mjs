import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaSizeLimit, validMediaPath, hasMediaSignature, parseByteRange, mediaUploadSchema } from '../src/lib/media-policy.ts';
import { canReadPlanMedia, canReadUpload } from '../src/lib/upload-access.ts';

const uuid='384661ae-f60b-4cec-9320-318aef051244';
test('coaching uploads have separate image and video limits and exclude executable/document formats', () => {
  assert.equal(mediaSizeLimit('image/jpeg'),10*1024*1024);
  assert.equal(mediaSizeLimit('video/mp4'),100*1024*1024);
  for(const type of ['text/html','image/svg+xml','application/pdf','__proto__','toString']) assert.equal(mediaSizeLimit(type),0);
});
test('upload grants cannot target a different coach, plan, directory or file type', () => {
  const path=`coaching/workout/plan-a/coach-a/${uuid}.mp4`;
  assert.equal(validMediaPath(path,'workout','plan-a','coach-a','video/mp4'),true);
  for(const args of [['nutrition','plan-a','coach-a','video/mp4'],['workout','plan-b','coach-a','video/mp4'],['workout','plan-a','coach-b','video/mp4'],['workout','plan-a','coach-a','image/png']]) assert.equal(validMediaPath(path,...args),false);
  assert.equal(validMediaPath(path.replace(uuid,'../file'),'workout','plan-a','coach-a','video/mp4'),false);
  assert.equal(validMediaPath(path.replace(uuid,'-'.repeat(36)),'workout','plan-a','coach-a','video/mp4'),false);
});
test('uploaded content must match an allowed media signature', () => {
  const bytes=(s)=>new TextEncoder().encode(s);
  assert.equal(hasMediaSignature(Uint8Array.from([255,216,255,224]),'image/jpeg'),true);
  assert.equal(hasMediaSignature(Uint8Array.from([137,80,78,71,13,10,26,10]),'image/png'),true);
  assert.equal(hasMediaSignature(bytes('RIFF0000WEBP'),'image/webp'),true);
  assert.equal(hasMediaSignature(bytes('<html>'), 'image/jpeg'),false);
  assert.equal(hasMediaSignature(new Uint8Array(), 'image/png'),false);
  assert.equal(hasMediaSignature(bytes('0000ftypisom'),'video/mp4'),true);
  assert.equal(hasMediaSignature(bytes('0000ftypqt  '),'video/quicktime'),true);
  assert.equal(hasMediaSignature(Uint8Array.from([26,69,223,163]),'video/webm'),true);
  assert.equal(hasMediaSignature(bytes('<html>'),'video/mp4'),false);
});
test('range parsing supports phone video probes, seeking, and suffix requests', () => {
  assert.equal(parseByteRange(null,1000),null);
  assert.deepEqual(parseByteRange('bytes=0-1',1000),{start:0,end:1});
  assert.deepEqual(parseByteRange('bytes=500-',1000),{start:500,end:999});
  assert.deepEqual(parseByteRange('bytes=-100',1000),{start:900,end:999});
  assert.deepEqual(parseByteRange('bytes=0-2000',1000),{start:0,end:999});
  assert.deepEqual(parseByteRange('bytes=-2000',1000),{start:0,end:999});
});
test('invalid or unsatisfiable ranges fail without silently serving the entire video', () => {
  for(const value of ['bytes=','bytes=-0','bytes=1000-','bytes=900-500','bytes=0-1,4-8','bytes=NaN-','items=0-1','bytes=99999999999999999999-']) assert.equal(parseByteRange(value,1000),false);
});
test('only the assigned trainee can read active plan attachments; coaches can manage inactive plans', () => {
  const plan={userId:'trainee-a',active:true};
  assert.equal(canReadPlanMedia(plan,{id:'trainee-a',role:'CLIENT'}),true);
  assert.equal(canReadPlanMedia(plan,{id:'trainee-b',role:'CLIENT'}),false);
  assert.equal(canReadPlanMedia({...plan,active:false},{id:'trainee-a',role:'CLIENT'}),false);
  assert.equal(canReadPlanMedia({...plan,active:false},{id:'coach',role:'COACH'}),true);
  assert.equal(canReadPlanMedia(plan,{id:'',role:'COACH'}),false);
  assert.equal(canReadPlanMedia(null,{id:'coach',role:'COACH'}),false);
  assert.equal(canReadPlanMedia(plan,null),false);
});
test('private coaching files are accessible through verified plan assignment without becoming public', () => {
  const file={ownerId:'coach',visibility:'PRIVATE'};
  const plan={userId:'trainee-a',active:true};
  for(const viewer of [{id:'trainee-a',role:'CLIENT'},{id:'trainee-b',role:'CLIENT'},null]) {
    assert.equal(canReadUpload(file,viewer,canReadPlanMedia(plan,viewer)),viewer?.id==='trainee-a');
  }
  assert.equal(canReadUpload(file,{id:'',role:'CLIENT'},true),false);
});
test('client payload cannot override the server-assigned owner or introduce unsupported kinds', () => {
  const data={kind:'nutrition',planId:'plan',name:'Meal example.jpg',contentType:'image/jpeg',ownerId:'another-coach'};
  assert.equal(Object.hasOwn(mediaUploadSchema.parse(data),'ownerId'),false);
  assert.equal(mediaUploadSchema.safeParse({...data,kind:'public'}).success,false);
  assert.equal(mediaUploadSchema.safeParse({...data,contentType:'image/svg+xml'}).success,false);
});
