import Foundation

struct TeamFixture: Codable {
    let id: Int
    let competitionId: Int
    let utcKickoff: String
    let status: MatchStatus
    let minute: Int?
    let homeTeamId: Int
    let homeTeamName: String
    let awayTeamId: Int
    let awayTeamName: String
    let homeScore: Int
    let awayScore: Int
    let venue: String?
}
