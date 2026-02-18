import Foundation

struct GetTeamByIdInput: Codable {
    let teamId: Int
}

typealias GetTeamByIdOutput = Team

struct GetTeamFixturesInput: Codable {
    let teamId: Int
    let limit: Int?
}

typealias GetTeamFixturesOutput = [TeamFixture]


final class TeamsApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetTeamById(_ input: GetTeamByIdInput) async throws -> GetTeamByIdOutput {
        var queryParams: [String: String] = [:]
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/teams/\(input.teamId)",
            queryParams: queryParams
        )
    }

    func GetTeamFixtures(_ input: GetTeamFixturesInput) async throws -> GetTeamFixturesOutput {
        var queryParams: [String: String] = [:]
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/teams/\(input.teamId)/fixtures",
            queryParams: queryParams
        )
    }
}
