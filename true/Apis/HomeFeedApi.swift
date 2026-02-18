import Foundation

struct GetHomeFeedInput: Codable {
    let limit: Int?
}

typealias GetHomeFeedOutput = [Match]


final class HomeFeedApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetHomeFeed(_ input: GetHomeFeedInput) async throws -> GetHomeFeedOutput {
        var queryParams: [String: String] = [:]
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/football/",
            queryParams: queryParams
        )
    }
}
