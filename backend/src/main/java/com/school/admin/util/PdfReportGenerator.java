package com.school.admin.util;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.school.admin.dto.response.MarksResponse;
import com.school.admin.dto.response.ReportCardResponse;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class PdfReportGenerator {

    public byte[] generateReportCard(ReportCardResponse reportCard) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            PdfFont bold;
            PdfFont normal;
            try {
                bold = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
                normal = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            } catch (IOException e) {
                bold = null;
                normal = null;
            }

            // School name header
            Paragraph schoolHeader = new Paragraph("SCHOOL ADMINISTRATION SYSTEM")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(20);
            if (bold != null) schoolHeader.setFont(bold);
            document.add(schoolHeader);

            // Report Card subtitle
            Paragraph subtitle = new Paragraph("Report Card")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(14);
            if (normal != null) subtitle.setFont(normal);
            document.add(subtitle);

            document.add(new Paragraph("\n"));

            // Student info table
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 1, 2}))
                    .setWidth(UnitValue.createPercentValue(100));

            addInfoCell(infoTable, "Student Name:", bold);
            addInfoCell(infoTable, reportCard.studentName() != null ? reportCard.studentName() : "", normal);
            addInfoCell(infoTable, "Roll No:", bold);
            addInfoCell(infoTable, reportCard.rollNumber() != null ? reportCard.rollNumber() : "", normal);

            addInfoCell(infoTable, "Class:", bold);
            addInfoCell(infoTable, reportCard.className() != null ? reportCard.className() : "", normal);
            addInfoCell(infoTable, "Section:", bold);
            addInfoCell(infoTable, reportCard.sectionName() != null ? reportCard.sectionName() : "", normal);

            addInfoCell(infoTable, "Exam:", bold);
            addInfoCell(infoTable, reportCard.examName() != null ? reportCard.examName() : "", normal);
            addInfoCell(infoTable, "Academic Year:", bold);
            addInfoCell(infoTable, reportCard.academicYear() != null ? reportCard.academicYear() : "", normal);

            document.add(infoTable);
            document.add(new Paragraph("\n"));

            // Marks table
            Paragraph marksHeader = new Paragraph("Marks Details")
                    .setFontSize(13);
            if (bold != null) marksHeader.setFont(bold);
            document.add(marksHeader);

            Table marksTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 1}))
                    .setWidth(UnitValue.createPercentValue(100));

            // Header row
            addTableHeaderCell(marksTable, "Subject", bold);
            addTableHeaderCell(marksTable, "Max Marks", bold);
            addTableHeaderCell(marksTable, "Marks Obtained", bold);
            addTableHeaderCell(marksTable, "Grade", bold);

            // Subject rows
            if (reportCard.subjectMarks() != null) {
                for (MarksResponse mark : reportCard.subjectMarks()) {
                    addTableDataCell(marksTable, mark.subjectName() != null ? mark.subjectName() : "", normal);
                    addTableDataCell(marksTable, mark.maxMarks() != null ? mark.maxMarks().toPlainString() : "100", normal);
                    addTableDataCell(marksTable, mark.marksObtained() != null ? mark.marksObtained().toPlainString() : "0", normal);
                    addTableDataCell(marksTable, mark.grade() != null ? mark.grade() : "", normal);
                }
            }

            // Totals row
            Cell totalLabelCell = new Cell()
                    .add(new Paragraph("Total").setFont(bold != null ? bold : PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD)))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY);
            marksTable.addCell(totalLabelCell);

            Cell maxTotalCell = new Cell()
                    .add(new Paragraph(String.valueOf(reportCard.maxTotalMarks())))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY);
            marksTable.addCell(maxTotalCell);

            Cell obtainedTotalCell = new Cell()
                    .add(new Paragraph(String.valueOf(reportCard.totalMarks())))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY);
            marksTable.addCell(obtainedTotalCell);

            Cell overallGradeCell = new Cell()
                    .add(new Paragraph(reportCard.overallGrade() != null ? reportCard.overallGrade() : ""))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY);
            marksTable.addCell(overallGradeCell);

            // Percentage row
            marksTable.addCell(new Cell(1, 2)
                    .add(new Paragraph("Percentage").setFont(bold != null ? bold : PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD))));
            marksTable.addCell(new Cell(1, 2)
                    .add(new Paragraph(reportCard.percentage() + "%")));

            document.add(marksTable);
            document.add(new Paragraph("\n"));

            // Attendance section
            Paragraph attendanceHeader = new Paragraph("Attendance Summary")
                    .setFontSize(13);
            if (bold != null) attendanceHeader.setFont(bold);
            document.add(attendanceHeader);

            if (reportCard.attendanceSummary() != null) {
                Table attendanceTable = new Table(UnitValue.createPercentArray(new float[]{2, 1, 2, 1}))
                        .setWidth(UnitValue.createPercentValue(100));

                addInfoCell(attendanceTable, "Present Days:", bold);
                addInfoCell(attendanceTable, String.valueOf(reportCard.attendanceSummary().presentDays()), normal);
                addInfoCell(attendanceTable, "Total Days:", bold);
                addInfoCell(attendanceTable, String.valueOf(reportCard.attendanceSummary().totalDays()), normal);

                addInfoCell(attendanceTable, "Absent Days:", bold);
                addInfoCell(attendanceTable, String.valueOf(reportCard.attendanceSummary().absentDays()), normal);
                addInfoCell(attendanceTable, "Attendance %:", bold);
                addInfoCell(attendanceTable, String.format("%.2f%%", reportCard.attendanceSummary().percentage()), normal);

                document.add(attendanceTable);
            }

            document.add(new Paragraph("\n\n"));

            // Footer
            Paragraph footer = new Paragraph("Generated by School Administration System")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(9)
                    .setFontColor(ColorConstants.GRAY);
            document.add(footer);

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addInfoCell(Table table, String text, PdfFont font) {
        try {
            Paragraph p = new Paragraph(text);
            if (font != null) p.setFont(font);
            table.addCell(new Cell().add(p));
        } catch (Exception e) {
            table.addCell(new Cell().add(new Paragraph(text)));
        }
    }

    private void addTableHeaderCell(Table table, String text, PdfFont font) {
        try {
            Paragraph p = new Paragraph(text);
            if (font != null) p.setFont(font);
            Cell cell = new Cell()
                    .add(p)
                    .setBackgroundColor(ColorConstants.DARK_GRAY)
                    .setFontColor(ColorConstants.WHITE);
            table.addHeaderCell(cell);
        } catch (Exception e) {
            table.addHeaderCell(new Cell().add(new Paragraph(text)));
        }
    }

    private void addTableDataCell(Table table, String text, PdfFont font) {
        try {
            Paragraph p = new Paragraph(text);
            if (font != null) p.setFont(font);
            table.addCell(new Cell().add(p));
        } catch (Exception e) {
            table.addCell(new Cell().add(new Paragraph(text)));
        }
    }
}
