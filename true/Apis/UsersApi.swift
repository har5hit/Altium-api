import Foundation

struct GetUsersInput: Codable {
    let page: Int?
    let limit: Int?
}

typealias GetUsersOutput = [User]

struct GetUserByIdInput: Codable {
    let id: Int
}

typealias GetUserByIdOutput = User

struct CreateUserInput: Codable {
    let email: String
    let name: String
}

typealias CreateUserOutput = User

struct DeleteUserInput: Codable {
    let id: Int
}

struct DeleteUserOutput: Codable {
    let message: String
}


final class UsersApi {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

    func GetUsers(_ input: GetUsersInput) async throws -> GetUsersOutput {
        var queryParams: [String: String] = [:]
        if let value = input.page {
            queryParams["page"] = String(describing: value)
        }
        if let value = input.limit {
            queryParams["limit"] = String(describing: value)
        }
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/users/",
            queryParams: queryParams
        )
    }

    func GetUserById(_ input: GetUserByIdInput) async throws -> GetUserByIdOutput {
        var queryParams: [String: String] = [:]
        return try await httpClient.get(
            url: "\(baseUrl)/api/v1/users/\(input.id)",
            queryParams: queryParams
        )
    }
}
