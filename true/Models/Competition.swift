import Foundation

struct Competition: Codable {
    let id: Int
    let slug: String
    let name: String
    let country: String
    let priority: Int
    let logoUrl: String?
}
