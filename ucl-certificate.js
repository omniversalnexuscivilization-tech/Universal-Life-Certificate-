// Authentication State Management
let currentUser = null;
let isVerified = false;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const otpPage = document.getElementById('otp-page');
const verificationModal = document.getElementById('verification-modal');

// Check if user is already logged in
function checkAuthStatus() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    showDashboard();
  } else {
    showAuth();
  }
}

// Show authentication pages
function showAuth() {
  authContainer.classList.remove('hidden');
  dashboardContainer.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  authContainer.classList.add('hidden');
  dashboardContainer.classList.remove('hidden');
  updateUserInfo();
  loadCertificatesGrid();
  initCharts();
}

// Update user info in dashboard
function updateUserInfo() {
  if (currentUser) {
    const avatar = document.getElementById('user-avatar');
    avatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('');
  }
}

// Login functionality
document.getElementById('login-btn').addEventListener('click', function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  // In a real app, this would be an API call
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => (u.email === email || u.mobile === email) && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showDashboard();
  } else {
    alert('Invalid credentials. Please try again.');
  }
});

// Signup functionality
document.getElementById('signup-btn').addEventListener('click', function() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const mobile = document.getElementById('signup-mobile').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  if (!name || !email || !mobile || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  // In a real app, this would be an API call
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    alert('User with this email already exists');
    return;
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    mobile,
    password, // In a real app, this would be hashed
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Show OTP page for mobile verification
  showOtpPage();
});

// Show OTP page
function showOtpPage() {
  signupPage.classList.add('hidden');
  otpPage.classList.remove('hidden');
}

// Verify OTP
document.getElementById('verify-otp-btn').addEventListener('click', function() {
  // In a real app, this would verify the OTP with the server
  alert('Mobile number verified successfully!');
  
  // Complete registration and log the user in
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users[users.length - 1]; // Get the last registered user
  
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  showDashboard();
});

// Google sign in (simulated)
document.getElementById('google-signin').addEventListener('click', function() {
  // In a real app, this would use Google OAuth
  const mockUser = {
    id: 'google-' + Date.now().toString(),
    name: 'Google User',
    email: 'user@gmail.com',
    provider: 'google',
    createdAt: new Date().toISOString()
  };
  
  currentUser = mockUser;
  localStorage.setItem('currentUser', JSON.stringify(mockUser));
  showDashboard();
});

document.getElementById('google-signup').addEventListener('click', function() {
  // In a real app, this would use Google OAuth
  const mockUser = {
    id: 'google-' + Date.now().toString(),
    name: 'Google User',
    email: 'user@gmail.com',
    provider: 'google',
    createdAt: new Date().toISOString()
  };
  
  currentUser = mockUser;
  localStorage.setItem('currentUser', JSON.stringify(mockUser));
  showDashboard();
});

// Navigation between auth pages
document.getElementById('go-to-signup').addEventListener('click', function(e) {
  e.preventDefault();
  loginPage.classList.add('hidden');
  signupPage.classList.remove('hidden');
});

document.getElementById('go-to-login').addEventListener('click', function(e) {
  e.preventDefault();
  signupPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAuth();
  loginPage.classList.remove('hidden');
  signupPage.classList.add('hidden');
  otpPage.classList.add('hidden');
});

// Tab switching functionality
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Utility: generate ULID (simple variant) - timestamp + random
function generateULID() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(v => v.toString(36).padStart(2,'0')).join('').toUpperCase();
  return `ULC-${ts}-${rand}`;
}

// Dynamic education item
function makeEduRow(data={degree:'',inst:'',year:''}){
  const div = document.createElement('div');
  div.style.display='flex';div.style.gap='8px';div.style.marginTop='8px';
  div.innerHTML = `
    <input class="form-input edu-degree" placeholder="Degree / Course" value="${data.degree}" />
    <input class="form-input edu-inst" placeholder="Institute" value="${data.inst}" />
    <input class="form-input edu-year" placeholder="Year" value="${data.year}" style="width:72px" />
    <button class="btn btn-secondary remove-edu" style="background:#ff6b6b; border:none; color:white">Remove</button>
  `;
  div.querySelector('.remove-edu').addEventListener('click',()=>div.remove());
  return div;
}

