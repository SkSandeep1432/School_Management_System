package com.school.admin.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Map;

@Service
public class ReceiptPdfService {

    private static final DeviceRgb PRIMARY    = new DeviceRgb(26,  35,  126);   // #1a237e
    private static final DeviceRgb ACCENT     = new DeviceRgb(63,  81,  181);   // #3f51b5
    private static final DeviceRgb GREEN_DARK = new DeviceRgb(27,  94,  32);    // #1b5e20
    private static final DeviceRgb GREEN_LIGHT= new DeviceRgb(232, 245, 233);   // #e8f5e9
    private static final DeviceRgb LABEL_BG   = new DeviceRgb(240, 242, 255);   // light indigo
    private static final DeviceRgb DIVIDER    = new DeviceRgb(200, 200, 220);

    public byte[] generateReceiptPdf(Map<String, Object> payment,
                                     String studentName,
                                     String rollNumber,
                                     String className,
                                     String sectionName) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf   = new PdfDocument(writer);
            Document doc      = new Document(pdf, PageSize.A5);
            doc.setMargins(36, 44, 36, 44);

            PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italic  = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // ── School Header ──────────────────────────────────────────
            doc.add(new Paragraph("🎓 School Administration System")
                    .setFont(bold).setFontSize(16).setFontColor(PRIMARY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(2));

            doc.add(new Paragraph("Management System")
                    .setFont(italic).setFontSize(9).setFontColor(ACCENT)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(10));

            // ── "PAYMENT RECEIPT" banner ───────────────────────────────
            doc.add(new Paragraph("PAYMENT RECEIPT")
                    .setFont(bold).setFontSize(11).setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBackgroundColor(PRIMARY)
                    .setPaddingTop(8).setPaddingBottom(8)
                    .setMarginBottom(10));

            // ── Receipt number ────────────────────────────────────────
            String receiptNo = str(payment.get("receiptNumber"));
            doc.add(new Paragraph("Receipt No:  " + receiptNo)
                    .setFont(bold).setFontSize(9).setFontColor(ACCENT)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(14));

            doc.add(new LineSeparator(new SolidLine(0.5f)).setMarginBottom(12));

            // ── Detail table ──────────────────────────────────────────
            Table tbl = new Table(new float[]{2, 3})
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(12);

            addRow(tbl, "Student Name",  studentName,  bold, regular);
            addRow(tbl, "Roll Number",   rollNumber,   bold, regular);
            addRow(tbl, "Class",         "Class " + className + (sectionName != null ? sectionName : ""), bold, regular);
            addRow(tbl, "Academic Year", str(payment.get("academicYear")),  bold, regular);
            addRow(tbl, "Payment Date",  str(payment.get("paymentDate")),   bold, regular);
            addRow(tbl, "Payment Mode",  str(payment.get("paymentMode")),   bold, regular);

            String notes = str(payment.get("notes"));
            if (!notes.isBlank()) addRow(tbl, "Notes", notes, bold, regular);

            doc.add(tbl);

            doc.add(new LineSeparator(new SolidLine(0.5f)).setMarginBottom(12));

            // ── Amount paid box ───────────────────────────────────────
            double amount = parseDouble(payment.get("amount"));
            Table amtTbl = new Table(new float[]{1, 1})
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            amtTbl.addCell(new Cell()
                    .add(new Paragraph("Amount Paid")
                            .setFont(bold).setFontSize(13).setFontColor(GREEN_DARK))
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(GREEN_LIGHT)
                    .setPadding(10));
            amtTbl.addCell(new Cell()
                    .add(new Paragraph(String.format("\u20B9%.0f", amount))
                            .setFont(bold).setFontSize(15).setFontColor(GREEN_DARK)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(GREEN_LIGHT)
                    .setPadding(10)
                    .setTextAlignment(TextAlignment.RIGHT));
            doc.add(amtTbl);

            // ── Thank-you note ────────────────────────────────────────
            doc.add(new Paragraph("Thank you for your timely payment! \uD83D\uDE4F")
                    .setFont(bold).setFontSize(10).setFontColor(GREEN_DARK)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(6));

            doc.add(new Paragraph("This is a computer-generated receipt and does not require a signature.")
                    .setFont(regular).setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(14));

            // ── Footer ────────────────────────────────────────────────
            doc.add(new LineSeparator(new SolidLine(0.3f)).setMarginBottom(6));
            doc.add(new Paragraph("School Administration System  |  Generated on " + LocalDate.now())
                    .setFont(italic).setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    // ── helper: add one row to detail table ──────────────────────────
    private void addRow(Table table, String label, String value, PdfFont boldFont, PdfFont regularFont) {
        DashedBorder divider = new DashedBorder(DIVIDER, 0.5f);

        table.addCell(new Cell()
                .add(new Paragraph(label)
                        .setFont(boldFont).setFontSize(9)
                        .setFontColor(new DeviceRgb(80, 80, 80)))
                .setBorderTop(Border.NO_BORDER)
                .setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER)
                .setBorderBottom(divider)
                .setPadding(7)
                .setBackgroundColor(LABEL_BG));

        table.addCell(new Cell()
                .add(new Paragraph(value != null ? value : "-")
                        .setFont(regularFont).setFontSize(9)
                        .setTextAlignment(TextAlignment.RIGHT))
                .setBorderTop(Border.NO_BORDER)
                .setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER)
                .setBorderBottom(divider)
                .setPadding(7));
    }

    private String str(Object o) { return o != null ? o.toString() : ""; }
    private double parseDouble(Object o) {
        try { return o != null ? Double.parseDouble(o.toString()) : 0.0; } catch (Exception e) { return 0.0; }
    }
}
