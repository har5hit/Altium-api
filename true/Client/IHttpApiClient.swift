import Foundation

protocol IHttpApiClient {
    func get<T: Decodable>(
        url: String,
        queryParams: [String: String],
        headers: [String: String]
    ) async throws -> T
}
