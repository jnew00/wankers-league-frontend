import React from "react";
import payoutData from "../utils/payoutData"
 
const PayoutTablePrint = () => {
  return (
   <div id="payout-table" className="p-6 mx-auto">
      <h2 className="text-xl font-bold mb-4">Payout Table</h2>
      <table className="w-auto text-xs border-collapse border border-black">
        <thead className="bg-blue-600 text-white h-8">
          <tr>
            <th className="border border-black h-2 pb-2 text-center">Players</th>
            <th className="border border-black h-2 pb-2 text-center">Places</th>
            <th className="border border-black h-2 pb-2 text-center">Payouts</th>
            <th className="border border-black h-2 pb-2 text-center">CTPs Each</th>
            <th className="border border-black h-2 pb-2 text-center">Skins Pot</th>
            <th className="border border-black h-2 pb-2 text-center">Pot Total</th>
          </tr>
        </thead>
        <tbody>
          {payoutData.map((row, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-100">
              <td className="border border-black pb-2 text-center">{row.players}</td>
              <td className="border border-black pb-2 text-center">{row.places}</td>
              <td className="border border-black pb-2 text-left">
                 {row.payouts.join(", ")} {/* Join values horizontally */}
              </td>
              <td className="border border-black pb-2 text-center">
                ${(row.players).toFixed()}
              </td>
              <td className="border border-black pb-2 text-center">
                ${(row.players * 10).toFixed()}
              </td>
              <td className="border border-black pb-2 text-center">
                ${(row.players * 24).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayoutTablePrint;