document.getElementById('add-edu').addEventListener('click',()=>{
  document.getElementById('education-list').appendChild(makeEduRow());
});

// Load default one
document.getElementById('education-list').appendChild(makeEduRow({degree:'High School',inst:'Local School',year:'2013'}));

// Photo preview
const photoInput = document.getElementById('photo');
photoInput.addEventListener('change',async(e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image(); img.onload = ()=>{
    document.getElementById('preview-photo').style.backgroundImage = `url(${url})`; 
    document.getElementById('preview-photo').textContent='';
  }; img.src = url;
});

// QR Code for ULID (will be regenerated)
let qr;
function regenQR(text, elementId){
  const el = document.getElementById(elementId); el.innerHTML='';
  qr = new QRCode(el,{text, width:100, height:100});
}

// Generate preview & ULID
document.getElementById('generate').addEventListener('click',()=>{
  const name = document.getElementById('fullname').value || 'Unnamed';
  const dob = document.getElementById('dob').value || '';
  const bio = document.getElementById('bio').value || '';
  const skills = document.getElementById('skills').value || '';
  const exp = document.getElementById('experience').value || '';

  // collect education
  const edus = Array.from(document.querySelectorAll('#education-list > div')).map(div=>({
    degree: div.querySelector('.edu-degree').value,
    inst: div.querySelector('.edu-inst').value,
    year: div.querySelector('.edu-year').value,
  }));

  const ulid = generateULID();
  document.getElementById('preview-ulid').textContent = `ULID: ${ulid}`;
  document.getElementById('preview-name').textContent = name;
  document.getElementById('preview-bio').textContent = bio || (dob? `Born ${dob}` : '');

  // badges from skills
  const badgeList = document.getElementById('preview-badges'); badgeList.innerHTML='';
  if(skills.trim()){
    skills.split(',').slice(0,8).map(s=>s.trim()).forEach(s=>{
      if(!s) return; const b = document.createElement('div'); b.className='badge'; b.textContent=s; badgeList.appendChild(b);
    });
  } else {
    const b=document.createElement('div'); b.className='badge'; b.textContent='Lifelong Learner'; badgeList.appendChild(b);
  }

  // education preview
  const eduDiv = document.getElementById('preview-education'); eduDiv.innerHTML='';
  if (edus.length > 0) {
    edus.forEach(e=>{ 
      const row = document.createElement('div'); 
      row.className = 'education-item';
      row.innerHTML = `<strong>${e.degree}</strong> - ${e.inst} (${e.year})`; 
      eduDiv.appendChild(row); 
    });
  } else {
    const row = document.createElement('div'); 
    row.className = 'education-item';
    row.textContent = 'No education added yet';
    eduDiv.appendChild(row);
  }

  document.getElementById('preview-experience').textContent = exp || 'No experience added yet';

  // metamorphic badge animation: rotate slightly based on ULID
  const mb = document.getElementById('preview-metabadge'); 
  mb.style.transform = `rotate(${(ulid.length%7)*6}deg) scale(1.02)`;

  // QR code
  regenQR(window.location.href + '#ulid=' + ulid, 'preview-qr');

  // store dataset locally (localStorage prototype)
  const record = {ulid,name,dob,bio,skills,exp,edus,ts:Date.now()};
  localStorage.setItem('ulc_latest', JSON.stringify(record));

  // enable buttons
  document.getElementById('download-pdf').disabled = false;
  document.getElementById('save-certificate').disabled = false;
  document.getElementById('download-json').disabled = false;
  
  // Add to certificates list
  addCertificateToGrid(record);
});

