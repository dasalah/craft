// Student Information Management

class StudentInfo {
  constructor() {
    this.storageKey = 'studentInfo';
    this.loadStudentInfo();
  }

  loadStudentInfo() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = {
        firstName: '',
        lastName: '',
        studentId: '',
        major: '',
        semester: ''
      };
    }
    return this.data;
  }

  save(data) {
    this.data = { ...this.data, ...data };
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    this.updateDisplay();
  }

  get() {
    return this.data;
  }

  isComplete() {
    return this.data.firstName && this.data.lastName && this.data.studentId;
  }

  updateDisplay() {
    const headerName = document.getElementById('headerStudentName');
    if (headerName && this.data.firstName && this.data.lastName) {
      headerName.textContent = `${this.data.firstName} ${this.data.lastName}`;
    }

    const headerInfo = document.getElementById('headerStudentInfo');
    if (headerInfo && this.data.studentId) {
      let infoText = `شماره دانشجویی: ${this.data.studentId}`;
      if (this.data.major) {
        infoText += ` | رشته: ${this.data.major}`;
      }
      if (this.data.semester) {
        infoText += ` | ترم: ${this.data.semester}`;
      }
      headerInfo.textContent = infoText;
    }
  }

  showInfoModal() {
    const modal = document.getElementById('studentInfoModal');
    if (modal) {
      // Fill form with current data
      document.getElementById('studentFirstName').value = this.data.firstName || '';
      document.getElementById('studentLastName').value = this.data.lastName || '';
      document.getElementById('studentId').value = this.data.studentId || '';
      document.getElementById('studentMajor').value = this.data.major || '';
      document.getElementById('studentSemester').value = this.data.semester || '';
      
      modal.style.display = 'block';
    }
  }

  clear() {
    this.data = {
      firstName: '',
      lastName: '',
      studentId: '',
      major: '',
      semester: ''
    };
    localStorage.removeItem(this.storageKey);
    this.updateDisplay();
  }
}

// Initialize student info
const studentInfo = new StudentInfo();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudentInfo;
}
