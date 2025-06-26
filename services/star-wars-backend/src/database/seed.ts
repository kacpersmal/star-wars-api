import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'star_wars_user',
  password: process.env.DB_PASSWORD || 'star_wars_password',
  database: process.env.DB_DATABASE || 'star_wars_db',
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Seeding Star Wars database...');

  try {
    // Seed species
    const humanSpecies = await db
      .insert(schema.species)
      .values({
        name: 'Human',
      })
      .returning();

    const droidSpecies = await db
      .insert(schema.species)
      .values({
        name: 'Droid',
      })
      .returning();

    const wookieeSpecies = await db
      .insert(schema.species)
      .values({
        name: 'Wookiee',
      })
      .returning();

    // Seed episodes
    const episode4 = await db
      .insert(schema.episodes)
      .values({
        name: 'A New Hope',
        date: new Date('1977-05-25'),
      })
      .returning();

    const episode5 = await db
      .insert(schema.episodes)
      .values({
        name: 'The Empire Strikes Back',
        date: new Date('1980-05-17'),
      })
      .returning();

    const episode6 = await db
      .insert(schema.episodes)
      .values({
        name: 'Return of the Jedi',
        date: new Date('1983-05-25'),
      })
      .returning();

    // Seed characters
    const luke = await db
      .insert(schema.characters)
      .values({
        name: 'Luke Skywalker',
        speciesId: humanSpecies[0].id,
      })
      .returning();

    const leia = await db
      .insert(schema.characters)
      .values({
        name: 'Princess Leia',
        speciesId: humanSpecies[0].id,
      })
      .returning();

    const hanSolo = await db
      .insert(schema.characters)
      .values({
        name: 'Han Solo',
        speciesId: humanSpecies[0].id,
      })
      .returning();

    const chewbacca = await db
      .insert(schema.characters)
      .values({
        name: 'Chewbacca',
        speciesId: wookieeSpecies[0].id,
      })
      .returning();

    const c3po = await db
      .insert(schema.characters)
      .values({
        name: 'C-3PO',
        speciesId: droidSpecies[0].id,
      })
      .returning();

    const r2d2 = await db
      .insert(schema.characters)
      .values({
        name: 'R2-D2',
        speciesId: droidSpecies[0].id,
      })
      .returning();

    // Link characters to episodes (many-to-many relationships)
    const characterEpisodeData = [
      // Episode 4 characters
      { characterId: luke[0].id, episodeId: episode4[0].id },
      { characterId: leia[0].id, episodeId: episode4[0].id },
      { characterId: hanSolo[0].id, episodeId: episode4[0].id },
      { characterId: chewbacca[0].id, episodeId: episode4[0].id },
      { characterId: c3po[0].id, episodeId: episode4[0].id },
      { characterId: r2d2[0].id, episodeId: episode4[0].id },

      // Episode 5 characters
      { characterId: luke[0].id, episodeId: episode5[0].id },
      { characterId: leia[0].id, episodeId: episode5[0].id },
      { characterId: hanSolo[0].id, episodeId: episode5[0].id },
      { characterId: chewbacca[0].id, episodeId: episode5[0].id },
      { characterId: c3po[0].id, episodeId: episode5[0].id },
      { characterId: r2d2[0].id, episodeId: episode5[0].id },

      // Episode 6 characters
      { characterId: luke[0].id, episodeId: episode6[0].id },
      { characterId: leia[0].id, episodeId: episode6[0].id },
      { characterId: hanSolo[0].id, episodeId: episode6[0].id },
      { characterId: chewbacca[0].id, episodeId: episode6[0].id },
      { characterId: c3po[0].id, episodeId: episode6[0].id },
      { characterId: r2d2[0].id, episodeId: episode6[0].id },
    ];

    await db.insert(schema.characterEpisodes).values(characterEpisodeData);

    console.log('✅ Star Wars database seeded successfully!');
    console.log(
      `📊 Created ${humanSpecies.length + droidSpecies.length + wookieeSpecies.length} species`,
    );
    console.log(
      `🎬 Created ${episode4.length + episode5.length + episode6.length} episodes`,
    );
    console.log(
      `👥 Created ${luke.length + leia.length + hanSolo.length + chewbacca.length + c3po.length + r2d2.length} characters`,
    );
    console.log(
      `🔗 Created ${characterEpisodeData.length} character-episode relationships`,
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
});
