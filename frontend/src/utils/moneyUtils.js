import { getPayoutForPlayers } from './payoutUtils';

export const calculateMoneyWonAndPot = (players, numPlayers) => {
  // Total pot is based on the number of players.
  const totalPot = 24 * numPlayers;
  
  // Calculate skins data.
  const totalSkins = players.reduce((sum, p) => sum + (p.skins || 0), 0);
  const skinValue = totalSkins > 0 ? Math.floor((10 * numPlayers) / totalSkins) : 0;
  
  // CTP value calculation (in your original code it simplifies to numPlayers, but we'll keep your style).
  const ctpValue = Math.floor((4 * numPlayers) / 4);
  
  // Get the rank payouts array (assumed to be ordered by rank, e.g. index 0 = payout for 1st).
  const rankPayouts = getPayoutForPlayers(numPlayers)?.payouts || [];
  
  let totalPaidOut = 0;
  let totalSkinsPaid = 0;
  let totalCTPsPaid = 0;

  const updatedPlayers = players.map((p) => {
    // If the player has been manually overridden, skip recalculation.
    if (p.manualMoneyOverride) {
      return { ...p };
    }
    
    let moneyFromRank = 0;
    
    // Only calculate if the player has a valid (truthy and > 0) rank.
    if (p.rank && p.rank > 0) {
      // Get only those players with a valid rank that matches.
      const tiedPlayers = players.filter((other) => other.rank && other.rank === p.rank);
      
      if (tiedPlayers.length > 1) {
        // If there's a tie, sum the payouts for the consecutive positions that the tie covers.
        let sumPayouts = 0;
        for (let i = 0; i < tiedPlayers.length; i++) {
          // For a tie starting at rank p.rank, add payouts for positions:
          // p.rank, p.rank+1, ..., p.rank + tiedPlayers.length - 1.
          sumPayouts += (rankPayouts[p.rank - 1 + i] || 0);
        }
        moneyFromRank = Math.floor(sumPayouts / tiedPlayers.length);
      } else {
        moneyFromRank = Math.floor(rankPayouts[p.rank - 1] || 0);
      }
    } else {
      moneyFromRank = 0;
    }

    // Calculate skins and CTP components (rounded down).
    const moneyFromSkins = Math.floor((p.skins || 0) * skinValue);
    const moneyFromCTPs = Math.floor((p.ctps || 0) * ctpValue);

    totalSkinsPaid += moneyFromSkins;
    totalCTPsPaid += moneyFromCTPs;

    const moneyWon = moneyFromRank + moneyFromSkins + moneyFromCTPs;
    totalPaidOut += moneyWon;

    return {
      ...p,
      money_won: moneyWon, // The recalculated payout (rounded down).
    };
  });

  const remainingPot = Math.max(totalPot - totalPaidOut - totalSkinsPaid - totalCTPsPaid, 0);
  const remainingSkinPot = Math.max(10 * numPlayers - totalSkinsPaid, 0);
  const remainingCtpPot = 4 * numPlayers - totalCTPsPaid;
  
  return { updatedPlayers, remainingPot, remainingSkinPot, remainingCtpPot };
};