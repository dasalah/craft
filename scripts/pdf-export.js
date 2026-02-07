// Advanced PDF Export with Preview

class PDFExporter {
  constructor() {
    this.checkLibraries();
  }

  checkLibraries() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      console.warn('jsPDF library not loaded');
    }
  }

  async generatePDF(scheduleData, options = {}) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add font support for Persian
      await this.addPersianFont(doc);

      // Add header
      await this.addHeader(doc);

      // Add schedule table
      this.addScheduleTable(doc, scheduleData);

      // Add footer
      this.addFooter(doc);

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async addHeader(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo if available
    const logoImg = document.getElementById('appLogo');
    if (logoImg) {
      try {
        const canvas = await this.imageToCanvas(logoImg);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', pageWidth - 40, 10, 30, 30);
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }
    }

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(27, 58, 82); // Navy blue
    doc.text('برنامه کلاسی هفتگی', pageWidth / 2, 20, { align: 'center' });

    // Add student info
    if (window.studentInfo && window.studentInfo.isComplete()) {
      const info = window.studentInfo.get();
      doc.setFontSize(12);
      doc.setTextColor(101, 119, 134);
      
      let yPos = 30;
      doc.text(`نام: ${info.firstName} ${info.lastName}`, 15, yPos);
      
      yPos += 6;
      doc.text(`شماره دانشجویی: ${info.studentId}`, 15, yPos);
      
      if (info.major) {
        yPos += 6;
        doc.text(`رشته: ${info.major}`, 15, yPos);
      }
      
      if (info.semester) {
        yPos += 6;
        doc.text(`ترم: ${info.semester}`, 15, yPos);
      }
    }

    // Add separator line
    doc.setDrawColor(201, 169, 97); // Gold
    doc.setLineWidth(0.5);
    doc.line(15, 50, pageWidth - 15, 50);
  }

  addScheduleTable(doc, scheduleData) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const startY = 60;
    
    // Table headers
    const days = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
    const headers = ['روز', 'ساعت', 'درس', 'استاد', 'کلاس', 'امتحان'];
    
    // Prepare table data
    const tableData = [];
    scheduleData.forEach((dayClasses, dayIndex) => {
      dayClasses.forEach(classInfo => {
        if (classInfo.subject) {
          tableData.push([
            days[dayIndex],
            classInfo.time || '',
            classInfo.subject || '',
            classInfo.teacher || '',
            classInfo.room || '',
            classInfo.exam || ''
          ]);
        }
      });
    });

    // Draw table using autoTable if available
    if (doc.autoTable) {
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: startY,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 3,
          halign: 'center'
        },
        headStyles: {
          fillColor: [27, 58, 82], // Navy
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 15, right: 15 }
      });
    } else {
      // Fallback: simple table drawing
      this.drawSimpleTable(doc, headers, tableData, startY);
    }
  }

  drawSimpleTable(doc, headers, data, startY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidth = (pageWidth - 30) / headers.length;
    let y = startY;

    // Draw headers
    doc.setFillColor(27, 58, 82);
    doc.rect(15, y, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, 15 + (i * colWidth) + (colWidth / 2), y + 5, { align: 'center' });
    });

    // Draw data rows
    y += 8;
    doc.setTextColor(0, 0, 0);
    data.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(15, y, pageWidth - 30, 8, 'F');
      }
      
      row.forEach((cell, i) => {
        doc.text(String(cell), 15 + (i * colWidth) + (colWidth / 2), y + 5, { align: 'center' });
      });
      y += 8;
    });
  }

  addFooter(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(9);
    doc.setTextColor(101, 119, 134);
    
    // Date
    const date = new Date();
    const persianDate = this.toPersianDate(date);
    doc.text(`تاریخ تولید: ${persianDate}`, 15, pageHeight - 10);
    
    // Organization name
    doc.text('انجمن علمی هوش مصنوعی دانشگاه سیستان و بلوچستان', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Page number
    doc.text('صفحه ۱', pageWidth - 15, pageHeight - 10, { align: 'right' });
  }

  async addPersianFont(doc) {
    // Note: For proper Persian support, you need to add a Persian font
    // This is a placeholder - in production, you'd load Vazirmatn font
    doc.setFont('helvetica');
  }

  async imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  toPersianDate(date) {
    // Simple date formatting - in production, use a proper Persian calendar library
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fa-IR', options);
  }

  async showPreview(scheduleData) {
    const doc = await this.generatePDF(scheduleData);
    
    // Generate blob URL for preview
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Show preview modal
    const modal = document.getElementById('pdfPreviewModal');
    const iframe = document.getElementById('pdfPreviewFrame');
    
    if (modal && iframe) {
      iframe.src = pdfUrl;
      modal.style.display = 'block';
      
      // Store for download
      modal.dataset.pdfUrl = pdfUrl;
    }
  }

  async download(scheduleData, filename) {
    const doc = await this.generatePDF(scheduleData);
    
    if (!filename) {
      const info = window.studentInfo ? window.studentInfo.get() : {};
      const date = new Date().toISOString().split('T')[0];
      filename = info.lastName 
        ? `برنامه_کلاسی_${info.lastName}_${date}.pdf`
        : `برنامه_کلاسی_${date}.pdf`;
    }
    
    doc.save(filename);
  }
}

// Initialize PDF exporter
const pdfExporter = new PDFExporter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFExporter;
}