// Save certificate
document.getElementById('save-certificate').addEventListener('click',()=>{
  const data = localStorage.getItem('ulc_latest');
  if(!data){alert('Generate ULC first');return}
  
  // Get existing certificates or initialize empty array
  const certificates = JSON.parse(localStorage.getItem('ulc_certificates') || '[]');
  const newCertificate = JSON.parse(data);
  
  // Add to certificates array
  certificates.push(newCertificate);
  
  // Save back to localStorage
  localStorage.setItem('ulc_certificates', JSON.stringify(certificates));
  
  alert('Certificate saved successfully!');
  
  // Refresh certificates grid
  loadCertificatesGrid();
});

// Export JSON
document.getElementById('download-json').addEventListener('click',()=>{
  const data = localStorage.getItem('ulc_latest');
  if(!data){alert('Generate ULC first');return}
  const blob = new Blob([data],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'ulc_record.json'; a.click(); URL.revokeObjectURL(url);
});

// Download PDF with verification
document.getElementById('download-pdf').addEventListener('click', function() {
  showVerificationModal();
});

document.getElementById('dashboard-download-pdf').addEventListener('click', function() {
  showVerificationModal();
});

// Show verification modal
function showVerificationModal() {
  verificationModal.classList.remove('hidden');
}

// Close verification modal
document.getElementById('close-verification-modal').addEventListener('click', function() {
  verificationModal.classList.add('hidden');
});

// Verification steps
document.getElementById('verify-mobile-btn').addEventListener('click', function() {
  // In a real app, this would send an OTP to the user's mobile
  alert('OTP sent to your mobile number');
  
  // Mark step as completed
  document.getElementById('step-1-icon').classList.add('completed');
  document.getElementById('step-1-icon').textContent = '✓';
  
  // Enable next step
  document.getElementById('review-data-btn').disabled = false;
});

document.getElementById('review-data-btn').addEventListener('click', function() {
  // Mark step as completed
  document.getElementById('step-2-icon').classList.add('completed');
  document.getElementById('step-2-icon').textContent = '✓';
  
  // Enable final step
  document.getElementById('final-download-btn').disabled = false;
});

document.getElementById('final-download-btn').addEventListener('click', async function() {
  // Mark step as completed
  document.getElementById('step-3-icon').classList.add('completed');
  document.getElementById('step-3-icon').textContent = '✓';
  
  // Close modal
  verificationModal.classList.add('hidden');
  
  // Download PDF
  const node = document.querySelector('.certificate-preview');
  const originalBoxShadow = node.style.boxShadow;
  node.style.boxShadow='none';
  const canvas = await html2canvas(node, {scale:2, useCORS:true});
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'portrait', unit:'px', format:[canvas.width, canvas.height]});
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  const filename = (document.getElementById('preview-ulid').textContent.replace('ULID: ', '') || 'ULC') + '.pdf';
  pdf.save(filename);
  node.style.boxShadow = originalBoxShadow;
  
  // Reset verification steps for next time
  setTimeout(() => {
    document.getElementById('step-1-icon').classList.remove('completed');
    document.getElementById('step-1-icon').textContent = '1';
    document.getElementById('step-2-icon').classList.remove('completed');
    document.getElementById('step-2-icon').textContent = '2';
    document.getElementById('step-3-icon').classList.remove('completed');
    document.getElementById('step-3-icon').textContent = '3';
    document.getElementById('review-data-btn').disabled = true;
    document.getElementById('final-download-btn').disabled = true;
  }, 1000);
});

// Load certificates from localStorage and display in grid
function loadCertificatesGrid() {
  const certificates = JSON.parse(localStorage.getItem('ulc_certificates') || '[]');
  const container = document.getElementById('certificates-container');
  container.innerHTML = '';
  
  if (certificates.length === 0) {
    container.innerHTML = '<p>No certificates saved yet. Create one in the "Create New" tab.</p>';
    return;
  }
  
  certificates.forEach(cert => {
    addCertificateToGrid(cert, container);
  });
}

