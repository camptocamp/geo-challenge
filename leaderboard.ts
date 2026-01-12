import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  type Firestore,
} from "firebase/firestore/lite";
import { gameOver, gameScore } from "./game-state";
import type { UserInfo } from "./userinfo";
import type { GameState } from "./game-state";


export interface ScoreEntry {
  rank: number;
  username: string;
  score: number;
}

export type SavePolicy = (leaderboard: Leaderboard, userInfo: UserInfo, gameState: GameState) => Promise<boolean>;

export class Leaderboard {
  // FIXME: configurable via class options
  private static firebaseConfig = {
    authDomain: "switzerland-guess.firebaseapp.com",
    projectId: "switzerland-guess",
    storageBucket: "switzerland-guess.appspot.com",
  };
  private savePolicy: SavePolicy;
  public readonly collection: string;
  public readonly database: Firestore;

  constructor(document: string, savePolicy: SavePolicy) {
    this.savePolicy = savePolicy;

    this.collection = document;
    const app = initializeApp(Leaderboard.firebaseConfig);
    this.database = getFirestore(app);
  }

  async allowedToSubmitScore(userInfo: UserInfo, gameState: GameState): Promise<boolean> {
    if (!userInfo.username || !gameOver(gameState)) {
      return false;
    }
    return this.savePolicy(this, userInfo, gameState);
  }

  async saveScore(userId: string, username: string, score: number) {
    // FIXME: only save if score is better
    await setDoc(doc(this.database, this.collection, userId), {
      userId,
      username,
      score,
    });
  }

  async getLeaderboard(): Promise<Array<ScoreEntry>> {
    const scores: Array<ScoreEntry> = [];
    const querySnapshot = await getDocs(
      collection(this.database, this.collection)
    );
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // FIXME: see if we can access createTime
      scores.push({
        rank: NaN,
        username: data.username,
        score: data.score,
      });
    });
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((score, index) => score.rank = index + 1);
    return scores;
  }

  async getUserId(username: string): Promise<string | null> {
    const q = query(
      collection(this.database, this.collection),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
      return null;
    }
    // Assume usernames are unique
    const firstDoc = querySnapshot.docs[0];
    const data = firstDoc.data();
    return data.userId;
  }
}

// Always allow submitting a score
export async function always(leaderboard: Leaderboard, userInfo: UserInfo, gameState: GameState): Promise<boolean> {
  return true;
}

// Allow submitting a better score only
export async function betterScore(leaderboard: Leaderboard, userInfo: UserInfo, gameState: GameState): Promise<boolean> {
  const score = await userScore(leaderboard, userInfo.userId);
  if (score === null) {
    return true;
  }
  return gameScore(gameState) > score;
}

// Allow submitting a score only once per user and collection
export async function onlyOnce(leaderboard: Leaderboard, userInfo: UserInfo, gameState: GameState): Promise<boolean> {
  const score = await userScore(leaderboard, userInfo.userId);
  return score === null;
}


function userScore(leaderboard: Leaderboard, userId: string): Promise<number | null> {
  return new Promise(async (resolve) => {
    const q = query(
      collection(leaderboard.database, leaderboard.collection),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
      resolve(null);
      return;
    }
    // Assume only one entry per userId
    const firstDoc = querySnapshot.docs[0];
    const data = firstDoc.data();
    resolve(data.score);
  });
}
