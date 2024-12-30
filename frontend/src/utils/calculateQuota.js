/**
 * Calculate the new quota based on the previous quota and the score.
 * @param {number} previousQuota - The previous quota of the player.
 * @param {number} score - The player's score for the event.
 * @returns {number} - The calculated new quota.
 */
function calculateQuota(previousQuota, score) {
  if (!score) {
    return previousQuota;
  }

  const difference = score - previousQuota;

  if (difference >= -2) {
    return Math.round((difference / 2) + previousQuota);
  } else {
    return Math.round(previousQuota - 2);
  }
}

module.exports = calculateQuota;
