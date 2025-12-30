// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_tiresome_ozymandias.sql';
import m0001 from './0001_condemned_agent_brand.sql';
import m0002 from './0002_equal_morg.sql';
import m0003 from './0003_round_wendigo.sql';
import m0004 from './0004_fix_missing_columns.sql';
import m0005 from './0005_add_ingredients_table.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005

    }
  }
  