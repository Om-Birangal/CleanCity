// Global variables
let currentUser = null;
let capturedPhoto = null;
let userLocation = null;
let reports = [];
let users = [];
let leaderboardData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDummyData();
    updateStats();
    updateLeaderboard();
    initializeChatbot();
});

// Initialize app functionality
function initializeApp() {
    // Modal functionality
    setupModals();
    
    // Authentication
    setupAuthentication();
    
    // Camera functionality
    setupCamera();
    
    // Location services
    setupLocation();
    
    // Report submission
    setupReportSubmission();
    
    // Navigation
    setupNavigation();
    
    // Social sharing
    setupSocialSharing();
}

// Modal setup
function setupModals() {
    const loginModal = document.getElementById('loginModal');
    const successModal = document.getElementById('successModal');
    const municipalModal = document.getElementById('municipalModal');
    const loginBtn = document.getElementById('loginBtn');
    const reportGarbageBtn = document.getElementById('reportGarbageBtn');
    
    // Login button
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
    
    // Report garbage button
    reportGarbageBtn.addEventListener('click', () => {
        if (!currentUser) {
            loginModal.style.display = 'block';
            return;
        }
        document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchAuthTab(tab);
        });
    });
    
    // Switch between login and register
    document.querySelectorAll('.switch-link').forEach(link => {
        link.addEventListener('click', () => {
            const currentForm = link.closest('.auth-form');
            if (currentForm.id === 'loginForm') {
                switchAuthTab('register');
            } else {
                switchAuthTab('login');
            }
        });
    });
}

// Switch authentication tabs
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Form`).classList.add('active');
}

// Authentication setup
function setupAuthentication() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        updateUserInterface();
        document.getElementById('loginModal').style.display = 'none';
        showNotification('Login successful!', 'success');
    } else {
        alert('Invalid email or password');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    
    // Simple validation
    if (!name || !email || !password || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        phone: phone,
        points: 0,
        reports: 0,
        joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    currentUser = newUser;
    updateUserInterface();
    document.getElementById('loginModal').style.display = 'none';
    showNotification('Registration successful!', 'success');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    updateUserInterface();
    showNotification('Logged out successfully', 'info');
}

// Update user interface based on login status
function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userReports = document.getElementById('userReports');
    const userPoints = document.getElementById('userPoints');
    const userRank = document.getElementById('userRank');
    
    if (currentUser) {
        loginBtn.textContent = currentUser.name;
        loginBtn.style.background = '#4a7c59';
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
        userReports.textContent = currentUser.reports;
        userPoints.textContent = currentUser.points;
        
        // Calculate rank
        const sortedUsers = users.sort((a, b) => b.points - a.points);
        const rank = sortedUsers.findIndex(u => u.id === currentUser.id) + 1;
        userRank.textContent = rank;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.style.background = 'rgba(255,255,255,0.2)';
        userName.textContent = 'Guest User';
        userEmail.textContent = 'Not logged in';
        userReports.textContent = '0';
        userPoints.textContent = '0';
        userRank.textContent = '-';
    }
}

// Camera setup
function setupCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    
    let stream = null;
    
    // Start camera
    captureBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 400, 
                    height: 300,
                    facingMode: 'environment' // Use back camera on mobile
                } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            captureBtn.textContent = 'Capture Photo';
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    });
    
    // Capture photo
    captureBtn.addEventListener('click', () => {
        if (stream) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            capturedPhoto = canvas.toDataURL('image/jpeg');
            video.style.display = 'none';
            canvas.style.display = 'block';
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-flex';
            
            // Enable submit button
            document.getElementById('submitReportBtn').disabled = false;
        }
    });
    
    // Retake photo
    retakeBtn.addEventListener('click', () => {
        video.style.display = 'block';
        canvas.style.display = 'none';
        captureBtn.style.display = 'inline-flex';
        retakeBtn.style.display = 'none';
        capturedPhoto = null;
        document.getElementById('submitReportBtn').disabled = true;
    });
}

// Location setup
function setupLocation() {
    const locationText = document.getElementById('locationText');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                locationText.textContent = `Location captured: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
                locationText.style.color = '#4a7c59';
            },
            (error) => {
                console.error('Error getting location:', error);
                locationText.textContent = 'Location access denied';
                locationText.style.color = '#dc3545';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        locationText.textContent = 'Geolocation not supported';
        locationText.style.color = '#dc3545';
    }
}

