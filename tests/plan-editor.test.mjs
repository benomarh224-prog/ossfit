import test from 'node:test';
import assert from 'node:assert/strict';
import { workoutEditSchema, nutritionEditSchema, editWorkoutPlan, editNutritionPlan } from '../src/lib/plan-editor.ts';

const timestamp='2026-10-28T13:00:00.000Z';
const workout={title:'Updated training',goal:null,summary:null,active:true,days:[{name:'Day 1',exercises:[{name:'Squat',sets:'4',reps:'8'}]}],expectedUpdatedAt:timestamp};
const nutrition={title:'Updated meals',dailyCalories:null,proteinG:0,carbsG:200,fatsG:60,waterCupsGoal:8,notes:null,active:true,meals:[{name:'Lunch',suggestion:'Meal example'}],expectedUpdatedAt:timestamp};

function fixture(kind,{missing=false,stale=false,race=false,clientMissing=false}={}) {
  const calls=[];
  const plans=[
    {id:'current',userId:'trainee-a',updatedAt:new Date(stale?'2026-10-28T13:01:00.000Z':timestamp),active:false,mediaIds:['photo','video'],history:['completed workout']},
    {id:'previous',userId:'trainee-a',active:true},
    {id:'other-trainee',userId:'trainee-b',active:true},
  ];
  const model={
    findUnique:async()=>missing?null:plans[0],
    updateMany:async({where,data})=>{
      calls.push({type:'update',where,data});
      if(race&&where.id==='current')return {count:0};
      const rows=plans.filter(p=>(!where.userId||p.userId===where.userId)&&(!where.updatedAt||p.updatedAt?.getTime()===where.updatedAt.getTime())&&(where.active===undefined||p.active===where.active)&&(!where.id||(typeof where.id==='string'?p.id===where.id:p.id!==where.id.not)));
      for(const p of rows)Object.assign(p,data);
      return {count:rows.length};
    },
    findUniqueOrThrow:async()=>plans[0],
  };
  const tx={
    [`${kind}Plan`]:model,
    $queryRaw:async(...args)=>{calls.push({type:'lock',args});return clientMissing?[]:[{id:'trainee-a'}];},
    notification:{create:async(data)=>calls.push({type:'notification',...data})},
  };
  return {tx,calls,plans};
}

for(const [kind,schema,edit,input] of [['workout',workoutEditSchema,editWorkoutPlan,workout],['nutrition',nutritionEditSchema,editNutritionPlan,nutrition]]){
  test(`${kind} edits preserve plan identity, attachments and history while updating content`,async()=>{
    const f=fixture(kind);const saved=await edit(f.tx,'current',schema.parse(input));
    assert.equal(saved.id,'current');assert.equal(saved.userId,'trainee-a');
    assert.deepEqual(saved.mediaIds,['photo','video']);assert.deepEqual(saved.history,['completed workout']);
    assert.equal(saved.title,input.title);assert.equal(saved.active,true);
    assert.equal(f.plans[1].active,false);assert.equal(f.plans[2].active,true);
    const write=f.calls.find(c=>c.type==='update');
    assert.deepEqual(Object.keys(write.data).sort(),kind==='workout'?['active','daysJson','goal','summary','title']:['active','carbsG','dailyCalories','fatsG','mealsJson','notes','proteinG','title','waterCupsGoal']);
    assert.equal(f.calls[0].type,'lock');
    assert.equal(f.calls.find(c=>c.type==='notification').data.userId,'trainee-a');
  });
  test(`${kind} inactive edits leave the existing active plan alone`,async()=>{
    const f=fixture(kind);await edit(f.tx,'current',schema.parse({...input,active:false}));
    assert.equal(f.plans[0].active,false);assert.equal(f.plans[1].active,true);
    assert.equal(f.calls.filter(c=>c.type==='update').length,1);
  });
  test(`${kind} rejects stale versions, concurrent changes and missing clients without deactivating another plan`,async()=>{
    for(const [options,status] of [[{missing:true},404],[{stale:true},409],[{race:true},409],[{clientMissing:true},400]]){
      const f=fixture(kind,options);
      await assert.rejects(()=>edit(f.tx,'current',schema.parse(input)),e=>e.status===status);
      assert.equal(f.plans[1].active,true);
      assert.equal(f.calls.some(c=>c.type==='notification'),false);
    }
  });
}

test('editing cannot silently reassign the trainee, replace attachment relations, or omit the version',()=>{
  for(const [schema,input] of [[workoutEditSchema,workout],[nutritionEditSchema,nutrition]]){
    assert.equal(schema.safeParse({...input,userId:'different-trainee'}).success,false);
    assert.equal(schema.safeParse({...input,media:[]}).success,false);
    const {expectedUpdatedAt,...unversioned}=input;
    assert.equal(schema.safeParse(unversioned).success,false);
  }
});
test('nutrition editing can clear optional targets without treating zero as an empty field',async()=>{
  const f=fixture('nutrition');const saved=await editNutritionPlan(f.tx,'current',nutritionEditSchema.parse(nutrition));
  assert.equal(saved.dailyCalories,null);assert.equal(saved.proteinG,0);assert.equal(saved.notes,null);
  assert.equal(nutritionEditSchema.safeParse({...nutrition,proteinG:-1}).success,false);
  assert.equal(nutritionEditSchema.safeParse({...nutrition,waterCupsGoal:0}).success,false);
});
test('plan editors reject malformed exercises and meals while accepting empty draft lists',()=>{
  assert.equal(workoutEditSchema.safeParse({...workout,days:[{name:'Day',exercises:[{name:''}]}]}).success,false);
  assert.equal(nutritionEditSchema.safeParse({...nutrition,meals:[{name:''}]}).success,false);
  assert.equal(workoutEditSchema.safeParse({...workout,days:[]}).success,true);
  assert.equal(nutritionEditSchema.safeParse({...nutrition,meals:[]}).success,true);
});
