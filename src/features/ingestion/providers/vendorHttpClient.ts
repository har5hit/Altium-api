import type {
  VendorCompetitionDbModel,
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

  getCompetitions(): Promise<VendorCompetitionDbModel[]> {
    return this.fetchJson<VendorCompetitionDbModel[]>('/competitions');
  }

  getTeams(): Promise<VendorTeamDbModel[]> {
    return this.fetchJson<VendorTeamDbModel[]>('/teams');
  }

  getMatches(): Promise<VendorMatchDbModel[]> {
    return this.fetchJson<VendorMatchDbModel[]>('/matches');
  }

  getStandings(competitionId: number, season: string): Promise<VendorStandingsRowDbModel[]> {
    return this.fetchJson<VendorStandingsRowDbModel[]>(
      `/competitions/${competitionId}/standings?season=${encodeURIComponent(season)}`
    );
  }
}
