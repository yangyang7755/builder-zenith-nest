# App Store Deployment Guide for Wildpals React Native

This comprehensive guide covers everything you need to deploy your Wildpals React Native app to both the iOS App Store and Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [iOS App Store Deployment](#ios-app-store-deployment)
4. [Google Play Store Deployment](#google-play-store-deployment)
5. [App Store Optimization](#app-store-optimization)
6. [Post-Launch Considerations](#post-launch-considerations)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- **macOS** (required for iOS development)
- **Xcode 14+** (for iOS builds)
- **Android Studio** (for Android builds)
- **Node.js 16+**
- **Expo CLI** (`npm install -g @expo/cli`)
- **EAS CLI** (`npm install -g @expo/eas-cli`)

### Developer Accounts
- **Apple Developer Program** ($99/year)
  - Sign up at [developer.apple.com](https://developer.apple.com)
  - Verify your identity (can take 1-3 business days)
- **Google Play Console** ($25 one-time fee)
  - Sign up at [play.google.com/console](https://play.google.com/console)

## Project Setup

### 1. Configure App Identifiers

Update your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "Wildpals",
    "slug": "wildpals",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1F381F"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.wildpals.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Wildpals uses your location to find nearby outdoor activities.",
        "NSCameraUsageDescription": "Wildpals needs camera access to let you upload photos of your activities.",
        "NSPhotoLibraryUsageDescription": "Wildpals needs photo library access to let you share photos from your adventures."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1F381F"
      },
      "package": "com.wildpals.app",
      "versionCode": 1,
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### 2. Create Required Assets

Create these assets in your `assets/` folder:

#### App Icons
- **icon.png**: 1024x1024px (iOS and Android)
- **adaptive-icon.png**: 1024x1024px (Android adaptive icon foreground)
- **favicon.png**: 48x48px (Web)

#### Splash Screen
- **splash.png**: 1284x2778px (recommended for iPhone 13 Pro Max)

#### App Store Screenshots (iOS)
Create screenshots for these device sizes:
- **6.7" Display (iPhone 14 Plus)**: 1290x2796px
- **6.5" Display (iPhone 11 Pro Max)**: 1242x2688px  
- **5.5" Display (iPhone 8 Plus)**: 1242x2208px
- **12.9" iPad Pro**: 2048x2732px
- **11" iPad Pro**: 1668x2388px

#### Google Play Screenshots (Android)
- **Phone**: 1080x1920px (minimum), 1080x1920px to 3840x7680px
- **Tablet**: 1200x1920px (minimum), 1200x1920px to 7680x12800px

### 3. Configure EAS Build

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## iOS App Store Deployment

### Step 1: Apple Developer Setup

1. **Create App ID**
   - Log into Apple Developer Console
   - Go to Certificates, Identifiers & Profiles
   - Create new App ID with bundle identifier: `com.wildpals.app`
   - Enable capabilities: Push Notifications, Location Services

2. **Create App Store Connect App**
   - Log into [App Store Connect](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Fill in app information:
     - **Name**: Wildpals
     - **Bundle ID**: com.wildpals.app
     - **SKU**: wildpals-ios-001
     - **Primary Language**: English

### Step 2: Build for iOS

1. **Login to EAS**
   ```bash
   eas login
   ```

2. **Configure Project**
   ```bash
   eas build:configure
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Wait for Build**
   - Build typically takes 10-20 minutes
   - You'll receive an email when complete
   - Download the IPA file from the build dashboard

### Step 3: Upload to App Store

1. **Using EAS Submit**
   ```bash
   eas submit --platform ios
   ```

2. **Or Manual Upload via Xcode**
   - Open Xcode
   - Window → Organizer
   - Upload your IPA file

### Step 4: App Store Connect Configuration

1. **App Information**
   - **Category**: Sports
   - **Subcategory**: Outdoor Recreation
   - **Content Rights**: Choose appropriate option

2. **Pricing and Availability**
   - Select "Free" or set your price
   - Choose availability territories
   - Set release date

3. **App Privacy**
   - Complete privacy questionnaire
   - Declare data collection practices:
     - Location data (for finding nearby activities)
     - Contact info (for user profiles)
     - User content (photos, activity posts)

4. **App Review Information**
   - **Demo Account**: Provide test credentials
   - **Contact Information**: Your support contact
   - **Notes**: Include setup instructions for reviewers

5. **Version Information**
   - **Description**: See [App Store Copy](#app-store-copy) below
   - **Keywords**: outdoor, sports, climbing, cycling, running, hiking, community
   - **Screenshots**: Upload 6.7", 6.5", 5.5", and iPad screenshots
   - **App Preview**: Upload demo video (optional but recommended)

### Step 5: Submit for Review

1. Click "Add for Review"
2. Answer additional questions
3. Submit to App Review
4. Review typically takes 24-48 hours

## Google Play Store Deployment

### Step 1: Google Play Console Setup

1. **Create App**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - **App name**: Wildpals
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

2. **Set up App Content**
   - Complete the content questionnaire
   - Set content rating (likely Teen 13+)
   - Add privacy policy URL
   - Complete target audience and content sections

### Step 2: Build for Android

1. **Build Android APK/AAB**
   ```bash
   eas build --platform android --profile production
   ```

2. **Download Build**
   - Wait for build completion (10-15 minutes)
   - Download the AAB (Android App Bundle) file

### Step 3: Upload to Play Console

1. **Create Release**
   - Go to Production → Releases
   - Click "Create new release"
   - Upload your AAB file

2. **Release Notes**
   ```
   Welcome to Wildpals! 
   
   🏔️ Discover outdoor activities near you
   🤝 Connect with like-minded adventurers
   ⭐ Join climbing, cycling, hiking, and more
   📱 Built for outdoor enthusiasts
   
   Get started exploring today!
   ```

### Step 4: Store Listing

1. **App Details**
   - **Short description**: Connect with outdoor enthusiasts for climbing, cycling, hiking and more adventures
   - **Full description**: See [App Store Copy](#app-store-copy) below

2. **Graphics**
   - **App icon**: 512x512px
   - **Feature graphic**: 1024x500px
   - **Phone screenshots**: Upload 4-8 screenshots
   - **Tablet screenshots**: Upload if supporting tablets

3. **Categorization**
   - **Category**: Sports
   - **Tags**: Outdoor, Community, Sports, Adventure

### Step 5: Content Rating & Policies

1. **Content Rating**
   - Complete questionnaire
   - Likely rated Teen (13+) due to social features

2. **Privacy Policy**
   - Provide URL to privacy policy
   - Ensure it covers data collection practices

3. **App Access**
   - Provide test account if needed
   - Include any special instructions

### Step 6: Release

1. **Review Release**
   - Check all sections are complete
   - Verify screenshots and descriptions
   - Test download link

2. **Submit**
   - Click "Review release"
   - Submit for publishing
   - Review takes 1-3 days typically

## App Store Copy

### App Description

**Short Description (150 characters)**
Connect with outdoor enthusiasts for climbing, cycling, hiking and more adventures near you.

**Full Description**

Discover your next outdoor adventure with Wildpals – the community app for outdoor enthusiasts!

🏔️ **Find Activities Near You**
Browse climbing sessions, cycling groups, hiking trips, running clubs, and more in your area. Filter by skill level, date, and activity type to find the perfect match.

🤝 **Connect & Meet People**
Join activities organized by experienced locals or create your own. Build lasting friendships with people who share your passion for the outdoors.

⭐ **Trusted Community**
Read reviews from other adventurers and contribute your own. Our rating system helps you find the best experiences and most reliable organizers.

🎯 **Activities We Support**
• Rock Climbing & Bouldering
• Road & Mountain Cycling  
• Trail Running & Marathon Training
• Hiking & Mountaineering
• Skiing & Snowboarding
• Surfing & Water Sports
• Tennis & Racquet Sports

📱 **Key Features**
• Discover activities by location and interest
• Join clubs and communities
• Real-time chat with activity groups
• Share photos and experiences
• Advanced filtering and search
• Safety-focused community guidelines

Whether you're a beginner looking to learn or an expert wanting to share your skills, Wildpals connects you with the right people for your next outdoor adventure.

Join thousands of outdoor enthusiasts already exploring together!

**Keywords**
outdoor, sports, climbing, cycling, running, hiking, community, adventure, fitness, social, meetup, activities, groups, local, friends

## App Store Optimization

### iOS App Store Keywords

Focus on these high-impact keywords:
- outdoor sports
- climbing community  
- cycling groups
- hiking meetup
- running club
- adventure social
- fitness community
- sports meetup
- outdoor activities
- local sports

### Google Play Store SEO

Optimize for these search terms:
- outdoor activities app
- sports community
- climbing partners
- cycling groups near me
- hiking meetup app
- adventure social network
- fitness community app
- local sports groups
- outdoor enthusiasts
- activity finder

### Screenshot Strategy

**Screenshot 1: Explore Activities**
- Show the main explore screen with activities
- Include location and activity type filters
- Highlight the "near you" aspect

**Screenshot 2: Activity Details**
- Display a detailed activity view
- Show participant info, difficulty level, equipment needed
- Include "Join Activity" button

**Screenshot 3: Community Features**
- Show chat/messaging interface
- Display user profiles and reviews
- Highlight social aspects

**Screenshot 4: Activity Creation**
- Show the create activity flow
- Demonstrate ease of organizing activities
- Include customization options

**Screenshot 5: Profile & Stats**
- User profile with completed activities
- Review system and ratings
- Sports and skill levels

## Post-Launch Considerations

### Analytics and Monitoring

1. **Set up Analytics**
   ```bash
   expo install expo-analytics
   ```

2. **Crash Reporting**
   ```bash
   expo install expo-error-recovery
   ```

3. **Performance Monitoring**
   - Monitor app launch times
   - Track user engagement metrics
   - Monitor crash rates and errors

### Update Strategy

1. **Version Management**
   - Use semantic versioning (1.0.0, 1.0.1, etc.)
   - Plan regular updates every 2-4 weeks
   - Coordinate releases across platforms

2. **OTA Updates**
   ```bash
   eas update --branch production --message "Bug fixes and improvements"
   ```

3. **Store Updates**
   - Build new versions for significant features
   - Update store listings with new screenshots
   - Refresh app descriptions periodically

### Marketing Launch

1. **Pre-Launch**
   - Create landing page
   - Build email list
   - Engage with outdoor communities on social media

2. **Launch Day**
   - Announce on all social channels
   - Reach out to local outdoor clubs
   - Contact outdoor sports bloggers/influencers

3. **Post-Launch**
   - Gather user feedback
   - Monitor reviews and ratings
   - Iterate based on user behavior

## Troubleshooting

### Common iOS Issues

**Build Failures**
```bash
# Clear Expo cache
expo r -c

# Clear EAS cache
eas build --platform ios --clear-cache
```

**Provisioning Profile Issues**
- Ensure bundle identifier matches exactly
- Check Apple Developer account status
- Regenerate certificates if needed

**App Store Rejection**
- Review Apple's App Store Review Guidelines
- Common issues: missing privacy policy, incomplete app functionality
- Provide detailed notes for reviewers

### Common Android Issues

**Build Failures**
```bash
# Clear Gradle cache
cd android && ./gradlew clean

# Clear EAS cache  
eas build --platform android --clear-cache
```

**Google Play Rejection**
- Ensure all store listing sections are complete
- Check content rating matches app functionality
- Verify privacy policy is accessible

**APK vs AAB**
- Always upload AAB files (Android App Bundle)
- AAB files are smaller and support dynamic delivery

### Getting Help

1. **Expo Documentation**
   - [Expo Docs](https://docs.expo.dev)
   - [EAS Build Docs](https://docs.expo.dev/build/introduction/)

2. **Community Support**
   - [Expo Discord](https://chat.expo.dev)
   - [React Native Community](https://reactnative.dev/community/overview)

3. **Store-Specific Help**
   - [Apple Developer Support](https://developer.apple.com/support/)
   - [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

## Estimated Timeline

### First-Time Deployment
- **Setup & Configuration**: 2-3 days
- **Asset Creation**: 3-5 days  
- **Store Listing Setup**: 1-2 days
- **iOS Review**: 1-2 days
- **Android Review**: 1-3 days

**Total**: 7-15 days for first deployment

### Subsequent Updates
- **Bug Fix Updates**: 1-2 days
- **Feature Updates**: 3-7 days
- **Major Version Updates**: 5-10 days

---

**Success Tip**: Start the app store submission process early, even if your app isn't 100% complete. You can always update screenshots and descriptions later, but getting through the initial review process helps identify any major issues early.

Good luck with your app launch! 🚀
