// Class Schedule Application - Main Controller
// Manages schedule data, UI interactions, and integrations

class ScheduleApp {
  constructor() {
    this.schedule = [];
    this.currentFilter = 'all';
    this.currentCategory = 'all';
    this.storageKey = 'classSchedule';
    this.editingClassId = null;
    this.days = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    this.categories = {
      math: { name: 'ریاضی', color: '#3498DB' },
      physics: { name: 'فیزیک', color: '#E74C3C' },
      programming: { name: 'برنامه‌نویسی', color: '#2ECC71' },
      lab: { name: 'آزمایشگاه', color: '#9B59B6' },
      general: { name: 'عمومی', color: '#95A5A6' }
    };
  }

  // Initialize application
  init() {
    this.loadSchedule();
    this.checkStudentInfo();
    this.renderSchedule();
    this.updateStats();
    this.attachEventListeners();
    this.checkSharedSchedule();
    this.applyTheme();
  }

  // Data Management
  loadSchedule() {
    const data = localStorage.getItem(this.storageKey);
    this.schedule = data ? JSON.parse(data) : [];
  }

  saveSchedule() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.schedule));
  }

  // Check if student info exists
  checkStudentInfo() {
    if (window.studentInfo && !window.studentInfo.hasInfo()) {
      this.showModal('studentInfoModal');
    }
  }

  // Check for shared schedule from URL
  checkSharedSchedule() {
    if (window.shareManager) {
      window.shareManager.checkSharedSchedule();
    }
  }

  // Apply saved theme
  applyTheme() {
    if (window.themeManager) {
      window.themeManager.init();
    }
  }

  // Schedule Display Functions
  renderSchedule() {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;

    let classes = this.schedule;

    // Apply filters
    if (this.currentFilter !== 'all') {
      classes = classes.filter(c => c.day === this.currentFilter);
    }

    if (this.currentCategory !== 'all') {
      classes = classes.filter(c => c.category === this.currentCategory);
    }

    // Sort classes
    classes = this.sortClasses(classes);

    // Render
    if (classes.length === 0) {
      container.innerHTML = this.getEmptyState();
    } else {
      container.innerHTML = classes.map(c => this.createClassCard(c)).join('');
    }

    this.updateStats();
  }

  renderDaySchedule(day) {
    this.currentFilter = day;
    this.currentCategory = 'all';
    this.updateFilterButtons();
    this.renderSchedule();
  }

  createClassCard(classData) {
    const category = this.categories[classData.category] || this.categories.general;
    const color = classData.color || category.color;
    
    return `
      <div class="class-card animate-slide-up" data-category="${classData.category}" data-id="${classData.id}" style="border-left: 4px solid ${color}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${this.escapeHtml(classData.subject)}</h3>
            <p class="card-subtitle">${this.escapeHtml(classData.teacher)}</p>
          </div>
          <div class="card-actions">
            <button class="card-action-btn" onclick="app.editClass('${classData.id}')" title="ویرایش">
              ✏️
            </button>
            <button class="card-action-btn" onclick="app.deleteClass('${classData.id}')" title="حذف">
              🗑️
            </button>
          </div>
        </div>
        <div class="card-body">
          <p>📅 ${classData.day} | ⏰ ${classData.time}</p>
          <p>🏫 کلاس: ${this.escapeHtml(classData.room)}</p>
          ${classData.exam ? `<p>📝 امتحان: ${this.escapeHtml(classData.exam)}</p>` : ''}
          <span class="category-badge" style="background-color: ${color}20; color: ${color}">
            ${category.name}
          </span>
        </div>
      </div>
    `;
  }

  getEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>هنوز کلاسی اضافه نشده</h3>
        <p>برای شروع، روی دکمه "افزودن کلاس جدید" کلیک کنید</p>
      </div>
    `;
  }

  // CRUD Operations
  addClass(classData) {
    const newClass = {
      id: this.generateId(),
      ...classData,
      color: classData.color || this.categories[classData.category]?.color || '#95A5A6'
    };

    this.schedule.push(newClass);
    this.saveSchedule();
    this.renderSchedule();
    this.showNotification('کلاس با موفقیت اضافه شد', 'success');
  }

  editClass(id) {
    const classData = this.schedule.find(c => c.id === id);
    if (!classData) return;

    this.editingClassId = id;
    this.populateEditForm(classData);
    this.showModal('addClassModal');
  }

  updateClass(id, classData) {
    const index = this.schedule.findIndex(c => c.id === id);
    if (index === -1) return;

    this.schedule[index] = {
      ...this.schedule[index],
      ...classData,
      color: classData.color || this.categories[classData.category]?.color || '#95A5A6'
    };

    this.saveSchedule();
    this.renderSchedule();
    this.showNotification('کلاس با موفقیت ویرایش شد', 'success');
  }

  deleteClass(id) {
    if (!confirm('آیا از حذف این کلاس اطمینان دارید؟')) return;

    this.schedule = this.schedule.filter(c => c.id !== id);
    this.saveSchedule();
    this.renderSchedule();
    this.showNotification('کلاس با موفقیت حذف شد', 'info');
  }

  clearAllClasses() {
    if (!confirm('آیا از حذف تمام کلاس‌ها اطمینان دارید؟ این عملیات قابل بازگشت نیست!')) return;

    this.schedule = [];
    this.saveSchedule();
    this.renderSchedule();
    this.showNotification('تمام کلاس‌ها حذف شدند', 'info');
  }

  // Modal Management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  populateEditForm(classData) {
    const form = document.getElementById('addClassForm');
    if (!form) return;

    form.querySelector('[name="day"]').value = classData.day;
    form.querySelector('[name="time"]').value = classData.time;
    form.querySelector('[name="subject"]').value = classData.subject;
    form.querySelector('[name="teacher"]').value = classData.teacher;
    form.querySelector('[name="room"]').value = classData.room;
    form.querySelector('[name="exam"]').value = classData.exam || '';
    form.querySelector('[name="category"]').value = classData.category;
    
    const colorInput = form.querySelector('[name="color"]');
    if (colorInput) {
      colorInput.value = classData.color;
    }

    const modalTitle = document.querySelector('#addClassModal .modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'ویرایش کلاس';
    }
  }

  resetClassForm() {
    const form = document.getElementById('addClassForm');
    if (form) {
      form.reset();
      this.editingClassId = null;
      
      const modalTitle = document.querySelector('#addClassModal .modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'افزودن کلاس جدید';
      }
    }
  }

  // Event Handlers
  attachEventListeners() {
    // Add class button
    const addClassBtn = document.getElementById('addClassBtn');
    if (addClassBtn) {
      addClassBtn.addEventListener('click', () => {
        this.resetClassForm();
        this.showModal('addClassModal');
      });
    }

    // Class form submit
    const classForm = document.getElementById('addClassForm');
    if (classForm) {
      classForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleClassFormSubmit(e);
      });
    }

    // Student info form
    const studentForm = document.getElementById('studentInfoForm');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleStudentInfoSubmit(e);
      });
    }

    // Day filter buttons
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.target.dataset.day;
        this.renderDaySchedule(day);
      });
    });

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.renderSchedule();
      });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Export buttons
    const pdfBtn = document.getElementById('exportPdfBtn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => this.exportToPDF());
    }

    const previewPdfBtn = document.getElementById('previewPdfBtn');
    if (previewPdfBtn) {
      previewPdfBtn.addEventListener('click', () => this.previewPDF());
    }

    const excelBtn = document.getElementById('exportExcelBtn');
    if (excelBtn) {
      excelBtn.addEventListener('click', () => this.exportToExcel());
    }

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareSchedule());
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllClasses());
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && window.themeManager) {
      themeToggle.addEventListener('click', () => {
        window.themeManager.toggleTheme();
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          const modal = el.closest('.modal');
          if (modal) {
            this.hideModal(modal.id);
          }
        }
      });
    });

    // Category change updates color
    const categorySelect = document.querySelector('[name="category"]');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        const colorInput = document.querySelector('[name="color"]');
        if (colorInput && !this.editingClassId) {
          const category = this.categories[e.target.value];
          if (category) {
            colorInput.value = category.color;
          }
        }
      });
    }
  }

  handleClassFormSubmit(e) {
    const formData = new FormData(e.target);
    const classData = {
      day: formData.get('day'),
      time: formData.get('time'),
      subject: formData.get('subject'),
      teacher: formData.get('teacher'),
      room: formData.get('room'),
      exam: formData.get('exam'),
      category: formData.get('category'),
      color: formData.get('color')
    };

    // Validate
    if (!classData.day || !classData.time || !classData.subject || !classData.teacher || !classData.room) {
      this.showNotification('لطفاً تمام فیلدهای الزامی را پر کنید', 'error');
      return;
    }

    if (this.editingClassId) {
      this.updateClass(this.editingClassId, classData);
    } else {
      this.addClass(classData);
    }

    this.hideModal('addClassModal');
    this.resetClassForm();
  }

  handleStudentInfoSubmit(e) {
    const formData = new FormData(e.target);
    const studentData = {
      name: formData.get('name'),
      studentId: formData.get('studentId'),
      major: formData.get('major'),
      semester: formData.get('semester')
    };

    if (window.studentInfo) {
      window.studentInfo.save(studentData);
      this.hideModal('studentInfoModal');
      this.showNotification('اطلاعات دانشجو ذخیره شد', 'success');
    }
  }

  handleSearch(query) {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;

    if (!query.trim()) {
      this.renderSchedule();
      return;
    }

    const filtered = this.schedule.filter(c => 
      c.subject.includes(query) || 
      c.teacher.includes(query) ||
      c.room.includes(query)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>نتیجه‌ای یافت نشد</h3>
          <p>جستجوی دیگری را امتحان کنید</p>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map(c => this.createClassCard(c)).join('');
    }
  }

  // Statistics Calculation
  updateStats() {
    const totalClasses = this.schedule.length;
    const totalHours = this.calculateTotalHours();
    const todayClasses = this.getTodayClasses();

    const totalClassesEl = document.getElementById('totalClasses');
    const totalHoursEl = document.getElementById('totalHours');
    const todayClassesEl = document.getElementById('todayClasses');

    if (totalClassesEl) totalClassesEl.textContent = totalClasses;
    if (totalHoursEl) totalHoursEl.textContent = totalHours;
    if (todayClassesEl) todayClassesEl.textContent = todayClasses;
  }

  calculateTotalHours() {
    return this.schedule.reduce((total, classData) => {
      return total + this.calculateDuration(classData.time);
    }, 0);
  }

  getTodayClasses() {
    const today = this.getCurrentDay();
    return this.schedule.filter(c => c.day === today).length;
  }

  // Export Functions
  exportToPDF() {
    if (window.pdfExporter) {
      window.pdfExporter.export(this.schedule);
    } else {
      this.showNotification('امکان خروجی PDF در حال حاضر موجود نیست', 'error');
    }
  }

  previewPDF() {
    if (window.pdfExporter && window.pdfExporter.showPreview) {
      window.pdfExporter.showPreview(this.schedule);
    } else {
      this.exportToPDF();
    }
  }

  exportToExcel() {
    if (window.excelExporter) {
      window.excelExporter.export(this.schedule);
    } else {
      this.showNotification('امکان خروجی Excel در حال حاضر موجود نیست', 'error');
    }
  }

  shareSchedule() {
    if (window.shareManager) {
      window.shareManager.share(this.schedule);
    } else {
      this.showNotification('امکان اشتراک‌گذاری در حال حاضر موجود نیست', 'error');
    }
  }

  // Utility Functions
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slide-up`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  generateId() {
    return 'class_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateDuration(timeSlot) {
    if (!timeSlot || !timeSlot.includes('-')) return 0;
    
    const [start, end] = timeSlot.split('-').map(t => t.trim());
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return (endMinutes - startMinutes) / 60;
  }

  getCurrentDay() {
    const dayIndex = new Date().getDay();
    // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Persian: Saturday=شنبه (0), Sunday=یک‌شنبه (1), ..., Friday=جمعه (6)
    const persianDayIndex = (dayIndex + 1) % 7;
    return this.days[persianDayIndex];
  }

  sortClasses(classes) {
    return classes.sort((a, b) => {
      // Sort by day first
      const dayCompare = this.days.indexOf(a.day) - this.days.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;

      // Then by time
      const aTime = a.time.split('-')[0].trim();
      const bTime = b.time.split('-')[0].trim();
      return aTime.localeCompare(bTime);
    });
  }

  updateFilterButtons() {
    document.querySelectorAll('.day-btn').forEach(btn => {
      if (btn.dataset.day === this.currentFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Import schedule (for share functionality)
  importSchedule(scheduleData) {
    if (!Array.isArray(scheduleData)) return;

    if (confirm('آیا می‌خواهید برنامه کلاسی جدید را جایگزین برنامه فعلی کنید؟')) {
      this.schedule = scheduleData;
      this.saveSchedule();
      this.renderSchedule();
      this.showNotification('برنامه کلاسی با موفقیت وارد شد', 'success');
    }
  }

  // Get schedule for export/share
  getSchedule() {
    return this.schedule;
  }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new ScheduleApp();
  app.init();
});

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.scheduleApp = app;
}
