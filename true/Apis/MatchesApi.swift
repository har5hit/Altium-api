import Foundation

struct GetLiveMatchesInput: Codable {
    let limit: Int?
}

typealias GetLiveMatchesOutput = [Match]

struct GetMatchByIdInput: Codable {
    let matchId: Int
}

typealias GetMatchByIdOutput = Match


final class MatchesApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetLiveMatches(_ input: GetLiveMatchesInput) async throws -> GetLiveMatchesOutput {
        var queryParams: [String: String] = [:]
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/matches/live",
            queryParams: queryParams
        )
    }

    func GetMatchById(_ input: GetMatchByIdInput) async throws -> GetMatchByIdOutput {
        var queryParams: [String: String] = [:]
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/matches/\(input.matchId)",
            queryParams: queryParams
        )
    }
}
