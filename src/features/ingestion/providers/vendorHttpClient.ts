import type {
  VendorLeagueDbModel,
  VendorMatchDbModel,
  VendorStandingsRowDbModel,
  VendorTeamDbModel,
} from '@/features/ingestion/repositories/footballIngestDbModel.js';

export default class VendorHttpClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'content-type': 'application/json',
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Vendor request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  getLeagues(): Promise<VendorLeagueDbModel[]> {
    return this.fetchJson<VendorLeagueDbModel[]>('/leagues');
  }

  getTeams(): Promise<VendorTeamDbModel[]> {
    return this.fetchJson<VendorTeamDbModel[]>('/teams');
  }

  getMatches(): Promise<VendorMatchDbModel[]> {
    return this.fetchJson<VendorMatchDbModel[]>('/matches');
  }

  getStandings(leagueId: number, season: string): Promise<VendorStandingsRowDbModel[]> {
    return this.fetchJson<VendorStandingsRowDbModel[]>(
      `/leagues/${leagueId}/standings?season=${encodeURIComponent(season)}`
    );
  }
}
