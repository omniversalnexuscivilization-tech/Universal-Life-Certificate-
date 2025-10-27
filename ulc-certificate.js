// Universal Life Certificate - Complete JavaScript Implementation
// Version: 1.0.0
// ONSNC - UIENC System

// ============================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://api.onsnc.org/v1',
    AADHAAR_AUTH_URL: '/auth/aadhaar',
    DIGILOCKER_AUTH_URL: '/auth/digilocker',
    ULC_REGISTER_URL: '/ulc/register',
    ULC_VERIFY_URL: '/ulc/verify',
    BLOCKCHAIN_NETWORK: 'Hyperledger-Fabric',
    STORAGE_KEY: 'ulc_user_data',
    SESSION_KEY: 'ulc_session'
};

let currentUser = null;
let authMode = 'signin'; // 'signin' or 'signup'

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate ULID (Universally Unique Lexicographically Sortable Identifier)
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

// Generate Universal Life Passport ID
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

// Hash function for blockchain verification
async function generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format date to readable format
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================

function saveToStorage(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(key, jsonData);
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Retrieval error:', error);
        return null;
    }
}

function clearStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Clear error:', error);
        return false;
    }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Modal management
const modal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const ctaBtn = document.getElementById('ctaBtn');

function openModal(mode = 'signin') {
    authMode = mode;
    updateAuthModal();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateAuthModal() {
    const title = document.getElementById('authTitle');
    const switchText = document.getElementById('switchText');
    const switchMode = document.getElementById('switchMode');
    
    if (authMode === 'signin') {
        title.textContent = 'Sign In to ULC';
        switchText.textContent = "Don't have an account?";
        switchMode.textContent = 'Sign Up';
    } else {
        title.textContent = 'Create Your ULC Account';
        switchText.textContent = 'Already have an account?';
        switchMode.textContent = 'Sign In';
    }
}

// Event listeners for modal
loginBtn.addEventListener('click', () => openModal('signin'));
registerBtn.addEventListener('click', () => openModal('signup'));
getStartedBtn.addEventListener('click', () => openModal('signup'));
ctaBtn.addEventListener('click', () => openModal('signup'));
closeBtn.addEventListener('click', closeModal);

document.getElementById('switchMode').addEventListener('click', (e) => {
    e.preventDefault();
    authMode = authMode === 'signin' ? 'signup' : 'signin';
    updateAuthModal();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Aadhaar Authentication (Mock Implementation)
document.getElementById('aadhaarAuth').addEventListener('click', async () => {
    showNotification('Connecting to Aadhaar Authentication...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        const aadhaarNumber = prompt('Enter your 12-digit Aadhaar number (Mock):');
        
        if (aadhaarNumber && aadhaarNumber.length === 12) {
            const otp = prompt('Enter OTP sent to your registered mobile (Mock):');
            
            if (otp && otp.length === 6) {
                // Mock successful authentication
                const userData = {
                    authMethod: 'aadhaar',
                    aadhaarNumber: aadhaarNumber,
                    name: 'User Name (From Aadhaar)',
                    dob: '1990-01-01',
                    verified: true,
                    timestamp: new Date().toISOString()
                };
                
                handleSuccessfulAuth(userData);
            } else {
                showNotification('Invalid OTP. Please try again.', 'error');
            }
        } else {
            showNotification('Invalid Aadhaar number.', 'error');
        }
    }, 1000);
});

// DigiLocker Authentication (Mock Implementation)
document.getElementById('digilockerAuth').addEventListener('click', async () => {
    showNotification('Connecting to DigiLocker...', 'info');
    
    // Simulate OAuth flow
    setTimeout(() => {
        const consent = confirm('DigiLocker will share your verified documents. Continue?');
        
        if (consent) {
            // Mock successful authentication
            const userData = {
                authMethod: 'digilocker',
                digilockerID: 'DL' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                name: 'User Name (From DigiLocker)',
                dob: '1990-01-01',
                verified: true,
                documents: ['10th Certificate', '12th Certificate'],
                timestamp: new Date().toISOString()
            };
            
            handleSuccessfulAuth(userData);
        }
    }, 1000);
});

// Email/Password Authentication
document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    showNotification('Processing...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        const userData = {
            authMethod: 'email',
            email: email,
            name: email.split('@')[0],
            verified: false,
            timestamp: new Date().toISOString()
        };
        
        handleSuccessfulAuth(userData);
    }, 1500);
});

// Handle successful authentication
function handleSuccessfulAuth(userData) {
    currentUser = {
        ...userData,
        ulid: generateULID(),
        ulPassportID: generateULPassportID(),
        createdAt: new Date().toISOString()
    };
    
    saveToStorage(CONFIG.SESSION_KEY, currentUser);
    closeModal();
    showNotification('Authentication successful! Welcome to ULC.', 'success');
    
    // Redirect to dashboard/certificate creation
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Type-specific styling
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #4CAF50';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #F44336';
    } else if (type === 'info') {
        notification.style.borderLeft = '4px solid #2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    return icons[type] || icons.info;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

function checkSession() {
    const session = getFromStorage(CONFIG.SESSION_KEY);
    if (session) {
        currentUser = session;
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    loginBtn.textContent = 'Dashboard';
    loginBtn.onclick = () => window.location.href = 'dashboard.html';
    registerBtn.textContent = 'Logout';
    registerBtn.onclick = logout;
}

function logout() {
    clearStorage(CONFIG.SESSION_KEY);
    currentUser = null;
    showNotification('Logged out successfully', 'success');
    location.reload();
}

// ============================================
// CERTIFICATE GENERATION FUNCTIONS
// ============================================

async function generateCertificate(userData) {
    const certificateData = {
        ulid: userData.ulid || generateULID(),
        ulPassportID: userData.ulPassportID || generateULPassportID(),
        personalInfo: {
            name: userData.name,
            dob: userData.dob,
            gender: userData.gender,
            photo: userData.photo || null
        },
        education: userData.education || [],
        skills: userData.skills || [],
        experience: userData.experience || [],
        achievements: userData.achievements || [],
        certifications: userData.certifications || [],
        blockchainHash: await generateHash(userData),
        issuedAt: new Date().toISOString(),
        expiresAt: null, // Lifetime certificate
        status: 'active',
        version: '1.0.0'
    };
    
    return certificateData;
}

// ============================================
// BLOCKCHAIN INTEGRATION (Mock)
// ============================================

async function registerOnBlockchain(certificateData) {
    // Mock blockchain registration
    showNotification('Registering on blockchain...', 'info');
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const blockchainRecord = {
                transactionID: 'TX-' + Date.now().toString(36).toUpperCase(),
                blockNumber: Math.floor(Math.random() * 1000000),
                timestamp: new Date().toISOString(),
                network: CONFIG.BLOCKCHAIN_NETWORK,
                hash: certificateData.blockchainHash,
                status: 'confirmed'
            };
            
            showNotification('Blockchain registration successful!', 'success');
            resolve(blockchainRecord);
        }, 2000);
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-icon {
            font-size: 20px;
            font-weight: bold;
        }
        
        .notification-message {
            font-size: 15px;
            color: #1A2332;
        }
    `;
    document.head.appendChild(style);
    
    console.log('ULC System Initialized');
    console.log('Version: 1.0.0');
    console.log('Network: ' + CONFIG.BLOCKCHAIN_NETWORK);
});

// ============================================
// EXPORT FOR MODULE USE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateULID,
        generateULPassportID,
        generateHash,
        generateCertificate,
        registerOnBlockchain
    };
}
