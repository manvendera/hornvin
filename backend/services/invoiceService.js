// ─────────────────────────────────────────────────────────
//  services/invoiceService.js — PDF Invoice Generation
// ─────────────────────────────────────────────────────────
const PDFDocument = require("pdfkit");

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Populated order document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ─── Header ──────────────────────────────────
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("HORNVIN AUTO", 50, 50)
        .fontSize(10)
        .font("Helvetica")
        .text("Automobile Parts & Accessories", 50, 80)
        .text("GST: 07AAACH1234F1ZK", 50, 95);

      // ─── Invoice Info ────────────────────────────
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 400, 50, { align: "right" })
        .fontSize(10)
        .font("Helvetica")
        .text(`Invoice #: ${order.invoiceNumber || order.orderNumber}`, 400, 80, { align: "right" })
        .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 400, 95, { align: "right" })
        .text(`Order #: ${order.orderNumber}`, 400, 110, { align: "right" });

      doc.moveTo(50, 135).lineTo(545, 135).stroke();

      // ─── Customer Info ───────────────────────────
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 50, 150)
        .fontSize(10)
        .font("Helvetica");

      const addr = order.shippingAddress || {};
      doc.text(addr.name || "Customer", 50, 168);
      doc.text(`${addr.street || ""}`, 50, 183);
      doc.text(`${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`, 50, 198);
      doc.text(`Phone: ${addr.phone || "N/A"}`, 50, 213);

      // ─── Items Table Header ──────────────────────
      const tableTop = 250;
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("#", 50, tableTop, { width: 30 });
      doc.text("Item", 80, tableTop, { width: 200 });
      doc.text("Qty", 280, tableTop, { width: 40, align: "center" });
      doc.text("Price", 320, tableTop, { width: 70, align: "right" });
      doc.text("GST", 390, tableTop, { width: 50, align: "right" });
      doc.text("Total", 440, tableTop, { width: 100, align: "right" });

      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

      // ─── Items ───────────────────────────────────
      doc.font("Helvetica").fontSize(9);
      let yPos = tableTop + 25;

      (order.items || []).forEach((item, i) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        doc.text(i + 1, 50, yPos, { width: 30 });
        doc.text(item.name || "Product", 80, yPos, { width: 200 });
        doc.text(item.quantity.toString(), 280, yPos, { width: 40, align: "center" });
        doc.text(`₹${item.price.toFixed(2)}`, 320, yPos, { width: 70, align: "right" });
        doc.text(`${item.gstRate || 18}%`, 390, yPos, { width: 50, align: "right" });
        doc.text(`₹${item.totalPrice.toFixed(2)}`, 440, yPos, { width: 100, align: "right" });
        yPos += 20;
      });

      doc.moveTo(50, yPos).lineTo(545, yPos).stroke();
      yPos += 15;

      // ─── Totals ──────────────────────────────────
      doc.font("Helvetica").fontSize(10);
      doc.text("Subtotal:", 380, yPos, { width: 60, align: "right" });
      doc.text(`₹${(order.subtotal || 0).toFixed(2)}`, 440, yPos, { width: 100, align: "right" });
      yPos += 18;

      doc.text("GST:", 380, yPos, { width: 60, align: "right" });
      doc.text(`₹${(order.totalGst || 0).toFixed(2)}`, 440, yPos, { width: 100, align: "right" });
      yPos += 18;

      doc.text("Shipping:", 380, yPos, { width: 60, align: "right" });
      doc.text(`₹${(order.shippingCost || 0).toFixed(2)}`, 440, yPos, { width: 100, align: "right" });
      yPos += 18;

      if (order.discount > 0) {
        doc.text("Discount:", 380, yPos, { width: 60, align: "right" });
        doc.text(`-₹${order.discount.toFixed(2)}`, 440, yPos, { width: 100, align: "right" });
        yPos += 18;
      }

      doc.moveTo(380, yPos).lineTo(545, yPos).stroke();
      yPos += 8;

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Total:", 380, yPos, { width: 60, align: "right" });
      doc.text(`₹${(order.totalAmount || 0).toFixed(2)}`, 440, yPos, { width: 100, align: "right" });

      // ─── Footer ──────────────────────────────────
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a computer generated invoice. No signature required.",
          50,
          750,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
