import Foundation

struct GetCompetitionsInput: Codable {
    let limit: Int?
}

typealias GetCompetitionsOutput = [Competition]


final class CompetitionsApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetCompetitions(_ input: GetCompetitionsInput) async throws -> GetCompetitionsOutput {
        var queryParams: [String: String] = [:]
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/competitions",
            queryParams: queryParams
        )
    }
}
