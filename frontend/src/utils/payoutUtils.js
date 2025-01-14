import payoutData from './payoutData';

export const getPayoutForPlayers = (numPlayers) => {
  return payoutData.find((p) => p.players === numPlayers) || null;
};

export const calculateMoneyWon = (players, ctpValue, skinValue) => {
  const numPlayers = players.length;
  const rankPayouts = getPayoutForPlayers(numPlayers)?.payouts || [];

  return players.map((player) => {
    const moneyFromRank = rankPayouts[player.rank - 1] || 0;
    const moneyFromSkins = (player.skins || 0) * skinValue;
    const moneyFromCTPs = (player.ctps || 0) * ctpValue;

    return {
      ...player,
      money_won: moneyFromRank + moneyFromSkins + moneyFromCTPs,
    };
  });
};
