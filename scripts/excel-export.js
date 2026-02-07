// Excel Export using SheetJS

class ExcelExporter {
  constructor() {
    this.checkLibrary();
  }

  checkLibrary() {
    if (typeof XLSX === 'undefined') {
      console.warn('SheetJS library not loaded. Excel export will not work.');
    }
  }

  exportSchedule(scheduleData, studentInfo) {
    if (typeof XLSX === 'undefined') {
      alert('کتابخانه Excel بارگذاری نشده است. لطفاً صفحه را رفرش کنید.');
      return;
    }

    try {
      // Prepare data for Excel
      const data = this.prepareData(scheduleData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // روز
        { wch: 15 }, // ساعت
        { wch: 25 }, // نام درس
        { wch: 20 }, // استاد
        { wch: 15 }, // کلاس
        { wch: 15 }  // امتحان
      ];
      
      // Add styling (if available in pro version)
      this.styleWorksheet(ws);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'برنامه کلاسی');
      
      // Generate filename
      const filename = this.generateFilename(studentInfo);
      
      // Write file
      XLSX.writeFile(wb, filename);
      
      this.showNotification('فایل Excel با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('خطا در ایجاد فایل Excel');
    }
  }

  prepareData(scheduleData) {
    const data = [];
    
    // Add header rows
    data.push(['برنامه کلاسی هفتگی']);
    data.push([]); // Empty row
    
    // Add student info if available
    if (window.studentInfo && window.studentInfo.isComplete()) {
      const info = window.studentInfo.get();
      data.push([`دانشجو: ${info.firstName} ${info.lastName}`]);
      data.push([`شماره دانشجویی: ${info.studentId}`]);
      if (info.major) data.push([`رشته: ${info.major}`]);
      if (info.semester) data.push([`ترم: ${info.semester}`]);
      data.push([]); // Empty row
    }
    
    // Add column headers
    data.push(['روز', 'ساعت', 'نام درس', 'استاد', 'کلاس', 'امتحان']);
    
    // Add schedule data
    const days = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
    
    scheduleData.forEach((dayData, dayIndex) => {
      dayData.forEach(classInfo => {
        if (classInfo.subject) {
          data.push([
            days[dayIndex] || '',
            classInfo.time || '',
            classInfo.subject || '',
            classInfo.teacher || '',
            classInfo.room || '',
            classInfo.exam || ''
          ]);
        }
      });
    });
    
    return data;
  }

  styleWorksheet(ws) {
    // Basic styling (this works with some Excel viewers)
    // For full styling, you need the pro version or custom implementation
  }

  generateFilename(studentInfo) {
    const date = new Date();
    const timestamp = date.toISOString().split('T')[0];
    
    if (studentInfo && studentInfo.lastName) {
      return `برنامه_کلاسی_${studentInfo.lastName}_${timestamp}.xlsx`;
    }
    
    return `برنامه_کلاسی_${timestamp}.xlsx`;
  }

  showNotification(message) {
    if (typeof showNotification === 'function') {
      showNotification(message, 'success');
    } else {
      console.log(message);
    }
  }
}

// Initialize exporter
const excelExporter = new ExcelExporter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExcelExporter;
}
