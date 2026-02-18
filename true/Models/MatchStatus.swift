import Foundation

enum MatchStatus: String, Codable {
    case scheduled = "scheduled"
    case live = "live"
    case finished = "finished"
    case postponed = "postponed"
    case cancelled = "cancelled"
}
