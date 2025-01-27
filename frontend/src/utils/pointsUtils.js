export const MAJOR_MULTIPLIER = 1.5;
export const calculateTotalPoints = (
  player,
  pointsConfig,
  isMajor,
  isFedupEligible,
  players
) => {
  if (!isFedupEligible) {
    return 0;
  }

  // Calculate raw CTP and Skin points
  const ctpPoints = (player.ctps || 0) * pointsConfig.ctp;
  const skinPoints = (player.skins || 0) * pointsConfig.skin;

  // Cap the combined CTP and Skin points
  const combinedPoints = Math.min(
    ctpPoints + skinPoints,
    pointsConfig.ctp_skin_cap
  );

  // Calculate rank points with tie handling
  let rankPoints = 0;
  if (player.rank && pointsConfig[`place${player.rank}`]) {
    const tiedPlayers = players.filter((p) => p.rank === player.rank);

    if (tiedPlayers.length > 1) {
      const tiedPoints = tiedPlayers.map((_, idx) => {
        const rankKey = `place${player.rank + idx}`;
        return pointsConfig[rankKey] || 0;
      });

      rankPoints =
        tiedPoints.reduce((sum, value) => sum + value, 0) / tiedPlayers.length;
    } else {
      rankPoints = pointsConfig[`place${player.rank}`];
    }
  }

  // Calculate total points with participation points
  let totalPoints = combinedPoints + rankPoints + (pointsConfig.participation || 0);

  // Apply multiplier for major events
  if (isMajor) {
    totalPoints = Math.ceil(totalPoints * MAJOR_MULTIPLIER);
  }

  return totalPoints;
};
