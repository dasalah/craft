// Share Schedule Functionality

class ShareManager {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  generateShareLink(scheduleData) {
    try {
      // Encode schedule data
      const encoded = this.encodeData(scheduleData);
      
      // Create share URL
      const shareUrl = `${this.baseUrl}?schedule=${encoded}`;
      
      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      return null;
    }
  }

  encodeData(data) {
    // Convert to JSON and encode to base64
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  }

  decodeData(encoded) {
    try {
      const decoded = decodeURIComponent(atob(encoded));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding share data:', error);
      return null;
    }
  }

  loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheduleParam = urlParams.get('schedule');
    
    if (scheduleParam) {
      const scheduleData = this.decodeData(scheduleParam);
      if (scheduleData) {
        return scheduleData;
      }
    }
    
    return null;
  }

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  generateQRCode(text) {
    // Generate QR code if QRCode library is available
    if (typeof QRCode !== 'undefined') {
      const qrContainer = document.getElementById('qrCodeContainer');
      if (qrContainer) {
        qrContainer.innerHTML = ''; // Clear previous QR code
        
        const qr = new QRCode(qrContainer, {
          text: text,
          width: 256,
          height: 256,
          colorDark: '#1B3A52',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        
        return true;
      }
    }
    return false;
  }

  async share(scheduleData) {
    const shareUrl = this.generateShareLink(scheduleData);
    
    if (!shareUrl) {
      alert('خطا در ایجاد لینک اشتراک‌گذاری');
      return;
    }

    // Show share modal
    const modal = document.getElementById('shareModal');
    const linkInput = document.getElementById('shareLinkInput');
    
    if (modal && linkInput) {
      linkInput.value = shareUrl;
      modal.style.display = 'block';
      
      // Generate QR code
      this.generateQRCode(shareUrl);
    }

    // Try native share API if available
    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'برنامه کلاسی من',
          text: 'برنامه کلاسی هفتگی',
          url: shareUrl
        });
      } catch (error) {
        // User cancelled or error - modal is already shown
        console.log('Share cancelled or failed:', error);
      }
    }
  }

  async copyShareLink() {
    const linkInput = document.getElementById('shareLinkInput');
    if (linkInput) {
      const success = await this.copyToClipboard(linkInput.value);
      
      if (success) {
        this.showNotification('لینک کپی شد!', 'success');
        
        // Visual feedback
        const copyBtn = document.getElementById('copyShareLinkBtn');
        if (copyBtn) {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = '✓ کپی شد';
          copyBtn.style.background = '#2ECC71';
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
          }, 2000);
        }
      } else {
        this.showNotification('خطا در کپی کردن لینک', 'error');
      }
    }
  }

  showNotification(message, type = 'info') {
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      // Fallback
      console.log(`${type}: ${message}`);
      alert(message);
    }
  }

  // Check if there's shared data on page load
  init() {
    const sharedData = this.loadFromUrl();
    if (sharedData) {
      // Show confirmation before loading
      const shouldLoad = confirm('آیا می‌خواهید برنامه کلاسی اشتراک‌گذاری شده را بارگذاری کنید؟\nاین عمل داده‌های فعلی شما را جایگزین خواهد کرد.');
      
      if (shouldLoad) {
        return sharedData;
      }
    }
    return null;
  }
}

// Initialize share manager
const shareManager = new ShareManager();

// Check for shared schedule on page load
document.addEventListener('DOMContentLoaded', () => {
  const sharedSchedule = shareManager.init();
  if (sharedSchedule && typeof loadScheduleData === 'function') {
    loadScheduleData(sharedSchedule);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareManager;
}
