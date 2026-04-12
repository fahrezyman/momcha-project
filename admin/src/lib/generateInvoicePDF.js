import { formatCurrency, formatDate, formatTime } from "@/constants";

export async function generateInvoicePDF(order) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Colors
  const primaryColor = [224, 139, 139];
  const darkGray = [51, 51, 51];
  const lightGray = [102, 102, 102];
  const white = [255, 255, 255];

  let yPos = 20;

  // ============================================
  // HEADER
  // ============================================
  // Logo kecil di kiri
  doc.addImage("/icon.png", "PNG", 20, yPos, 20, 20);

  // Company name besar di sebelah logo
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.setFont(undefined, "bold");
  doc.text("MomCha", 45, yPos + 7);

  // Info detail di bawah company name
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.setFont(undefined, "normal");
  doc.text("Babycare", 45, yPos + 12);
  doc.text("Surabaya, Indonesia", 45, yPos + 16);
  doc.text("Phone: +62 812-3456-7890", 45, yPos + 20);
  doc.text("Instagram: @momcha.id", 45, yPos + 24);

  // INVOICE Title
  doc.setFontSize(20);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", 200, yPos, { align: "right" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...lightGray);
  doc.text("Order Number:", 200, yPos + 8, { align: "right" });

  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont(undefined, "bold");
  doc.text(order.order_number, 200, yPos + 14, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.setFont(undefined, "normal");
  doc.text(`Date: ${formatDate(order.created_at)}`, 200, yPos + 20, {
    align: "right",
  });

  // Line separator
  yPos += 35;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  // ============================================
  // BILL TO & SERVICE DETAILS
  // ============================================
  yPos += 10;

  // Bill To
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, "bold");
  doc.text("BILL TO:", 20, yPos);

  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  yPos += 6;
  doc.text(order.customer_name, 20, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  yPos += 5;
  doc.text(order.customer_phone, 20, yPos);

  if (order.customer_email) {
    yPos += 4;
    doc.text(order.customer_email, 20, yPos);
  }

  if (order.customer_address) {
    yPos += 4;
    const addressLines = doc.splitTextToSize(order.customer_address, 70);
    doc.text(addressLines, 20, yPos);
  }

  // Service Details
  let rightYPos = yPos - (order.customer_email ? 19 : 15);
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, "bold");
  doc.text("SERVICE DETAILS:", 110, rightYPos);

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  rightYPos += 6;
  doc.text(`Date: ${formatDate(order.service_date)}`, 110, rightYPos);
  rightYPos += 4;
  doc.text(`Time: ${formatTime(order.service_start_time)}`, 110, rightYPos);
  rightYPos += 4;
  doc.text(`Duration: ${order.total_duration_minutes} minutes`, 110, rightYPos);

  // ============================================
  // SERVICES TABLE (MANUAL)
  // ============================================
  yPos += 25;

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(20, yPos, 170, 8, "F");

  doc.setTextColor(...white);
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Service", 22, yPos + 5.5);
  doc.text("Duration", 110, yPos + 5.5, { align: "center" });
  doc.text("Qty", 135, yPos + 5.5, { align: "center" });
  doc.text("Price", 160, yPos + 5.5, { align: "right" });
  doc.text("Subtotal", 188, yPos + 5.5, { align: "right" });

  yPos += 8;

  // Table rows
  doc.setFont(undefined, "normal");
  doc.setTextColor(...darkGray);

  let rowIndex = 0;
  order.services?.forEach((service) => {
    // Alternate row colors
    if (rowIndex % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 7, "F");
    }

    doc.setFontSize(9);
    doc.text(service.service_name, 22, yPos + 5);
    doc.text(`${service.duration_minutes}m`, 110, yPos + 5, {
      align: "center",
    });
    doc.text(String(service.quantity), 135, yPos + 5, { align: "center" });
    doc.text(formatCurrency(service.price), 160, yPos + 5, { align: "right" });

    doc.setFont(undefined, "bold");
    doc.text(formatCurrency(service.subtotal), 188, yPos + 5, {
      align: "right",
    });
    doc.setFont(undefined, "normal");

    yPos += 7;
    rowIndex++;
  });

  // ============================================
  // TOTAL
  // ============================================
  yPos += 5;

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(130, yPos, 190, yPos);

  yPos += 6;
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, "bold");
  doc.text("TOTAL:", 130, yPos);

  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(order.total_amount), 190, yPos, { align: "right" });

  // ============================================
  // PAYMENT INFO
  // ============================================
  yPos += 15;

  doc.setFillColor(249, 249, 249);
  doc.rect(20, yPos - 5, 170, 25, "F");

  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, "bold");
  doc.text("PAYMENT INFORMATION", 25, yPos);

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);

  yPos += 6;
  doc.text("Payment Method:", 25, yPos);
  doc.setTextColor(...darkGray);
  doc.text("QRIS", 70, yPos);

  yPos += 5;
  doc.setTextColor(...lightGray);
  doc.text("Payment Status:", 25, yPos);

  const statusColor =
    order.payment_status === "paid" ? [16, 185, 129] : [245, 158, 11];
  doc.setTextColor(...statusColor);
  doc.setFont(undefined, "bold");
  doc.text(order.payment_status === "paid" ? "PAID" : "PENDING", 70, yPos);

  if (order.paid_at) {
    yPos += 5;
    doc.setFont(undefined, "normal");
    doc.setTextColor(...lightGray);
    doc.text("Paid At:", 25, yPos);
    doc.setTextColor(...darkGray);
    doc.text(formatDate(order.paid_at), 70, yPos);
  }

  // ============================================
  // FOOTER
  // ============================================
  yPos += 20;

  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.setFont(undefined, "normal");
  doc.text("Terimakasih telah memilih MomCha!", 105, yPos, { align: "center" });

  yPos += 4;
  doc.setFontSize(8);
  doc.text(
    "For questions, please contact us at Instagram @momcha.id or +62 812-3456-7890",
    105,
    yPos,
    { align: "center" },
  );

  // ============================================
  // SAVE PDF
  // ============================================
  doc.save(`Invoice-${order.order_number}.pdf`);
}
