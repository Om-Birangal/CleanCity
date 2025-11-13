# CleanCity - Garbage Prevention App

A comprehensive web application for reporting garbage spots, earning rewards, and helping keep communities clean.

## Features

### 🔐 Authentication System
- User registration and login
- Secure password handling
- User profile management

### 📸 Camera & Location Services
- Camera access for photo capture
- GPS location tracking
- Photo retake functionality

### 📊 Reporting System
- Garbage type classification
- Severity level assessment
- Description and photo submission
- Automatic location capture

### 🏆 Reward System
- Points based on severity levels:
  - Low severity: 5 points
  - Medium severity: 10 points
  - High severity: 15 points
  - Critical severity: 25 points
- Thank you messages after submission
- Achievement tracking

### 🏛️ Municipal Dashboard
- View all submitted reports
- Mark reports as cleaned
- Track pending and completed reports
- Export data functionality

### 📱 Social Features
- Community leaderboard
- Social media sharing
- User profiles and statistics
- Time-based filtering (week/month/all-time)

## How to Use

### For Citizens:
1. **Register/Login**: Create an account or login to existing account
2. **Report Garbage**: 
   - Click "Report Garbage Now" button
   - Allow camera and location access
   - Capture photo of garbage spot
   - Fill in garbage type, description, and severity
   - Submit report
3. **Earn Rewards**: Receive points based on severity level
4. **Track Progress**: View your profile, points, and rank on leaderboard
5. **Share**: Share your achievements on social media

### For Municipal Office:
1. **Access Dashboard**: Press `Ctrl + M` to open municipal dashboard
2. **View Reports**: See all submitted reports with details
3. **Mark Cleaned**: Update report status when garbage is cleaned
4. **Export Data**: Download report data for analysis

## Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Local Storage**: Data persists in browser (dummy database)
- **Camera Integration**: Uses device camera for photo capture
- **Geolocation**: Automatic GPS location capture
- **Social Sharing**: Integration with Facebook and Twitter
- **Real-time Updates**: Live statistics and leaderboard updates

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

- This is a demo application with dummy data
- In production, implement proper authentication and data encryption
- Use HTTPS for camera and location access
- Implement proper user validation and sanitization

## Future Enhancements

- Real database integration
- Push notifications
- Mobile app development
- Advanced analytics
- Integration with municipal systems
- Community challenges and events

## Demo Accounts

For testing purposes, you can use these demo accounts:

- **Email**: john@example.com, **Password**: password123
- **Email**: jane@example.com, **Password**: password123
- **Email**: mike@example.com, **Password**: password123

## Getting Started

1. Open `index.html` in a web browser
2. Register a new account or use demo credentials
3. Start reporting garbage spots!
4. Access municipal dashboard with `Ctrl + M`

---

**CleanCity** - Making our communities cleaner, one report at a time! 🌱