// Report submission setup
function setupReportSubmission() {
    const submitBtn = document.getElementById('submitReportBtn');
    
    submitBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to submit a report');
            return;
        }
        
        if (!capturedPhoto) {
            alert('Please capture a photo first');
            return;
        }
        
        if (!userLocation) {
            alert('Please allow location access');
            return;
        }
        
        const garbageType = document.getElementById('garbageType').value;
        const description = document.getElementById('description').value;
        const severity = document.getElementById('severity').value;
        
        if (!garbageType || !severity) {
            alert('Please fill in all required fields');
            return;
        }
        
        submitReport(garbageType, description, severity);
    });
}

// Submit report
function submitReport(garbageType, description, severity) {
    const report = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        garbageType: garbageType,
        description: description,
        severity: severity,
        location: userLocation,
        photo: capturedPhoto,
        timestamp: new Date().toISOString(),
        status: 'pending',
        points: calculatePoints(severity)
    };
    
    reports.push(report);
    
    // Connect to Municipality Database
    const municipalReport = municipalityDB.addReport(report);
    
    // Update user stats
    currentUser.reports++;
    currentUser.points += report.points;
    
    // Update UI
    updateUserInterface();
    updateStats();
    updateLeaderboard();
    
    // Show success modal with municipality connection info
    showSuccessModal(report.points, municipalReport);
    
    // Notify chatbot about new report
    if (chatbotOpen) {
        setTimeout(() => {
            addChatbotMessageWithButtons(
                `Great! Your report #${report.id} has been submitted to the municipal office. I can help you track its status!`,
                'bot',
                [
                    { text: 'Check Status', action: `check-status-${report.id}` },
                    { text: 'View My Reports', action: 'view-reports' }
                ]
            );
        }, 1000);
    }
    
    // Reset form
    resetReportForm();
}

// Calculate points based on severity
function calculatePoints(severity) {
    const pointsMap = {
        'low': 5,
        'medium': 10,
        'high': 15,
        'critical': 25
    };
    return pointsMap[severity] || 5;
}

// Show success modal
function showSuccessModal(points, municipalReport = null) {
    document.getElementById('rewardPoints').textContent = points;
    if (municipalReport) {
        // Add municipality info to success message
        const successModal = document.getElementById('successModal');
        let municipalityInfo = successModal.querySelector('.municipality-info');
        if (!municipalityInfo) {
            municipalityInfo = document.createElement('div');
            municipalityInfo.className = 'municipality-info';
            municipalityInfo.style.cssText = 'background: #e8f5e8; padding: 1rem; border-radius: 8px; margin: 1rem 0;';
            const rewardInfo = document.querySelector('.reward-info');
            rewardInfo.parentNode.insertBefore(municipalityInfo, rewardInfo.nextSibling);
        }
        municipalityInfo.innerHTML = `
            <p><strong>📋 Report ID:</strong> #${municipalReport.id}</p>
            <p><strong>⏱️ Estimated Cleanup Time:</strong> ${municipalReport.estimatedTime}</p>
            <p><strong>📍 Status:</strong> Submitted to Municipal Office</p>
        `;
    }
    document.getElementById('successModal').style.display = 'block';
}

// Reset report form
function resetReportForm() {
    document.getElementById('garbageType').value = '';
    document.getElementById('description').value = '';
    document.getElementById('severity').value = '';
    document.getElementById('submitReportBtn').disabled = true;
    
    // Reset camera
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    
    video.style.display = 'none';
    canvas.style.display = 'none';
    captureBtn.style.display = 'inline-flex';
    retakeBtn.style.display = 'none';
    
    capturedPhoto = null;
    
    // Stop camera stream
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

// Navigation setup
function setupNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Leaderboard filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateLeaderboard(btn.dataset.period);
        });
    });
}

// Social sharing setup
function setupSocialSharing() {
    const shareProfileBtn = document.getElementById('shareProfileBtn');
    const facebookShareBtn = document.querySelector('.share-btn.facebook');
    const twitterShareBtn = document.querySelector('.share-btn.twitter');
    
    shareProfileBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to share your profile');
            return;
        }
        shareProfile();
    });
    
    facebookShareBtn.addEventListener('click', () => {
        shareToFacebook();
    });
    
    twitterShareBtn.addEventListener('click', () => {
        shareToTwitter();
    });
}

// Share profile
function shareProfile() {
    const text = `I've reported ${currentUser.reports} garbage spots and earned ${currentUser.points} points on CleanCity! Join me in keeping our city clean.`;
    shareToSocial(text);
}

