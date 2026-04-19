import { getAllLegislation } from './src/lib/api';

try {
  const leg = getAllLegislation();
  console.log(`Success! Found ${leg.length} legislation entries.`);
  if (leg.length > 0) {
    console.log(`Latest: ${leg[0].frontmatter.title}`);
  }
} catch (e) {
  console.error('Failed to read wiki data:', e);
}
