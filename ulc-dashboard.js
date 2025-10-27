// Dashboard JavaScript - Certificate Creation & Management
// ULC System v1.0.0

// ============================================
// STATE MANAGEMENT
// ============================================

let currentStep = 1;
let certificateData = {
    personal: {},
    education: [],
    certifications: [],
    experience: [],
    skills: [],
    generated: false
};

let qrCodeInstance = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    initializeForm();
    setupEventListeners();
    addDefaultEducation();
});

function checkUserSession() {
    const session = localStorage.getItem('ulc_session');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    
    const userData = JSON.parse(session);
    // Pre-fill some data if available
    if (userData.name) {
        document.getElementById('fullName').value = userData.name;
    }
    if (userData.email) {
        document.getElementById('email').value = userData.email;
    }
}

function initializeForm() {
    // Add default education entry
    addEducation();
    
    // Load any saved progress
    const savedData = localStorage.getItem('ulc_draft');
    if (savedData) {
        loadDraftData(JSON.parse(savedData));
    }
}

// ============================================
// STEP NAVIGATION
// ============================================

function nextStep(step) {
    if (!validateCurrentStep()) {
        return;
    }
    
    saveCurrentStep();
    currentStep = step;
    updateStepDisplay();
    updatePreview();
}

function prevStep(step) {
    saveCurrentStep();
    currentStep = step;
    updateStepDisplay();
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        const stepNum = index + 1;
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            stepEl.classList.add('active');
        } else if (stepNum < currentStep) {
            stepEl.classList.add('completed');
        }
    });
    
    // Update form steps
    document.querySelectorAll('.form-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active');
        if (index + 1 === currentStep) {
            stepEl.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const fullName = document.getElementById('fullName').value.trim();
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!fullName || !dob || !gender || !email || !phone) {
            showNotification('Please fill all required fields', 'error');
            return false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }
    }
    
    if (currentStep === 3) {
        const skills = document.getElementById('skills').value.trim();
        if (!skills) {
            showNotification('Please add at least one skill', 'error');
            return false;
        }
    }
    
    return true;
}

function saveCurrentStep() {
    if (currentStep === 1) {
        certificateData.personal = {
            fullName: document.getElementById('fullName').value.trim(),
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            bio: document.getElementById('bio').value.trim()
        };
    }
    
    if (currentStep === 2) {
        certificateData.education = collectEducation();
    }
    
    if (currentStep === 3) {
        const skillsText = document.getElementById('skills').value.trim();
        certificateData.skills = skillsText.split(',').map(s => s.trim()).filter(s => s);
        certificateData.certifications = collectCertifications();
        certificateData.experience = collectExperience();
    }
    
    // Save draft to localStorage
    localStorage.setItem('ulc_draft', JSON.stringify(certificateData));
}

// ============================================
// DYNAMIC FORM ELEMENTS
// ============================================

function addEducation() {
    const container = document.getElementById('educationList');
    const index = container.children.length;
    
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Education ${index + 1}</span>
            <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Degree / Qualification *</label>
                <input type="text" class="edu-degree" placeholder="e.g., Bachelor of Science" required>
            </div>
            <div class="form-group">
                <label>Institution *</label>
                <input type="text" class="edu-institution" placeholder="University/School Name" required>
            </div>
            <div class="form-group">
                <label>Year of Completion *</label>
                <input type="text" class="edu-year" placeholder="e.g., 2020" required>
            </div>
            <div class="form-group full-width">
                <label>Field of Study</label>
                <input type="text" class="edu-field" placeholder="e.g., Computer Science">
            </div>
            <div class="form-group full-width">
                <label>Grade / Percentage</label>
                <input type="text" class="edu-grade" placeholder="e.g., 85% or A Grade">
            </div>
        </div>
    `;
    
    container.appendChild(item);
}

function addDefaultEducation() {
    // Pre-populate with one education entry
    if (document.getElementById('educationList').children.length === 0) {
        addEducation();
    }
}

function addCertification() {
    const container = document.getElementById('certificationList');
    const index = container.children.length;
    
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Certification ${index + 1}</span>
            <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Certificate Name *</label>
                <input type="text" class="cert-name" placeholder="e.g., AWS Certified Solutions Architect" required>
            </div>
            <div class="form-group">
                <label>Issuing Organization *</label>
                <input type="text" class="cert-issuer" placeholder="e.g., Amazon Web Services" required>
            </div>
            <div class="form-group">
                <label>Date Issued</label>
                <input type="date" class="cert-date">
            </div>
            <div class="form-group full-width">
                <label>Certificate ID / URL</label>
                <input type="text" class="cert-id" placeholder="Verification ID or URL">
            </div>
        </div>
    `;
    
    container.appendChild(item);
}