// Share to Facebook
function shareToFacebook() {
    const text = `I just reported a garbage spot on CleanCity and earned points! Help keep our city clean by joining the community.`;
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

// Share to Twitter
function shareToTwitter() {
    const text = `I just reported a garbage spot on CleanCity! Join me in keeping our city clean. #CleanCity #Environment`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

// Generic social sharing
function shareToSocial(text) {
    if (navigator.share) {
        navigator.share({
            title: 'CleanCity - Garbage Prevention App',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Text copied to clipboard!', 'success');
        });
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalReports').textContent = reports.length;
    document.getElementById('totalCleaned').textContent = reports.filter(r => r.status === 'cleaned').length;
    document.getElementById('activeUsers').textContent = users.length;
    document.getElementById('pendingReports').textContent = reports.filter(r => r.status === 'pending').length;
    document.getElementById('cleanedToday').textContent = reports.filter(r => {
        const today = new Date().toDateString();
        const reportDate = new Date(r.timestamp).toDateString();
        return r.status === 'cleaned' && reportDate === today;
    }).length;
}

// Update leaderboard
function updateLeaderboard(period = 'month') {
    const leaderboardList = document.getElementById('leaderboardList');
    let filteredUsers = [...users];
    
    // Filter by period (simplified - in real app, you'd filter by actual dates)
    if (period === 'week') {
        // Show only users active this week
        filteredUsers = users.filter(user => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(user.joinDate) > weekAgo;
        });
    }
    
    // Sort by points
    filteredUsers.sort((a, b) => b.points - a.points);
    
    // Update leaderboard HTML
    leaderboardList.innerHTML = filteredUsers.slice(0, 10).map((user, index) => `
        <div class="leaderboard-item">
            <div class="rank">${index + 1}</div>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p>${user.reports} reports</p>
                </div>
            </div>
            <div class="points">${user.points} pts</div>
        </div>
    `).join('');
}

// Load dummy data
function loadDummyData() {
    // Dummy users
    users = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            phone: '+1234567890',
            points: 45,
            reports: 3,
            joinDate: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'password123',
            phone: '+1234567891',
            points: 30,
            reports: 2,
            joinDate: '2024-01-20T14:30:00Z'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike@example.com',
            password: 'password123',
            phone: '+1234567892',
            points: 25,
            reports: 2,
            joinDate: '2024-01-25T09:15:00Z'
        }
    ];
    
    // Dummy reports
    reports = [
        {
            id: 1,
            userId: 1,
            userName: 'John Doe',
            userEmail: 'john@example.com',
            garbageType: 'plastic',
            description: 'Large pile of plastic bottles near the park',
            severity: 'high',
            location: { latitude: 40.7128, longitude: -74.0060 },
            photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            timestamp: '2024-01-15T10:30:00Z',
            status: 'cleaned',
            points: 15
        },
        {
            id: 2,
            userId: 2,
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            garbageType: 'organic',
            description: 'Food waste scattered around the street',
            severity: 'medium',
            location: { latitude: 40.7589, longitude: -73.9851 },
            photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            timestamp: '2024-01-20T15:45:00Z',
            status: 'pending',
            points: 10
        }
    ];
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4a7c59' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close success modal
document.querySelector('.close-success-btn').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Municipal dashboard access (for demo purposes)
document.addEventListener('keydown', (e) => {
    // Press 'M' key to open municipal dashboard
    if (e.key === 'm' || e.key === 'M') {
        if (e.ctrlKey) {
            e.preventDefault();
            showMunicipalDashboard();
        }
    }
});

// Show municipal dashboard
function showMunicipalDashboard() {
    const modal = document.getElementById('municipalModal');
    const reportsList = document.getElementById('municipalReportsList');
    
    // Get reports from municipality database
    const municipalReports = municipalityDB.getData().reports;
    
    // Update pending reports count
    const pendingCount = municipalityDB.getPendingReports().length;
    const completedCount = municipalityDB.getCompletedReports().length;
    document.getElementById('pendingReports').textContent = pendingCount;
    document.getElementById('cleanedToday').textContent = completedCount;
    
    // Show reports from municipality database
    if (municipalReports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No reports submitted yet.</p>';
    } else {
        reportsList.innerHTML = municipalReports.map(report => {
            const reportData = reports.find(r => r.id === report.id) || report;
            return `
                <div class="report-item">
                    <h4>Report #${report.id} - ${report.garbageType.toUpperCase()}</h4>
                    <p><strong>User:</strong> ${report.userName} (${report.userEmail})</p>
                    <p><strong>Description:</strong> ${report.description || 'No description'}</p>
                    <p><strong>Severity:</strong> ${report.severity}</p>
                    <p><strong>Priority:</strong> ${report.priority || 'N/A'}</p>
                    <p><strong>Estimated Time:</strong> ${report.estimatedTime || 'N/A'}</p>
                    <p><strong>Location:</strong> ${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}</p>
                    <p><strong>Status:</strong> <span style="color: ${report.status === 'pending' ? '#ffc107' : report.status === 'cleaned' ? '#28a745' : '#dc3545'}">${report.status.toUpperCase()}</span></p>
                    <p><strong>Submitted:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                    ${report.status === 'pending' ? `
                        <div class="report-actions">
                            <button class="mark-cleaned" onclick="markAsCleaned(${report.id})">Mark as Cleaned</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    modal.style.display = 'block';
}

// Mark report as cleaned
function markAsCleaned(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        report.status = 'cleaned';
        // Update municipality database
        municipalityDB.updateReportStatus(reportId, 'cleaned', 'Report marked as cleaned by municipal office');
        updateStats();
        showMunicipalDashboard(); // Refresh the dashboard
        showNotification('Report marked as cleaned!', 'success');
        
        // Notify user if chatbot is open
        if (chatbotOpen && currentUser && report.userId === currentUser.id) {
            setTimeout(() => {
                addChatbotMessage(`🎉 Great news! Your report #${reportId} has been marked as cleaned by the municipal office!`, 'bot');
            }, 500);
        }
    }
}

// Export data (for demo purposes)
function exportData() {
    const data = {
        users: users,
        reports: reports,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleancity-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Add export button to municipal dashboard
document.addEventListener('DOMContentLoaded', () => {
    const municipalModal = document.getElementById('municipalModal');
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Data';
    exportBtn.style.cssText = `
        background: #17a2b8;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 10px 0;
    `;
    exportBtn.addEventListener('click', exportData);
    
    municipalModal.querySelector('.modal-content').insertBefore(exportBtn, municipalModal.querySelector('.reports-list'));
});

// ==================== MUNICIPALITY DATABASE ====================

// Dummy Database for Municipality Office
class MunicipalityDatabase {
    constructor() {
        this.init();
    }

    init() {
        // Initialize database in localStorage
        if (!localStorage.getItem('municipalityDB')) {
            const initialData = {
                reports: [],
                municipalityInfo: {
                    name: "City Municipal Office",
                    address: "123 Main Street, City Center",
                    phone: "+1-234-567-8900",
                    email: "municipality@city.gov",
                    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
                    departments: [
                        { name: "Waste Management", phone: "+1-234-567-8901" },
                        { name: "Public Works", phone: "+1-234-567-8902" },
                        { name: "Environmental Services", phone: "+1-234-567-8903" }
                    ],
                    workers: [
                        { id: 1, name: "John Smith", department: "Waste Management", status: "available" },
                        { id: 2, name: "Sarah Johnson", department: "Public Works", status: "available" },
                        { id: 3, name: "Mike Davis", department: "Environmental Services", status: "on-duty" }
                    ]
                },
                reportStatuses: {},
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('municipalityDB', JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('municipalityDB') || '{}');
    }

    saveData(data) {
        data.lastUpdate = new Date().toISOString();
        localStorage.setItem('municipalityDB', JSON.stringify(data));
    }

    addReport(report) {
        const data = this.getData();
        const municipalReport = {
            id: report.id,
            userId: report.userId,
            userName: report.userName,
            userEmail: report.userEmail,
            garbageType: report.garbageType,
            description: report.description,
            severity: report.severity,
            location: report.location,
            photo: report.photo,
            timestamp: report.timestamp,
            status: 'pending',
            assignedTo: null,
            estimatedTime: this.calculateEstimatedTime(report.severity),
            priority: this.calculatePriority(report.severity),
            notes: []
        };
        data.reports.push(municipalReport);
        data.reportStatuses[report.id] = {
            status: 'pending',
            submittedAt: report.timestamp,
            updatedAt: report.timestamp
        };
        this.saveData(data);
        return municipalReport;
    }

    updateReportStatus(reportId, status, notes = '') {
        const data = this.getData();
        const report = data.reports.find(r => r.id === reportId);
        if (report) {
            report.status = status;
            report.updatedAt = new Date().toISOString();
            if (notes) {
                report.notes.push({
                    note: notes,
                    timestamp: new Date().toISOString(),
                    author: 'Municipal Office'
                });
            }
            data.reportStatuses[reportId] = {
                status: status,
                updatedAt: new Date().toISOString()
            };
            this.saveData(data);
            return report;
        }
        return null;
    }

    getReportStatus(reportId) {
        const data = this.getData();
        return data.reportStatuses[reportId] || null;
    }

    getUserReports(userId) {
        const data = this.getData();
        return data.reports.filter(r => r.userId === userId);
    }

    getMunicipalityInfo() {
        const data = this.getData();
        return data.municipalityInfo;
    }

    calculateEstimatedTime(severity) {
        const timeMap = {
            'low': '1-2 hours',
            'medium': '2-4 hours',
            'high': '4-6 hours',
            'critical': 'Immediate (within 1 hour)'
        };
        return timeMap[severity] || '2-4 hours';
    }

    calculatePriority(severity) {
        const priorityMap = {
            'low': 1,
            'medium': 2,
            'high': 3,
            'critical': 4
        };
        return priorityMap[severity] || 2;
    }

    getPendingReports() {
        const data = this.getData();
        return data.reports.filter(r => r.status === 'pending');
    }

    getCompletedReports() {
        const data = this.getData();
        return data.reports.filter(r => r.status === 'cleaned');
    }
}

// Initialize database
const municipalityDB = new MunicipalityDatabase();

// ==================== CHATBOT FUNCTIONALITY ====================

// Chatbot variables
let chatbotOpen = false;
let chatbotMessages = [];
let chatbotTyping = false;
let chatbotContext = null; // Track conversation context

// Initialize chatbot
function initializeChatbot() {
    setupChatbotUI();
    setupChatbotEvents();
    hideChatbotBadge();
}

// Setup chatbot UI
function setupChatbotUI() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    
    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        toggleChatbot();
    });
    
    // Close chatbot
    chatbotClose.addEventListener('click', () => {
        closeChatbot();
    });
    
    // Send message on button click
    chatbotSendBtn.addEventListener('click', () => {
        sendChatbotMessage();
    });
    
    // Send message on Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatbotMessage();
        }
    });
    
    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Initial chatbot message buttons (delegated event listener)
    document.getElementById('chatbotMessages').addEventListener('click', (e) => {
        if (e.target.classList.contains('chatbot-action-btn')) {
            handleChatbotAction(e.target.dataset.action);
        }
    });
}

// Setup chatbot events
function setupChatbotEvents() {
    // Auto-open chatbot for new users
    setTimeout(() => {
        if (!localStorage.getItem('chatbotSeen')) {
            showChatbotBadge();
        }
    }, 3000);
    
    // Show badge when user encounters issues
    document.addEventListener('click', (e) => {
        if (e.target.id === 'captureBtn' && !capturedPhoto) {
            setTimeout(() => {
                if (!capturedPhoto) {
                    showChatbotBadge('Camera issues? I can help!');
                }
            }, 2000);
        }
    });
}

// Toggle chatbot
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbotContainer.classList.add('active');
        document.getElementById('chatbotInput').focus();
        hideChatbotBadge();
        localStorage.setItem('chatbotSeen', 'true');
    } else {
        chatbotContainer.classList.remove('active');
    }
}

