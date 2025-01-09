export const MAJOR_MULTIPLIER = 1.5;

export const calculateTotalPoints = (player, pointsConfig, isMajor, isFedupEligible) => {

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

  // Calculate rank points
  const rankPoints =
    player.rank && pointsConfig[`place${player.rank}`]
      ? pointsConfig[`place${player.rank}`]
      : 0;

  // Calculate total points with participation points
  let totalPoints = combinedPoints + rankPoints + pointsConfig.participation;

  // Apply multiplier for major events
  if (isMajor) {
    totalPoints = Math.ceil(totalPoints * MAJOR_MULTIPLIER);
  }

  return totalPoints;
};
