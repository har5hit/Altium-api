CREATE TABLE IF NOT EXISTS leagues (
  id BIGINT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 9999,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  founded INTEGER,
  stadium TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGINT PRIMARY KEY,
  league_id BIGINT NOT NULL REFERENCES leagues(id),
  utc_kickoff TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  minute INTEGER,
  home_team_id BIGINT NOT NULL REFERENCES teams(id),
  home_team_name TEXT NOT NULL,
  away_team_id BIGINT NOT NULL REFERENCES teams(id),
  away_team_name TEXT NOT NULL,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  venue TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id BIGINT PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id),
  league_id BIGINT REFERENCES leagues(id),
  name TEXT NOT NULL,
  short_name TEXT,
  position TEXT NOT NULL,
  jersey_number INTEGER,
  date_of_birth DATE,
  nationality TEXT NOT NULL,
  height_cm INTEGER,
  preferred_foot TEXT,
  photo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS standings_snapshots (
  league_id BIGINT NOT NULL REFERENCES leagues(id),
  season TEXT NOT NULL,
  position INTEGER NOT NULL,
  team_id BIGINT NOT NULL REFERENCES teams(id),
  team_name TEXT NOT NULL,
  played INTEGER NOT NULL,
  won INTEGER NOT NULL,
  draw INTEGER NOT NULL,
  lost INTEGER NOT NULL,
  goals_for INTEGER NOT NULL,
  goals_against INTEGER NOT NULL,
  goal_difference INTEGER NOT NULL,
  points INTEGER NOT NULL,
  form TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (league_id, season, team_id)
);

CREATE INDEX IF NOT EXISTS idx_leagues_active_priority
  ON leagues (is_active, priority, id);

CREATE INDEX IF NOT EXISTS idx_matches_live_kickoff
  ON matches (status, utc_kickoff, id);

CREATE INDEX IF NOT EXISTS idx_matches_team_kickoff
  ON matches (home_team_id, utc_kickoff DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_matches_team_away_kickoff
  ON matches (away_team_id, utc_kickoff DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_matches_league_kickoff
  ON matches (league_id, utc_kickoff DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_players_team
  ON players (team_id, id);

CREATE INDEX IF NOT EXISTS idx_players_league
  ON players (league_id, id);

CREATE INDEX IF NOT EXISTS idx_standings_league_season_position
  ON standings_snapshots (league_id, season, position);

CREATE INDEX IF NOT EXISTS idx_teams_name_lower
  ON teams (lower(name));

CREATE INDEX IF NOT EXISTS idx_leagues_name_lower
  ON leagues (lower(name));

CREATE INDEX IF NOT EXISTS idx_matches_team_names_lower
  ON matches (lower(home_team_name), lower(away_team_name));

CREATE INDEX IF NOT EXISTS idx_players_name_lower
  ON players (lower(name));