// Close chatbot
function closeChatbot() {
    chatbotOpen = false;
    document.getElementById('chatbotContainer').classList.remove('active');
}

// Show chatbot badge
function showChatbotBadge(message = '1') {
    const badge = document.getElementById('chatbotBadge');
    badge.textContent = message;
    badge.style.display = 'flex';
}

// Hide chatbot badge
function hideChatbotBadge() {
    const badge = document.getElementById('chatbotBadge');
    badge.style.display = 'none';
}

// Send chatbot message
function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message || chatbotTyping) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and get response (with delay for realism)
    setTimeout(() => {
        hideTypingIndicator();
        const response = processChatbotMessage(message);
        if (response.buttons || response.card) {
            // Interactive response with buttons or card
            if (response.buttons) {
                addChatbotMessageWithButtons(response.text, 'bot', response.buttons);
            } else if (response.card) {
                addChatbotMessageCard(response.card);
            }
        } else {
            // Regular text response
            addChatbotMessage(response.text || response, 'bot');
        }
        
        // Add suggestions if provided
        if (response.suggestions) {
            addChatbotSuggestions(response.suggestions);
        }
    }, 800 + Math.random() * 500); // Random delay between 800-1300ms
}

// Add message to chatbot
function addChatbotMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${sender}-message`;
    
    const avatar = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="${avatar}"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    chatbotMessages.push({message, sender, time: new Date()});
}

// Process chatbot message and return response
function processChatbotMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return {
            text: `👋 Hello! I'm your CleanCity Assistant! I'm here to help you keep our city clean. What would you like to know?`,
            buttons: [
                { text: '📋 Report Garbage', action: 'report-garbage' },
                { text: '📊 My Reports', action: 'view-reports' },
                { text: '🏛️ Municipal Info', action: 'municipal-info' },
                { text: '❓ Help', action: 'help' }
            ],
            suggestions: ['How do I report garbage?', 'Check my report status', 'Municipal office contact']
        };
    }
    
    // Help with reporting
    if (lowerMessage.includes('report') || lowerMessage.includes('garbage') || lowerMessage.includes('submit')) {
        return {
            text: `📋 Here's how to report garbage:\n\n1️⃣ Click "Report Garbage Now" button\n2️⃣ Allow camera and location access\n3️⃣ Take a photo of the garbage spot\n4️⃣ Select garbage type and severity\n5️⃣ Add description and submit\n\n💰 You'll earn points based on severity:\n• Low: 5 points\n• Medium: 10 points\n• High: 15 points\n• Critical: 25 points`,
            buttons: [
                { text: '🚀 Report Now', action: 'navigate-report' },
                { text: '📸 Camera Help', action: 'camera-help' },
                { text: '📍 Location Help', action: 'location-help' }
            ]
        };
    }
    
    // Camera help
    if (lowerMessage.includes('camera') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
        return {
            text: `📸 Camera troubleshooting:\n\n• Make sure you've allowed camera permissions\n• Try refreshing the page and allowing access again\n• Use a well-lit area for better photos\n• Hold your device steady while taking photos\n• If issues persist, try using a different browser`,
            buttons: [
                { text: '🚀 Report Now', action: 'navigate-report' },
                { text: '❓ More Help', action: 'help' }
            ]
        };
    }
    
    // Location help
    if (lowerMessage.includes('location') || lowerMessage.includes('gps') || lowerMessage.includes('where')) {
        return {
            text: `📍 Location services help:\n\n• Allow location access when prompted\n• Make sure GPS is enabled on your device\n• Try refreshing the page if location isn't detected\n• Location is required to submit reports\n• Your location helps municipal workers find garbage spots`,
            buttons: [
                { text: '🚀 Report Now', action: 'navigate-report' },
                { text: '❓ More Help', action: 'help' }
            ]
        };
    }
    
    // Points and rewards
    if (lowerMessage.includes('point') || lowerMessage.includes('reward') || lowerMessage.includes('earn')) {
        return {
            text: `💰 Earning points in CleanCity:\n\n• Low severity garbage: 5 points\n• Medium severity garbage: 10 points\n• High severity garbage: 15 points\n• Critical severity garbage: 25 points\n\nPoints help you climb the leaderboard and show your contribution to keeping the city clean!`,
            buttons: [
                { text: '📊 View Leaderboard', action: 'navigate-leaderboard' },
                { text: '📋 Report Garbage', action: 'report-garbage' }
            ]
        };
    }
    
    // Login help
    if (lowerMessage.includes('login') || lowerMessage.includes('register') || lowerMessage.includes('account')) {
        return {
            text: `🔐 Account help:\n\n• Click the "Login" button in the top navigation\n• Use demo accounts: john@example.com (password123) or jane@example.com (password123)\n• Or register a new account with your details\n• You need to be logged in to submit reports and earn points`,
            buttons: [
                { text: '🔐 Login', action: 'navigate-login' }
            ]
        };
    }
    
    // Leaderboard help
    if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank') || lowerMessage.includes('top')) {
        return {
            text: `🏆 Leaderboard features:\n\n• View top contributors in your community\n• Filter by time period (week/month/all-time)\n• See how many reports each user has submitted\n• Track your own ranking and progress\n• Compete with other community members!`,
            buttons: [
                { text: '📊 View Leaderboard', action: 'navigate-leaderboard' }
            ]
        };
    }
    
    // Municipal office information
    if (lowerMessage.includes('municipal') || lowerMessage.includes('office') || lowerMessage.includes('city hall')) {
        const info = municipalityDB.getMunicipalityInfo();
        return {
            card: {
                type: 'municipality-info',
                title: '🏛️ ' + info.name,
                content: [
                    { label: '📍 Address', value: info.address },
                    { label: '📞 Phone', value: info.phone },
                    { label: '✉️ Email', value: info.email },
                    { label: '🕐 Hours', value: info.hours }
                ],
                departments: info.departments
            },
            buttons: [
                { text: '📋 View Departments', action: 'view-departments' },
                { text: '📊 Dashboard', action: 'open-dashboard' }
            ]
        };
    }
    
    // Check report status
    if (lowerMessage.includes('status') || lowerMessage.includes('check') || lowerMessage.includes('track')) {
        if (currentUser) {
            const userReports = municipalityDB.getUserReports(currentUser.id);
            if (userReports.length > 0) {
                return {
                    text: `📊 You have ${userReports.length} report(s) submitted to the municipal office.`,
                    buttons: userReports.slice(0, 5).map(report => ({
                        text: `Report #${report.id} - ${report.status}`,
                        action: `check-status-${report.id}`
                    }))
                };
            } else {
                return {
                    text: `You haven't submitted any reports yet. Would you like to report a garbage spot?`,
                    buttons: [
                        { text: '📋 Report Garbage', action: 'navigate-report' },
                        { text: '❓ How to Report', action: 'how-to-report' }
                    ]
                };
            }
        } else {
            return {
                text: `Please login to check your report status.`,
                buttons: [
                    { text: '🔐 Login', action: 'navigate-login' }
                ]
            };
        }
    }
    
    // Municipal dashboard
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('admin')) {
        return {
            text: `🔐 Municipal Dashboard Access:\n\n• Press Ctrl + M to open the dashboard\n• View all submitted reports\n• Mark reports as cleaned\n• Export data for analysis\n• Track pending and completed reports`,
            buttons: [
                { text: '🔓 Open Dashboard', action: 'open-dashboard' }
            ]
        };
    }
    
    // General help
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
        return {
            text: `❓ I can help you with:\n\n• How to report garbage spots\n• Camera and location troubleshooting\n• Understanding the points system\n• Account login and registration\n• Using the leaderboard\n• Municipal dashboard access\n\nJust ask me about any of these topics!`,
            buttons: [
                { text: '📋 Report Garbage', action: 'report-garbage' },
                { text: '📊 My Reports', action: 'view-reports' },
                { text: '🏛️ Municipal Info', action: 'municipal-info' }
            ]
        };
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return {
            text: "You're welcome! I'm always here to help. Feel free to ask if you have any other questions about CleanCity! 😊",
            buttons: [
                { text: '📋 Report Garbage', action: 'report-garbage' },
                { text: '❓ More Help', action: 'help' }
            ]
        };
    }
    
    // Default response
    return {
        text: `I understand you're asking about "${message}". I can help you with:\n\n• Reporting garbage spots\n• Camera and location issues\n• Earning points and rewards\n• Account management\n• Using the leaderboard\n• Municipal dashboard\n\nCould you be more specific about what you need help with?`,
        buttons: [
            { text: '📋 Report Garbage', action: 'report-garbage' },
            { text: '❓ Help', action: 'help' },
            { text: '🏛️ Municipal Info', action: 'municipal-info' }
        ]
    };
}

