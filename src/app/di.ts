import type { FastifyInstance } from 'fastify';
import { ServiceUnavailableError } from '@/app/errors.js';
import CreateUser from '@/features/users/usecases/CreateUser.js';
import DeleteUser from '@/features/users/usecases/DeleteUser.js';
import GetUserById from '@/features/users/usecases/GetUserById.js';
import GetUsers from '@/features/users/usecases/GetUsers.js';
import UserRepository from '@/features/users/repositories/userRepository.js';
import GetHomeFeed from '@/features/home-feed/usecases/GetHomeFeed.js';
import HomeFeedRepository from '@/features/home-feed/repositories/homeFeedRepository.js';
import GetLeagues from '@/features/leagues/usecases/GetLeagues.js';
import LeaguesRepository from '@/features/leagues/repositories/leaguesRepository.js';
import GetStandings from '@/features/standings/usecases/GetStandings.js';
import StandingsRepository from '@/features/standings/repositories/standingsRepository.js';
import GetLiveMatches from '@/features/matches/usecases/GetLiveMatches.js';
import GetMatchById from '@/features/matches/usecases/GetMatchById.js';
import MatchesRepository from '@/features/matches/repositories/matchesRepository.js';
import GetTeamById from '@/features/teams/usecases/GetTeamById.js';
import GetTeamFixtures from '@/features/teams/usecases/GetTeamFixtures.js';
import TeamsRepository from '@/features/teams/repositories/teamsRepository.js';
import SearchFootball from '@/features/search/usecases/SearchFootball.js';
import SearchRepository from '@/features/search/repositories/searchRepository.js';
import type { ReadCache } from '@/support/cache.js';

const DB_UNAVAILABLE_MESSAGE = 'Data service unavailable: DATABASE_URL not configured';

function getPg(fastify: FastifyInstance): FastifyInstance['pg'] | null {
  try {
    const pg = (fastify as unknown as { pg?: FastifyInstance['pg'] }).pg;
    return pg ?? null;
  } catch {
    return null;
  }
}

function createReadCache(fastify: FastifyInstance): ReadCache | null {
  const redis = (fastify as unknown as {
    redis?: {
      get: (key: string) => Promise<string | null>;
      setex?: (key: string, ttl: number, value: string) => Promise<unknown>;
      set?: (key: string, value: string, mode: string, ttl: number) => Promise<unknown>;
    };
  }).redis;

  if (!redis) return null;

  return {
    get: async (key: string) => redis.get(key),
    set: async (key: string, ttlSeconds: number, value: string) => {
      if (redis.setex) {
        await redis.setex(key, ttlSeconds, value);
        return;
      }

      if (redis.set) {
        await redis.set(key, value, 'EX', ttlSeconds);
      }
    },
  };
}

function createServiceUnavailableProxy<T extends object>(message: string): T {
  return new Proxy({} as T, {
    get: () => {
      return () => {
        throw new ServiceUnavailableError(message);
      };
    },
  });
}

function createRepositorySingletons(fastify: FastifyInstance) {
  const pg = getPg(fastify);

  return {
    user: pg ? new UserRepository(pg) : createServiceUnavailableProxy<UserRepository>(DB_UNAVAILABLE_MESSAGE),
    homeFeed: pg
      ? new HomeFeedRepository(pg)
      : createServiceUnavailableProxy<HomeFeedRepository>(DB_UNAVAILABLE_MESSAGE),
    leagues: pg
      ? new LeaguesRepository(pg)
      : createServiceUnavailableProxy<LeaguesRepository>(DB_UNAVAILABLE_MESSAGE),
    standings: pg
      ? new StandingsRepository(pg)
      : createServiceUnavailableProxy<StandingsRepository>(DB_UNAVAILABLE_MESSAGE),
    matches: pg
      ? new MatchesRepository(pg)
      : createServiceUnavailableProxy<MatchesRepository>(DB_UNAVAILABLE_MESSAGE),
    teams: pg ? new TeamsRepository(pg) : createServiceUnavailableProxy<TeamsRepository>(DB_UNAVAILABLE_MESSAGE),
    search: pg
      ? new SearchRepository(pg)
      : createServiceUnavailableProxy<SearchRepository>(DB_UNAVAILABLE_MESSAGE),
  };
}

function createUsecaseFactory(
  repositories: AppDi['repositories'],
  readCache: ReadCache | null
): AppDi['usecases'] {
  return {
    createUser: () => new CreateUser(repositories.user),
    getUsers: () => new GetUsers(repositories.user),
    getUserById: () => new GetUserById(repositories.user),
    deleteUser: () => new DeleteUser(repositories.user),

    getHomeFeed: () => new GetHomeFeed(repositories.homeFeed, readCache),
    getLeagues: () => new GetLeagues(repositories.leagues, readCache),
    getStandings: () => new GetStandings(repositories.standings, readCache),
    getLiveMatches: () => new GetLiveMatches(repositories.matches, readCache),
    getMatchById: () => new GetMatchById(repositories.matches, readCache),
    getTeamById: () => new GetTeamById(repositories.teams, readCache),
    getTeamFixtures: () => new GetTeamFixtures(repositories.teams, readCache),
    searchFootball: () => new SearchFootball(repositories.search, readCache),
  };
}

export interface AppDi {
  repositories: {
    user: UserRepository;
    homeFeed: HomeFeedRepository;
    leagues: LeaguesRepository;
    standings: StandingsRepository;
    matches: MatchesRepository;
    teams: TeamsRepository;
    search: SearchRepository;
  };
  usecases: {
    createUser: () => CreateUser;
    getUsers: () => GetUsers;
    getUserById: () => GetUserById;
    deleteUser: () => DeleteUser;
    getHomeFeed: () => GetHomeFeed;
    getLeagues: () => GetLeagues;
    getStandings: () => GetStandings;
    getLiveMatches: () => GetLiveMatches;
    getMatchById: () => GetMatchById;
    getTeamById: () => GetTeamById;
    getTeamFixtures: () => GetTeamFixtures;
    searchFootball: () => SearchFootball;
  };
}

export function setupDi(fastify: FastifyInstance): AppDi {
  const repositories = createRepositorySingletons(fastify);
  const readCache = createReadCache(fastify);
  const di: AppDi = {
    repositories,
    usecases: createUsecaseFactory(repositories, readCache),
  };

  fastify.decorate('di', di);
  return di;
}
