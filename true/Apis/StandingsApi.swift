import Foundation

struct GetStandingsInput: Codable {
    let competitionId: Int
    let season: String
}

typealias GetStandingsOutput = [StandingRow]


final class StandingsApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetStandings(_ input: GetStandingsInput) async throws -> GetStandingsOutput {
        var queryParams: [String: String] = [:]
        queryParams["season"] = String(describing: input.season)
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/competitions/\(input.competitionId)/standings",
            queryParams: queryParams
        )
    }
}