// Add message with interactive buttons
function addChatbotMessageWithButtons(text, sender, buttons) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${sender}-message`;
    
    const avatar = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const buttonsHTML = buttons.map(btn => 
        `<button class="chatbot-action-btn" data-action="${btn.action}">${btn.text}</button>`
    ).join('');
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="${avatar}"></i>
        </div>
        <div class="message-content">
            <p>${text.replace(/\n/g, '<br>')}</p>
            <div class="message-buttons">${buttonsHTML}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add event listeners to buttons
    messageElement.querySelectorAll('.chatbot-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleChatbotAction(btn.dataset.action);
        });
    });
    
    chatbotMessages.push({text, sender, time: new Date(), buttons});
}

// Add message card (for structured information)
function addChatbotMessageCard(card) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbot-message bot-message';
    
    let cardHTML = '';
    if (card.type === 'municipality-info') {
        const contentHTML = card.content.map(item => 
            `<div class="card-item"><strong>${item.label}:</strong> ${item.value}</div>`
        ).join('');
        
        const departmentsHTML = card.departments.map(dept => 
            `<div class="card-department">
                <strong>${dept.name}</strong>
                <span>${dept.phone}</span>
            </div>`
        ).join('');
        
        cardHTML = `
            <div class="chatbot-card municipality-card">
                <h4>${card.title}</h4>
                <div class="card-content">${contentHTML}</div>
                <div class="card-departments">
                    <strong>Departments:</strong>
                    ${departmentsHTML}
                </div>
            </div>
        `;
    } else if (card.type === 'report-status') {
        const statusColor = card.status === 'cleaned' ? '#28a745' : 
                           card.status === 'in-progress' ? '#ffc107' : '#dc3545';
        cardHTML = `
            <div class="chatbot-card report-card">
                <h4>📋 Report #${card.id}</h4>
                <div class="card-content">
                    <div class="card-item"><strong>Status:</strong> 
                        <span style="color: ${statusColor}">${card.status.toUpperCase()}</span>
                    </div>
                    <div class="card-item"><strong>Type:</strong> ${card.garbageType}</div>
                    <div class="card-item"><strong>Severity:</strong> ${card.severity}</div>
                    <div class="card-item"><strong>Estimated Time:</strong> ${card.estimatedTime}</div>
                    <div class="card-item"><strong>Submitted:</strong> ${new Date(card.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            ${cardHTML}
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add suggestions
function addChatbotSuggestions(suggestions) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const suggestionsElement = document.createElement('div');
    suggestionsElement.className = 'chatbot-suggestions';
    
    suggestionsElement.innerHTML = suggestions.map(suggestion => 
        `<button class="suggestion-btn" data-suggestion="${suggestion}">${suggestion}</button>`
    ).join('');
    
    messagesContainer.appendChild(suggestionsElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add event listeners
    suggestionsElement.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const suggestion = btn.dataset.suggestion;
            addChatbotMessage(suggestion, 'user');
            document.getElementById('chatbotInput').value = '';
            setTimeout(() => {
                sendChatbotMessage();
            }, 100);
        });
    });
}

