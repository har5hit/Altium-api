import Foundation

struct SearchFootballInput: Codable {
    let q: String
    let limit: Int?
}

typealias SearchFootballOutput = [SearchResult]


final class SearchApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func SearchFootball(_ input: SearchFootballInput) async throws -> SearchFootballOutput {
        var queryParams: [String: String] = [:]
        queryParams["q"] = String(describing: input.q)
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/search",
            queryParams: queryParams
        )
    }
}
