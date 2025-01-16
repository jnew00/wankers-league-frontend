import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generatePDF = async () => {
    const element = document.getElementById("scorecard-sheet");
    const payoutElement = document.getElementById("payout-table");
  
    // Ensure element is visible during rendering
    element.style.display = "block";
  
    try {
      const pdf = new jsPDF("l", "mm", "letter");
      const canvas = await html2canvas(element, { scale: 2.5 });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 

     
      const scorecardImg = canvas.toDataURL("image/png");
    //   pdf.addImage(scorecardImg, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.addImage(scorecardImg, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());



      pdf.addPage();
      payoutElement.style.display = "block";
      const payoutCanvas = await html2canvas(payoutElement);
      const payoutImg = payoutCanvas.toDataURL("image/png");
      pdf.addImage(payoutImg, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

      pdf.save("Scorecard.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Hide element again after rendering
      element.style.display = "none";
    }
  };


  export default generatePDF;