// Handle chatbot action buttons
function handleChatbotAction(action) {
    if (action.startsWith('check-status-')) {
        const reportId = parseInt(action.replace('check-status-', ''));
        const report = municipalityDB.getData().reports.find(r => r.id === reportId);
        if (report) {
            addChatbotMessageCard({
                type: 'report-status',
                id: report.id,
                status: report.status,
                garbageType: report.garbageType,
                severity: report.severity,
                estimatedTime: report.estimatedTime,
                timestamp: report.timestamp
            });
        }
    } else if (action === 'view-reports') {
        if (currentUser) {
            const userReports = municipalityDB.getUserReports(currentUser.id);
            if (userReports.length > 0) {
                userReports.forEach(report => {
                    addChatbotMessageCard({
                        type: 'report-status',
                        id: report.id,
                        status: report.status,
                        garbageType: report.garbageType,
                        severity: report.severity,
                        estimatedTime: report.estimatedTime,
                        timestamp: report.timestamp
                    });
                });
            } else {
                addChatbotMessage("You haven't submitted any reports yet.", 'bot');
            }
        } else {
            addChatbotMessage("Please login to view your reports.", 'bot');
        }
    } else if (action === 'municipal-info') {
        const info = municipalityDB.getMunicipalityInfo();
        addChatbotMessageCard({
            type: 'municipality-info',
            title: '🏛️ ' + info.name,
            content: [
                { label: '📍 Address', value: info.address },
                { label: '📞 Phone', value: info.phone },
                { label: '✉️ Email', value: info.email },
                { label: '🕐 Hours', value: info.hours }
            ],
            departments: info.departments
        });
    } else if (action === 'navigate-report') {
        document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
        addChatbotMessage("I've scrolled to the report section for you! 📋", 'bot');
    } else if (action === 'navigate-login') {
        document.getElementById('loginBtn').click();
        addChatbotMessage("Opening login modal for you! 🔐", 'bot');
    } else if (action === 'navigate-leaderboard') {
        document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth' });
        addChatbotMessage("I've scrolled to the leaderboard for you! 🏆", 'bot');
    } else if (action === 'open-dashboard') {
        showMunicipalDashboard();
        addChatbotMessage("Opening municipal dashboard! 🏛️", 'bot');
    } else if (action === 'report-garbage' || action === 'how-to-report') {
        const response = processChatbotMessage('how to report');
        if (response.buttons) {
            addChatbotMessageWithButtons(response.text, 'bot', response.buttons);
        } else {
            addChatbotMessage(response.text || response, 'bot');
        }
    } else if (action === 'camera-help') {
        addChatbotMessage(`📸 Camera troubleshooting tips:\n\n• Allow camera permissions when prompted\n• Ensure good lighting for clear photos\n• Hold device steady while capturing\n• Try refreshing if camera doesn't work\n• Use back camera on mobile for better quality`, 'bot');
    } else if (action === 'location-help') {
        addChatbotMessage(`📍 Location services help:\n\n• Allow location access when prompted\n• Enable GPS on your device\n• Location helps municipal workers find spots\n• Refresh page if location isn't detected\n• Location is required for all reports`, 'bot');
    } else if (action === 'help') {
        const response = processChatbotMessage('help');
        addChatbotMessage(response.text || response, 'bot');
    } else if (action === 'view-departments') {
        const info = municipalityDB.getMunicipalityInfo();
        let deptText = "🏛️ Municipal Departments:\n\n";
        info.departments.forEach(dept => {
            deptText += `• ${dept.name}\n  📞 ${dept.phone}\n\n`;
        });
        addChatbotMessage(deptText, 'bot');
    }
}

// Handle quick actions
function handleQuickAction(action) {
    handleChatbotAction(action);
}

// Show typing indicator
function showTypingIndicator() {
    chatbotTyping = true;
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingElement = document.createElement('div');
    typingElement.className = 'chatbot-message bot-message typing-indicator';
    typingElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    chatbotTyping = false;
    const typingElement = document.querySelector('.typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// Add typing indicator CSS
const typingStyle = document.createElement('style');
typingStyle.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 8px 0;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #4a7c59;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(typingStyle);