function addExperience() {
    const container = document.getElementById('experienceList');
    const index = container.children.length;
    
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <div class="dynamic-item-header">
            <span class="dynamic-item-title">Experience ${index + 1}</span>
            <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Job Title / Role *</label>
                <input type="text" class="exp-title" placeholder="e.g., Software Developer" required>
            </div>
            <div class="form-group full-width">
                <label>Company / Organization *</label>
                <input type="text" class="exp-company" placeholder="Company Name" required>
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" class="exp-start">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" class="exp-end">
            </div>
            <div class="form-group full-width">
                <label>Description</label>
                <textarea class="exp-description" rows="3" placeholder="Brief description of responsibilities"></textarea>
            </div>
        </div>
    `;
    
    container.appendChild(item);
}

function removeElement(button) {
    button.closest('.dynamic-item').remove();
}

function collectEducation() {
    const items = document.querySelectorAll('#educationList .dynamic-item');
    const education = [];
    
    items.forEach(item => {
        const degree = item.querySelector('.edu-degree').value.trim();
        const institution = item.querySelector('.edu-institution').value.trim();
        const year = item.querySelector('.edu-year').value.trim();
        const field = item.querySelector('.edu-field').value.trim();
        const grade = item.querySelector('.edu-grade').value.trim();
        
        if (degree && institution && year) {
            education.push({ degree, institution, year, field, grade });
        }
    });
    
    return education;
}

function collectCertifications() {
    const items = document.querySelectorAll('#certificationList .dynamic-item');
    const certifications = [];
    
    items.forEach(item => {
        const name = item.querySelector('.cert-name').value.trim();
        const issuer = item.querySelector('.cert-issuer').value.trim();
        const date = item.querySelector('.cert-date').value;
        const certId = item.querySelector('.cert-id').value.trim();
        
        if (name && issuer) {
            certifications.push({ name, issuer, date, certId });
        }
    });
    
    return certifications;
}

function collectExperience() {
    const items = document.querySelectorAll('#experienceList .dynamic-item');
    const experience = [];
    
    items.forEach(item => {
        const title = item.querySelector('.exp-title').value.trim();
        const company = item.querySelector('.exp-company').value.trim();
        const startDate = item.querySelector('.exp-start').value;
        const endDate = item.querySelector('.exp-end').value;
        const description = item.querySelector('.exp-description').value.trim();
        
        if (title && company) {
            experience.push({ title, company, startDate, endDate, description });
        }
    });
    
    return experience;
}

// ============================================
// PREVIEW UPDATE
// ============================================

function updatePreview() {
    // Update personal info
    const fullName = document.getElementById('fullName').value.trim() || 'Your Name';
    const dob = document.getElementById('dob').value;
    const bio = document.getElementById('bio').value.trim() || 'Your bio will appear here';
    
    document.getElementById('previewName').textContent = fullName;
    document.getElementById('previewDOB').textContent = dob ? formatDate(dob) : 'Date of Birth';
    document.getElementById('previewBio').textContent = bio;
    
    // Update avatar with initials
    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatarEl = document.getElementById('previewAvatar');
    if (initials) {
        avatarEl.innerHTML = `<span style="font-size: 24px; font-weight: 800; color: var(--primary);">${initials}</span>`;
    }
    
    // Update skills
    const skillsText = document.getElementById('skills').value.trim();
    const skills = skillsText.split(',').map(s => s.trim()).filter(s => s);
    const skillsContainer = document.getElementById('previewSkills');
    
    if (skills.length > 0) {
        skillsContainer.innerHTML = skills.map(skill => 
            `<div class="skill-badge">${skill}</div>`
        ).join('');
    } else {
        skillsContainer.innerHTML = '<div class="skill-badge">Sample Skill</div>';
    }
    
    // Update education
    const education = collectEducation();
    const eduContainer = document.getElementById('previewEducation');
    
    if (education.length > 0) {
        eduContainer.innerHTML = education.map(edu => `
            <div class="cert-item">
                <div class="cert-item-title">${edu.degree}</div>
                <div class="cert-item-subtitle">${edu.institution}</div>
                <div class="cert-item-date">${edu.year}${edu.field ? ' • ' + edu.field : ''}</div>
            </div>
        `).join('');
    } else {
        eduContainer.innerHTML = '<p class="empty-state">No education added yet</p>';
    }
    
    // Update experience
    const experience = collectExperience();
    const expContainer = document.getElementById('previewExperience');
    
    if (experience.length > 0) {
        expContainer.innerHTML = experience.map(exp => `
            <div class="cert-item">
                <div class="cert-item-title">${exp.title}</div>
                <div class="cert-item-subtitle">${exp.company}</div>
                <div class="cert-item-date">${exp.startDate ? formatDate(exp.startDate) : ''} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}</div>
            </div>
        `).join('');
    } else {
        expContainer.innerHTML = '<p class="empty-state">No experience added yet</p>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
}

// ============================================
// PHOTO UPLOAD
// ============================================

document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        this.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload a valid image file', 'error');
        this.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.style.backgroundImage = `url(${event.target.result})`;
        photoPreview.classList.add('active');
        
        // Update avatar in preview
        const avatarEl = document.getElementById('previewAvatar');
        avatarEl.style.backgroundImage = `url(${event.target.result})`;
        avatarEl.innerHTML = '';
        
        // Store in certificate data
        certificateData.personal.photo = event.target.result;
    };
    reader.readAsDataURL(file);
});

// ============================================
// CERTIFICATE GENERATION
// ============================================

document.getElementById('generateCertBtn').addEventListener('click', async function() {
    // Save all data
    saveCurrentStep();
    
    // Validate
    if (!certificateData.personal.fullName || !certificateData.skills.length) {
        showNotification('Please complete required fields', 'error');
        return;
    }
    
    this.disabled = true;
    this.innerHTML = '<span>Generating...</span>';
    showNotification('Generating your Universal Life Certificate...', 'info');
    
    try {
        // Generate IDs
        const ulid = generateULID();
        const passportID = generateULPassportID();
        const timestamp = new Date().toISOString();
        
        // Update preview with IDs
        document.getElementById('previewULID').textContent = ulid;
        document.getElementById('previewPassportID').textContent = passportID;
        document.getElementById('previewTimestamp').textContent = `Generated: ${new Date().toLocaleDateString('en-IN')}`;
        
        // Generate QR Code
        generateQRCode(ulid, passportID);
        
        // Create complete certificate data
        const completeCertificate = {
            ulid: ulid,
            ulPassportID: passportID,
            ...certificateData,
            blockchainHash: await generateHash(certificateData),
            issuedAt: timestamp,
            version: '1.0.0',
            status: 'active'
        };
        
        // Save to localStorage
        localStorage.setItem('ulc_certificate', JSON.stringify(completeCertificate));
        
        // Enable download buttons
        document.getElementById('downloadPDFBtn').disabled = false;
        document.getElementById('downloadJSONBtn').disabled = false;
        document.getElementById('printCertBtn').disabled = false;
        
        certificateData.generated = true;
        
        showNotification('Certificate generated successfully! 🎉', 'success');
        
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Certificate Generated';
        
    } catch (error) {
        console.error('Generation error:', error);
        showNotification('Error generating certificate. Please try again.', 'error');
        this.disabled = false;
        this.innerHTML = 'Generate Universal Life Certificate';
    }
});

// ============================================
// QR CODE GENERATION
// ============================================

function generateQRCode(ulid, passportID) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    const qrData = JSON.stringify({
        ulid: ulid,
        passportID: passportID,
        verifyUrl: `https://verify.onsnc.org/ulc/${ulid}`,
        timestamp: new Date().toISOString()
    });
    
    try {
        new QRCode(qrContainer, {
            text: qrData,
            width: 100,
            height: 100,
            colorDark: '#1A2332',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<div style="font-size: 10px; color: var(--text-muted);">QR Code</div>';
    }
}

// ============================================
// PDF DOWNLOAD
// ============================================

document.getElementById('downloadPDFBtn').addEventListener('click', async function() {
    if (!certificateData.generated) {
        showNotification('Please generate certificate first', 'error');
        return;
    }
    
    this.disabled = true;
    this.innerHTML = 'Generating PDF...';
    showNotification('Creating PDF...', 'info');
    
    try {
        const certificate = document.getElementById('certificatePreview');
        
        // Use html2canvas to capture the certificate
        const canvas = await html2canvas(certificate, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF',
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        const filename = `ULC_${certificateData.personal.fullName.replace(/\s+/g, '_')}_${document.getElementById('previewULID').textContent}.pdf`;
        pdf.save(filename);
        
        showNotification('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error creating PDF. Please try again.', 'error');
    } finally {
        this.disabled = false;
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Download PDF';
    }
});

// ============================================
// JSON EXPORT
// ============================================

document.getElementById('downloadJSONBtn').addEventListener('click', function() {
    if (!certificateData.generated) {
        showNotification('Please generate certificate first', 'error');
        return;
    }
    
    const certificate = localStorage.getItem('ulc_certificate');
    if (!certificate) {
        showNotification('Certificate data not found', 'error');
        return;
    }
    
    const blob = new Blob([certificate], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ULC_${certificateData.personal.fullName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('JSON exported successfully!', 'success');
});

// ============================================
// PRINT CERTIFICATE
// ============================================

document.getElementById('printCertBtn').addEventListener('click', function() {
    if (!certificateData.generated) {
        showNotification('Please generate certificate first', 'error');
        return;
    }
    
    window.print();
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
            localStorage.removeItem('ulc_session');
            localStorage.removeItem('ulc_draft');
            window.location.href = 'index.html';
        }
    });
    
    // View certificates
    document.getElementById('viewCertBtn').addEventListener('click', function() {
        showNotification('My Certificates feature coming soon!', 'info');
    });
    
    // Auto-update preview on input
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 500));
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateULID() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);
    const randomPart = Array.from(randomBytes)
        .map(byte => byte.toString(36).padStart(2, '0'))
        .join('')
        .toUpperCase()
        .substring(0, 10);
    return `ULC-${timestamp}-${randomPart}`;
}

function generateULPassportID() {
    const year = new Date().getFullYear();
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const passportNum = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
        .substring(0, 12);
    return `ULP-${year}-${passportNum}`;
}

async function generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function loadDraftData(data) {
    if (data.personal) {
        Object.keys(data.personal).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = data.personal[key];
        });
    }
}

function showNotification(message, type) {
    // Use the notification function from script.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

