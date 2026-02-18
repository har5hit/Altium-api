import Foundation

struct Team: Codable {
    let id: Int
    let name: String
    let shortName: String
    let country: String
    let logoUrl: String?
    let founded: Int?
    let stadium: String?
}
