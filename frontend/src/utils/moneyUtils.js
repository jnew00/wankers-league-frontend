import { getPayoutForPlayers } from './payoutUtils';

export const calculateMoneyWonAndPot = (players, numPlayers) => {
  // Total overall pot (for all components)
  const totalPot = 24 * numPlayers;
  
  // Skins calculations
  const totalSkins = players.reduce((sum, p) => sum + (p.skins || 0), 0);
  const skinValue = totalSkins > 0 ? Math.floor((10 * numPlayers) / totalSkins) : 0;
  
  // CTP calculations:
  // Use a fixed expected CTP count (which is 4) regardless of what is actually assigned.
  const expectedCTPCount = 4;
  // Each CTP is worth numPlayers dollars.
  const ctpValue = numPlayers;
  
  // Get rank payouts for the event.
  const rankPayouts = getPayoutForPlayers(numPlayers)?.payouts || [];
  
  let totalPaidOut = 0;
  let totalSkinsPaid = 0;
  let totalCTPsPaid = 0;
  
  const updatedPlayers = players.map((p) => {
    // If manually overridden, don't recalc.
    if (p.manualMoneyOverride) {
      return { ...p };
    }
    
    // Calculate payout based on rank (including tie logic)
    let moneyFromRank = 0;
    if (p.rank && p.rank > 0) {
      const tiedPlayers = players.filter((other) => other.rank && other.rank === p.rank);
      if (tiedPlayers.length > 1) {
        let sumPayouts = 0;
        for (let i = 0; i < tiedPlayers.length; i++) {
          sumPayouts += (rankPayouts[p.rank - 1 + i] || 0);
        }
        moneyFromRank = Math.floor(sumPayouts / tiedPlayers.length);
      } else {
        moneyFromRank = Math.floor(rankPayouts[p.rank - 1] || 0);
      }
    } else {
      moneyFromRank = 0;
    }
    
    // Calculate skins payout (rounded down)
    const moneyFromSkins = Math.floor((p.skins || 0) * skinValue);
    
    // Calculate CTP payout: each CTP is worth ctpValue dollars.
    const moneyFromCTPs = Math.floor((Number(p.ctps) || 0) * ctpValue);
    
    totalSkinsPaid += moneyFromSkins;
    totalCTPsPaid += moneyFromCTPs;
    
    const moneyWon = moneyFromRank + moneyFromSkins + moneyFromCTPs;
    totalPaidOut += moneyWon;
    
    return {
      ...p,
      money_won: moneyWon,
    };
  });
  
  // The remaining pot is whatever is left from the total pot after paying out money
  // from skins and rank components.
  const remainingPot = Math.max(totalPot - totalPaidOut - totalSkinsPaid - totalCTPsPaid, 0);
  
  // The remaining skins pot (if needed) is calculated as before.
  const remainingSkinPot = Math.max(10 * numPlayers - totalSkinsPaid, 0);
  
  // For CTPs, if the full expected number (4) is assigned, then totalCTPsPaid should equal 4 * numPlayers.
  // Otherwise, the remaining CTP pot is the difference.
  const remainingCtpPot = Math.max((expectedCTPCount * numPlayers) - totalCTPsPaid, 0);
  
  return { updatedPlayers, remainingPot, remainingSkinPot, remainingCtpPot };
};