/**
 * Calculate the new quota based on the previous quota and the score.
 * @param {number} previousQuota - The previous quota of the player.
 * @param {number} score - The player's score for the event.
 * @returns {number} - The calculated new quota.
 */
function calculateQuota(previousQuota, score) {
  console.log("calculateQuota - previousQuota:", previousQuota, "score:", score);
  
  if (previousQuota == null) {
    console.warn("Warning: previousQuota is null or undefined!");
    return 0; // Default to 0 if invalid
  }
  if (score == null) { // Only check for null or undefined, not 0
    console.warn("Warning: score is null or undefined!");
    return previousQuota;
  }

  const difference = score - previousQuota;


  let newQuota;
  if (difference >= -2) {
    newQuota = Math.round((difference / 2) + previousQuota);
  } else {
    newQuota = Math.round(previousQuota - 2);
  }

  console.log("Calculated Quota:", newQuota); // Debug log
  return newQuota;
}

module.exports = calculateQuota;
