import React, { useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import '../index.css';

const RulesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-start mb-4">
        <PageHeader
          title="The Game, Player Conduct and the Rules"
          updatedText=""
        />
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {/* General League Rules Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">
            General League Rules
          </h2>
   
          <div className="bg-white border border-gray-300 shadow-md rounded-lg p-8">
            <ol className="list-decimal list-outside space-y-6 marker:text-red-600 marker:font-bold marker:text-xl">
             
  {/* Local Rules*/}            
              <li>
                <strong className="text-lg">Local Rules</strong>
                <ol className="list-lower-alpha list-outside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg important">
                  <li>
                    Unless stated below, we follow the{" "}
                    <a
                      href="https://www.usga.org/content/usga/home-page/rules/rules-2019/rules-of-golf/rules-and-definitions.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      USGA Rules of Golf
                    </a>
                    .
                  </li>
                  <li>
                  A player is allowed a "mercy mulligan" on the first non-par 3 hole they play. 
                  If they choose to use it, they must play the mulligan. 
                  Once the player leaves the tee box, the "mercy mulligan" is forfeited.
                  </li>
                  <li>
                  Play the ball as it lies, using common sense (e.g., you don’t have to hit from a tree root or a divot in the fairway).
                  </li>
                  <li>A player may, with a 1-stroke penalty, place the ball anywhere along its original line of flight (not closer to the green or pin),
                     including the fairway, in cases of out of bounds, a lost ball, or an unplayable lie.
                  </li>

                  <li>All balls must be putted out. No Gimmies.</li>
  
                  <li>
                  Lost Ball: If a player hits a ball that is "clearly in play" and their playing partners agree it should not be lost, 
                  the player may place a new ball where it is believed to have been, without penalty. 
                  This rule applies only in the general area and not in a penalty area.
                  </li>
                  <li>
                    If a player accidentally moves their ball while addressing
                    it on the green, they may replace it without penalty.{" "}
                    <a
                      href="https://www.usga.org/content/usga/home-page/rules-hub/2017-local-rule/local-rule--accidental-movement-of-a-ball-on-the-putting-green.html#expanded"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Follows USGA Local Rule
                    </a>
                    .
                  </li>
                  <li>
                  A player may, without penalty, lift and place the ball (no closer to the green or pin) in the same area (fairway, rough, bunker, etc.) 
                  under the following conditions, as agreed upon by the group:
                  <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>
                      <strong>Roots:</strong> The ball lies in a spot where the player risks hitting roots during the back or forward swing. Relief must not provide an unfair advantage. Note: Tree trunks or branches are not considered roots.
                      </li>
                      <li>
                      <strong>Cleaning or Divots: </strong>Cleaning is appropriate, or the ball lies in a divot or Ground Under Repair (GUR), marked or unmarked, in the fairway.
                          <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                            <li>
                            <i>Wet Days:</i> Cleaning is allowed anywhere on the course if all players agree before the round.
                            </li>
                          </ul>
                      </li>
                      <li>
                      <strong>Bunker:</strong> The ball lies in an unnatural hole (e.g., shoe print or divot), standing water, or mud in a bunker.
                      </li>
                      <li>
                      <strong>Man-Made Obstacles:</strong> The ball lies in or near a man-made obstacle such as a sprinkler head, cart path, drainage rocks/grate/pipes, or electrical boxes.
                      </li>
                      <li>
                      <strong>Unnatural Obstacles:</strong> The ball lies in or near an obstacle that shouldn't be on the course (e.g., fallen or cut trees/branches, grass cuttings, raked leaves, alligators, or nesting birds).
                      </li>
                      <li>
                      <strong>Putting Surface:</strong> The ball lies on a green with spots that are dead, covered with sand, or affected by an old pin hole on the putting line. The ball may be moved a maximum of one putter's length, no closer to the pin, to avoid these obstacles.
                      </li>
                      <li>
                      <strong>Embedded Ball: </strong>The ball is embedded anywhere in the general area, but not in a penalty area. {" "}
                            <a
                            href="https://www.usga.org/content/usga/home-page/rules/rules-2019/players-edition/rule-16.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >Follows USGA Rule 16.3.
                          </a>
                      </li>
                  </ul>
                  </li>
                </ol>
              </li>


  {/* Playing the Round*/} 
              <li>
                <strong className="text-lg">Playing the Round</strong>
                <ol className="list-lower-alpha list-outside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>
                    All will play from the same tee box except:
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>
                        Age 65+ and quota &lt; 26 play from one tee box forward
                        except on par 3s (see below).
                      </li>
                      <li>
                        Quota &lt; 6 play one tee box forward except on par 3s
                        (see below).
                      </li>
                      <li>
                        Players with quotas 26 - 30 play one tee box back.
                      </li>
                      <li>Players with a 31+ quota play from the tips. If we are playing from the tips, tee up someplace beyond the tips.</li>
                    </ul>
                  </li>

                  <li>
                    On Par 3s all play from the same tee except if the hole is
                    &gt;180 yards (measured to the flag with rangefinder) then
                    upfront tee players play the upfront tee.
                  </li>
                  <li>
                  The rules committee will consider requests from players under the age of 65 with a disability to play from the forward tees. 
                  If approved, they must adhere to the rules applicable to players under 65.
                  </li>
                </ol>   
              </li>


  {/* Competition*/}  
              <li>
                <strong className="text-lg">Competition</strong>  
                <ol className="list-lower-alpha list-outside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>
                    Must have at least a 4-some to have Stableford scores count
                    on non-Sunday events (does not count for FedUp Cup points).
                  </li>
                  <li>
                    Greenies (CTPs) - If you are the closest to the pin you must either birdie 
                    or par the hole to win. Failure to do so will result in a carryover to the next par 3. 
                    If there is no next par 3, we are all winners and $1 will be returned to each player.
                  </li>
                  <li>
                    New players will be capped at +2 for the Stableford
                    competition for their first two money game rounds.
                  </li>
                  <li>
                    $24 buy-ins (must be all in):
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>$10 for Stableford (quota game).</li>
                      <li>$10 for skins.</li>
                      <li>$4 for greenies (CTPs).</li>
                      <li>If more par 3's, increase amount.</li>
                      <li>
                        <button
                          onClick={handleModalOpen}
                          className="text-blue-600 underline"
                        >
                          Payout for Stableford
                        </button>
                      </li>
                      </ul>
                  </li>
                  <li>Finishing the round:
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>If you are not able to finish a round due to an injury or weather conditions (all must quit) 
                        your score is not counted, and you don’t have to pay for the money games.</li>
                      <li>If a player fails to complete their round (other than Injury/Sickness/Weather), they are expected to pay for the money games. Their scorecard is counted towards Stapleford, and they are eligible for the Stableford, Greenies and Skins games.</li>
                    </ul>
                  </li>
                  <li>Strokes in skins game based on Stableford quota:
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>1-5 get one stroke on the two hardest handicap holes per 9</li>
                      <li>6-9 get one stroke per 9 on the hardest handicap holes</li>
                      <li>&gt;= 10 gets 0 strokes.</li>
                    </ul>
                  </li>
                  <li>
                  Pairings:
                      <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                          <li>
                          If we have four groups or less, we will draw cards at the course.
                          </li>
                          <li>
                          If we have five groups or more, someone will pre-draw the pairing so those in the last group or second last group can show up a little later, but you must be committed to showing up.
                          </li>
                      </ul>
                  </li>       
                </ol>
              </li>


  {/* Player Conduct*/} 
              <li>
                <strong className="text-lg">Player Conduct</strong>
                 
                <ol className="list-lower-alpha list-outside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li> Don't be a dick.</li>
                  <li>
                    If you can't make it, cancel ASAP so someone else can play
                    or we can reduce tee times and not get yelled at from the
                    course.
                  </li>
                  <li>
                    {" "}
                    When you have a double bogey, take your medicine and pick up
                    your ball.
                  </li>
                  <li>
                    Unless you have an approved medical condition, must partake
                    in birdie fireball shots.
                  </li>
                </ol>
              </li>
            </ol>
          </div>
        </section>


  {/* FedUp Cup Rules Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-blue-600">
            FedUp Cup Rules
          </h2>
          <div className="bg-white border border-gray-300 shadow-md rounded-lg p-8">        
            <ol className="list-decimal list-outside space-y-6 marker:text-red-600 marker:font-bold marker:text-xl">
              <li>
                <strong className="text-lg">General Rules:</strong>
                <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                  <li>$50 buy-in for the season.</li>
                  <li>Season Starts January 11th.</li>
                  <li>
                    Only weekly Sunday competitions count towards FedUp points.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-lg">Point Structure:</strong>
                <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                  <li>
                    Finishes (Net Score): Aligned with current scoring and
                    weekly payouts:
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>1st: 100 points</li>
                      <li>2nd: 90 points</li>
                      <li>3rd: 80 points</li>
                      <li>4th: 70 points</li>
                      <li>5th: 60 points</li>
                      <li>...down to max 8th place</li>
                    </ul>
                  </li>
                  <li>
                    Participation Points: 5 points for showing up and playing.
                  </li>
                  <li>Skins: 2 points</li>
                  <li>Closest-to-the-Pin (CTP): 3 points</li>
                  <li>Max 10 points combined CTP + Skin points per week</li>
                </ul>
              </li>
              <li>
                <strong className="text-lg">Three “Majors”:</strong>
                <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                  <li>Spring (April), Summer (July), Fall (October).</li>
                  <li>
                    Points for finishes are 1.5x regular weeks (rounded down):
                    <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                      <li>1st: 150 points</li>
                      <li>2nd: 135 points</li>
                      <li>3rd: 120 points</li>
                      <li>...down to max 8th place</li>
                    </ul>
                  </li>
                  <li>
                    Participation = 8 points, Skins = 3 points, CTP = 5 points,
                    max 15 points for CTPs/Skins.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-lg">Playoffs</strong>
                <ol className="list-lower-alpha list-outside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>Championship Bracket</li>
                  <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                    <li>
                      Week 1 – Dec 6th: Top 8 point leaders + ties qualify.
                      Points reset to 100, 90, 80,...30. 
                      This gives point advantages to top regular season finishers. 
                    </li>
                    <li>
                      Week 2 – Dec 13th: Top 4 + ties from Week 1 advance.
                      Points carry over, but 1st place doubles to 200 points.
                    </li>
                    <li>
                      Championship tie breaker (other places split pots) - highest ranked player from regular season of those tied wins. 
                      If still tied, then a 20ft putt off on the practice green.  
                    </li>
                  </ul>
                  <li>Loser's Bracket</li>
                  <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                    <li>Most over quota combined during playoff weeks</li>
                    <li>1st: $30, 2nd: $20, 3rd: $10</li>
                  </ul>
                </ol>
              </li>

              <li>
                <strong className="text-lg">Final Payouts:</strong> Championship
                Pot (funded by entry fees):
                <ul className="list-disc list-outside ml-8 space-y-2 marker:text-black">
                  <li>1st Place: 50%</li>
                  <li>2nd Place: 20%</li>
                  <li>3rd Place: 15%</li>
                  <li>4th Place: 10%</li>
                  <li>5th Place: 5%</li>
                </ul>
              </li>    
            </ol>
          </div>
        </section>
      </div>



      {/* Modal for Stableford Payout */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleModalClose}
        >
          <div
            className="relative bg-white rounded-lg p-4 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={handleModalClose}
            >
              &times;
            </button>
            <img
              src="/assets/payouts.png"
              alt="Stableford Payout"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesPage;