// Add a certificate to the grid
function addCertificateToGrid(cert, container = null) {
  if (!container) {
    container = document.getElementById('certificates-container');
  }
  
  const card = document.createElement('div');
  card.className = 'certificate-card';
  card.innerHTML = `
    <div class="certificate-card-header">
      <h3 class="certificate-card-title">${cert.name}</h3>
      <div class="certificate-card-id">${cert.ulid}</div>
    </div>
    <div class="certificate-card-body">
      <div class="certificate-card-avatar">${cert.name.split(' ').map(n => n[0]).join('')}</div>
      <div class="certificate-card-info">
        <h4>${cert.name}</h4>
        <p class="certificate-card-bio">${cert.bio || 'No bio provided'}</p>
      </div>
    </div>
    <div class="certificate-card-footer">
      <div class="certificate-card-date">${new Date(cert.ts).toLocaleDateString()}</div>
      <div class="certificate-card-status">Active</div>
    </div>
  `;
  
  container.appendChild(card);
}

// Initialize dashboard charts
function initCharts() {
  // Skills Distribution Chart
  const skillsCtx = document.getElementById('skillsChart').getContext('2d');
  new Chart(skillsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Technical', 'Soft Skills', 'Languages', 'Certifications'],
      datasets: [{
        data: [40, 25, 20, 15],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Certificate Status Chart
  const statusCtx = document.getElementById('statusChart').getContext('2d');
  new Chart(statusCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Certificates Created',
        data: [2, 3, 1, 4, 2, 3],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Growth Chart
  const growthCtx = document.getElementById('growthChart').getContext('2d');
  new Chart(growthCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [{
        label: 'Total Certificates',
        data: [5, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Development Chart
  const developmentCtx = document.getElementById('developmentChart').getContext('2d');
  new Chart(developmentCtx, {
    type: 'radar',
    data: {
      labels: ['Technical', 'Communication', 'Leadership', 'Problem Solving', 'Creativity', 'Teamwork'],
      datasets: [{
        label: 'Current Skills',
        data: [8, 7, 6, 9, 7, 8],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6'
      }, {
        label: 'Previous Assessment',
        data: [6, 5, 4, 7, 5, 6],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 10
        }
      }
    }
  });

  // Verification Chart
  const verificationCtx = document.getElementById('verificationChart').getContext('2d');
  new Chart(verificationCtx, {
    type: 'pie',
    data: {
      labels: ['Verified', 'Pending', 'Expired'],
      datasets: [{
        data: [70, 20, 10],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// On load: if there's a saved local record, load into preview
window.addEventListener('load',()=>{
  checkAuthStatus();
  
  const saved = localStorage.getItem('ulc_latest');
  if(saved){
    try{ 
      const rec = JSON.parse(saved); 
      document.getElementById('fullname').value = rec.name; 
      document.getElementById('dob').value = rec.dob || ''; 
      document.getElementById('bio').value = rec.bio || ''; 
      document.getElementById('skills').value = rec.skills || ''; 
      document.getElementById('experience').value = rec.exp || '';
      // education reset
      document.getElementById('education-list').innerHTML=''; 
      rec.edus.forEach(e=>document.getElementById('education-list').appendChild(makeEduRow(e)));
      document.getElementById('generate').click();
    }catch(e){console.warn('Could not restore ULC')}
  }
  
  // Generate QR for dashboard
  regenQR('https://ulc.onsnc.org/verify/ULC-2023-SR-001', 'dashboard-qr');
});

// Basic service worker registration (offline-ready stub)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw-ulc.js').catch(e=>console.warn('SW reg failed',e));
}

// Accessibility: keyboard shortcut G to generate
window.addEventListener('keydown',e=>{ 
  if(e.key.toLowerCase()==='g' && (e.ctrlKey||e.metaKey)){ 
    e.preventDefault(); 
    document.getElementById('generate').click(); 
  } 
});

