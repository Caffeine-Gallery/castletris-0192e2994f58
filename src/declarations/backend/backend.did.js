export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getHighScores' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'saveHighScore' : IDL.Func([IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
