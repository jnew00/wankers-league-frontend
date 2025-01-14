export const MAJOR_MULTIPLIER = 1.5;

export const calculateTotalPoints = (
  player,
  pointsConfig,
  isMajor,
  isFedupEligible,
  players // Include the full list of players for tie calculations
) => {

  if (!isFedupEligible) {
    return 0;
  }

  // Calculate raw CTP and Skin points
  const ctpPoints = player.ctps * pointsConfig.ctp;
  const skinPoints = player.skins * pointsConfig.skin;

  // Cap the combined CTP and Skin points
  const combinedPoints = Math.min(
    ctpPoints + skinPoints,
    pointsConfig.ctp_skin_cap
  );

  // Calculate rank points with tie handling
  let rankPoints = 0;
  if (player.rank && pointsConfig[`place${player.rank}`]) {
    // Identify tied players
    const tiedPlayers = players.filter(
      (p) => p.rank === player.rank
    );

    if (tiedPlayers.length > 1) {
      // Calculate average points for tied ranks
      const startRank = player.rank - 1; // Convert to 0-based index
      const endRank = startRank + tiedPlayers.length - 1;

      const tiedPoints = [];
      for (let i = startRank; i <= endRank; i++) {
        if (pointsConfig[`place${i + 1}`]) {
          tiedPoints.push(pointsConfig[`place${i + 1}`]);
        }
      }

      rankPoints =
        tiedPoints.reduce((sum, value) => sum + value, 0) /
        tiedPlayers.length;
    } else {
      rankPoints = pointsConfig[`place${player.rank}`];
    }
  }

  // Calculate total points with participation points
  let totalPoints = combinedPoints + rankPoints + pointsConfig.participation;

  // Apply multiplier for major events
  if (isMajor) {
    totalPoints = Math.ceil(totalPoints * MAJOR_MULTIPLIER);
  }

  return totalPoints;
};
