import Foundation

struct SearchResult: Codable {
    let type: JSONValue
    let id: Int
    let title: String
    let subtitle: String?
    let meta: String?
}
