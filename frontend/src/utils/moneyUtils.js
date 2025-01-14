// utils/moneyUtils.js
import { getPayoutForPlayers } from './payoutUtils';

export const calculateMoneyWonAndPot = (players, numPlayers) => {
    const totalPot = 24 * numPlayers;
  
    const totalSkins = players.reduce((sum, p) => sum + (p.skins || 0), 0);

    const skinValue = totalSkins > 0 ? Math.round((10 * numPlayers) / totalSkins) : 0;
    const ctpValue = (4 * numPlayers) / 4;
  
    const rankPayouts = getPayoutForPlayers(numPlayers)?.payouts || [];
  
    let totalPaidOut = 0;
    let totalSkinsPaid = 0;
    let totalCTPsPaid = 0;
  
    // const updatedPlayers = players.map((p) => {
    //   const moneyFromRank = rankPayouts[p.rank - 1] || 0;
    //   const moneyFromSkins = (p.skins || 0) * skinValue;
    //   const moneyFromCTPs = (p.ctps || 0) * ctpValue;
  
     

    //   totalPaidOut += moneyFromRank;
    //   totalSkinsPaid += moneyFromSkins;
    //   totalCTPsPaid += moneyFromCTPs;
  
    //   return {
    //     ...p,
    //     money_won:
    //       p.money_won === null // Preserve null values (from cleared input)
    //         ? null
    //         : p.money_won !== undefined // Preserve manually entered values
    //         ? p.money_won
    //         : moneyFromRank + moneyFromSkins + moneyFromCTPs, // Default fallback if no manual value
    //   };
    // });
  
    const updatedPlayers = players.map((p) => {
        if (p.manualMoneyOverride) {
            // Skip recalculation for manually overridden players
            return { ...p };
          }
        const moneyFromRank = rankPayouts[p.rank - 1] || 0;
        const moneyFromSkins = (p.skins || 0) * skinValue;
        const moneyFromCTPs = (p.ctps || 0) * ctpValue;
    
        const moneyWon = moneyFromRank + moneyFromSkins + moneyFromCTPs;
        totalPaidOut += moneyWon;
    
        return {
          ...p,
          money_won: moneyWon, // Update money_won
        };
      });

    const remainingPot = Math.max(
        totalPot - totalPaidOut - totalSkinsPaid - totalCTPsPaid,
        0
      );

    const remainingSkinPot = Math.max(10 * numPlayers - totalSkinsPaid, 0);
    const remainingCtpPot = 4 * numPlayers - totalCTPsPaid;
    
    return { updatedPlayers, remainingPot, remainingSkinPot, remainingCtpPot };
  };
  