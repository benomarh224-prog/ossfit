import test from 'node:test';
import assert from 'node:assert/strict';
import { localizeMarketing, localizeSiteContent } from '../src/lib/marketing-copy.ts';

const item = { id: 'service-one', slug: 'online-personal-coaching', title: 'Personal Training', shortDesc: 'A clear workout plan built around your goals, level and equipment.', features: ['Your own training plan','Home or gym workouts','Progress check-ins'] };
test('default services have Arabic and French copy without losing their ids', () => {
  const arabic = localizeMarketing('services', item.slug, item, 'ar');
  assert.equal(arabic.id, item.id);
  assert.equal(arabic.title, 'تدريب شخصي');
  assert.equal(localizeMarketing('services', item.slug, item, 'fr').title, 'Entraînement personnel');
});
test('coach-edited copy is preserved instead of being replaced by a stale default translation', () => {
  const custom = { ...item, shortDesc: 'A new coaching service' };
  assert.equal(localizeMarketing('services', item.slug, custom, 'fr'), custom);
});
test('custom site headings are preserved while default coach names can be localized', () => {
  const result = localizeSiteContent({ heroTitle: 'A custom title', coachName: 'Oussama', coachCity: 'Morocco' }, 'ar');
  assert.equal(result.heroTitle, 'A custom title');
  assert.equal(result.coachName, 'أسامة');
  assert.equal(result.coachCity, 'المغرب');
});
