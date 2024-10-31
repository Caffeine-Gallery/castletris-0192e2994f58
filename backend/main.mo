import Text "mo:base/Text";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Order "mo:base/Order";

actor {
  stable var highScores : [Nat] = [];

  public func saveHighScore(score : Nat) : async () {
    highScores := Array.sort(Array.append(highScores, [score]), Int.compare);
    if (highScores.size() > 10) {
      highScores := Array.tabulate(10, func (i : Nat) : Nat { highScores[i] });
    };
    Debug.print("High score saved: " # Nat.toText(score));
  };

  public query func getHighScores() : async [Nat] {
    Array.reverse(highScores)
  };
}
