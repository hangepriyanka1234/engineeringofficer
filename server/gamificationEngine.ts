import { LeaderboardRankEntry, StudentBadgeDef } from "../src/types";

export class ServerGamificationEngine {
  private static mockLeaderboard: LeaderboardRankEntry[] = [
    {
      rank: 1,
      studentName: "Aditya Patil",
      studentEmailMasked: "aditya***@gmail.com",
      isCurrentUser: false,
      points: 8420,
      testsCompleted: 42,
      accuracyPercent: 91.4,
      streakDays: 38,
      avatarSeed: "aditya",
      tier: "Ultimate All-In-One",
    },
    {
      rank: 2,
      studentName: "Snehal Deshmukh",
      studentEmailMasked: "snehal***@yahoo.com",
      isCurrentUser: false,
      points: 7950,
      testsCompleted: 39,
      accuracyPercent: 88.6,
      streakDays: 29,
      avatarSeed: "snehal",
      tier: "Full Test Series",
    },
    {
      rank: 3,
      studentName: "Rohan Kulkarni",
      studentEmailMasked: "rohan***@outlook.com",
      isCurrentUser: false,
      points: 7680,
      testsCompleted: 36,
      accuracyPercent: 86.2,
      streakDays: 24,
      avatarSeed: "rohan",
      tier: "Practice Q-Bank Pro",
    },
    {
      rank: 4,
      studentName: "Pooja Jadhav",
      studentEmailMasked: "pooja***@gmail.com",
      isCurrentUser: false,
      points: 7240,
      testsCompleted: 33,
      accuracyPercent: 84.8,
      streakDays: 19,
      avatarSeed: "pooja",
      tier: "Ultimate All-In-One",
    },
    {
      rank: 5,
      studentName: "Vikram Shinde",
      studentEmailMasked: "vikram***@gmail.com",
      isCurrentUser: false,
      points: 6980,
      testsCompleted: 31,
      accuracyPercent: 83.1,
      streakDays: 16,
      avatarSeed: "vikram",
      tier: "Full Test Series",
    },
  ];

  private static badgesList: StudentBadgeDef[] = [
    {
      id: "b-01",
      title: "IS Code Scholar",
      category: "is_codes",
      description: "Answered over 100 questions referencing IS 456, IS 800, and IRC codes with >85% accuracy.",
      iconName: "BookMarked",
      progressPercent: 85,
      isUnlocked: true,
      unlockedAt: "2026-03-05",
    },
    {
      id: "b-02",
      title: "Concrete Technologist",
      category: "site_pro",
      description: "Mastered Slump cone, Cube compressive testing, and mix design numericals.",
      iconName: "HardHat",
      progressPercent: 100,
      isUnlocked: true,
      unlockedAt: "2026-03-10",
    },
    {
      id: "b-03",
      title: "Consistency Titan (14-Day Streak)",
      category: "consistency",
      description: "Solved daily capsule or practice questions for 14 consecutive days without interruption.",
      iconName: "Flame",
      progressPercent: 92,
      isUnlocked: true,
      unlockedAt: "2026-03-12",
    },
    {
      id: "b-04",
      title: "Formula Virtuoso",
      category: "accuracy",
      description: "Successfully solved 50+ step-by-step formula calculations across SOM, RCC, and Geotech.",
      iconName: "Calculator",
      progressPercent: 64,
      isUnlocked: false,
    },
    {
      id: "b-05",
      title: "CBT Simulation Ace",
      category: "milestone",
      description: "Scored above 80% in 5 Full-Length CBT Mock Tests under timed exam conditions.",
      iconName: "Trophy",
      progressPercent: 40,
      isUnlocked: false,
    },
  ];

  static getLeaderboard(currentUserEmail: string = "", currentUserName: string = "Current Aspirant"): LeaderboardRankEntry[] {
    const list = [...this.mockLeaderboard];
    // Add or merge current user at rank 6
    const userEntry: LeaderboardRankEntry = {
      rank: 6,
      studentName: currentUserName,
      studentEmailMasked: currentUserEmail ? currentUserEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "you***@student.com",
      isCurrentUser: true,
      points: 5430,
      testsCompleted: 24,
      accuracyPercent: 79.5,
      streakDays: 11,
      avatarSeed: "current-user",
      tier: "Pro Aspirant",
    };
    list.push(userEntry);
    return list;
  }

  static getBadges(): StudentBadgeDef[] {
    return [...this.badgesList];
  }
}
