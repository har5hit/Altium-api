import Foundation

struct StandingRow: Codable {
    let position: Int
    let teamId: Int
    let teamName: String
    let played: Int
    let won: Int
    let draw: Int
    let lost: Int
    let goalsFor: Int
    let goalsAgainst: Int
    let goalDifference: Int
    let points: Int
    let form: String?
}
