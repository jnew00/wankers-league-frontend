import React, { useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

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
            <ol className="list-decimal list-inside space-y-6 marker:text-red-600 marker:font-bold marker:text-xl">
              <li>
                <strong className="text-lg">Local Rules</strong>
                <ol className="list-lower-alpha list-inside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
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
                    A mulligan is permitted on the first non-Par 3 hole, but you
                    must play your second shot.
                  </li>
                  <li>
                    Play the ball down (where it lies) but with common sense
                    (don't have to hit off a tree root, divot in a fairway,
                    etc.).
                  </li>
                  <li>
                    Because of wet conditions, we will play clean and drop if
                    the ball is plugged or full of mud.
                  </li>
                  <li>All balls must be putted out. No Gimmies.</li>
                  <li>
                    On "Wet Days" cleaning is permitted anywhere provided this
                    has been agreed to by all before the start of play.
                  </li>
                  <li>
                    Lost ball - If a player hits a ball "clearly in play" and it
                    is agreed by their playing partners that the ball should not
                    be lost, they may without penalty place a new ball where
                    they believe it should have been found. This applies to the
                    general area, not in a penalty area.
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
                </ol>
              </li>

              <li>
                <strong className="text-lg">Playing the Round</strong>
                <ol className="list-lower-alpha list-inside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>
                    All will play from the same tee box except:
                    <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                      <li>
                        Age 65+ and quota &lt; 30 play from one tee box forward
                        except on par 3s (see below).
                      </li>
                      <li>
                        Quota &lt; 6 play one tee box forward except on par 3s
                        (see below).
                      </li>
                      <li>
                        Players with quotas 26 - 30 play one tee box back.
                      </li>
                      <li>Players with a 31+ quota play from the tips.</li>
                    </ul>
                  </li>

                  <li>
                    On Par 3s all play from the same Tee except if the hole is
                    &gt;= 180 yards (measured to the flag with rangefinder) then
                    upfront tee players play the upfront tee.
                  </li>
                </ol>
              </li>
              <li>
                <strong className="text-lg">Competition</strong>
                <ol className="list-lower-alpha list-inside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>
                    Must have at least a 4-some to have Stableford scores count
                    on non-Sunday events (does not count for FedUp Cup points).
                  </li>
                  <li>
                    Greenies (CTPs) - Be closest to the pin and par or birdie to
                    win, else it carryovers to the next par 3.
                  </li>
                  <li>
                    New players will be capped at +2 for the Stableford
                    competition for their first two money game rounds.
                  </li>
                  <li>
                    $24 buy-ins (must be all in):
                    <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
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
                  <li>
                    Strokes in skins game based on Stableford quota:
                    <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                      <li>0-5 gets 2 strokes a side.</li>
                      <li>6-9 gets 1 stroke a side.</li>
                      <li>&gt;= 10 gets 0 strokes.</li>
                    </ul>
                  </li>
                </ol>
              </li>
              <li>
                <strong className="text-lg">Player Conduct</strong>
                <ol className="list-lower-alpha list-inside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
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
                    Unless you have an approved medical condition, but partake
                    in birdie shots.
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
            <ol className="list-decimal list-inside space-y-6 marker:text-red-600 marker:font-bold marker:text-xl">
              <li>
                <strong className="text-lg">General Rules:</strong>
                <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                  <li>$25 buy-in for the season.</li>
                  <li>Season Starts January 11th.</li>
                  <li>
                    Only weekly Sunday competitions count towards FedUp points.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-lg">Point Structure:</strong>
                <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                  <li>
                    Finishes (Net Score): Aligned with current scoring and
                    weekly payouts:
                    <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
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
                <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                  <li>Spring (April), Summer (July), Fall (October).</li>
                  <li>
                    Points for finishes are 1.5x regular weeks (rounded down):
                    <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
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
                <ol className="list-lower-alpha list-inside ml-6 space-y-4 marker:text-blue-600 marker:font-bold marker:text-lg">
                  <li>Championship Bracket</li>
                  <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                    <li>
                      Week 1 – Dec 6th: Top 8 point leaders + ties qualify.
                      Points reset to 0.
                    </li>
                    <li>
                      Week 2 – Dec 13th: Top 4 + ties from Week 1 advance.
                      Points carry over, but 1st place doubles to 200 points.
                    </li>
                  </ul>
                  <li>Loser's Bracket</li>
                  <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                    <li>Most over quota combined during playoff weeks</li>
                    <li>1st: $30, 2nd: $20, 3rd: $10</li>
                  </ul>
                </ol>
              </li>

              <li>
                <strong className="text-lg">Final Payouts:</strong> Championship
                Pot (funded by $25 entry fees):
                <ul className="list-disc list-inside ml-8 space-y-2 marker:text-black">
                  <li>1st Place: 50%</li>
                  <li>2nd Place: 20%</li>
                  <li>3rd Place: 15%</li>
                  <li>4th Place: 5%</li>
                  <li>Champion’s Prize: Remaining 10% (trophy, hat, etc.).</li>
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
