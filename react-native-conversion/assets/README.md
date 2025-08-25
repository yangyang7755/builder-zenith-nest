# Assets for Wildpals React Native

## Required Assets

### App Icons
Place these files in the `assets/` directory:

1. **icon.png** (1024x1024px)
   - Main app icon for both iOS and Android
   - Use the Wildpals logo from your web version

2. **adaptive-icon.png** (1024x1024px)
   - Android adaptive icon foreground
   - Should be the logo without background

3. **favicon.png** (48x48px)
   - Web favicon (for Expo web builds)

### Splash Screen
4. **splash.png** (1284x2778px)
   - App splash screen
   - Recommended size for iPhone 13 Pro Max
   - Background: #1F381F (explore-green)
   - Center the Wildpals logo

### Screenshots for App Stores

#### iOS App Store Screenshots
Create these screenshots from your converted React Native app:

- **6.7" Display (iPhone 14 Plus)**: 1290x2796px
- **6.5" Display (iPhone 11 Pro Max)**: 1242x2688px
- **5.5" Display (iPhone 8 Plus)**: 1242x2208px
- **12.9" iPad Pro**: 2048x2732px
- **11" iPad Pro**: 1668x2388px

#### Google Play Screenshots
- **Phone**: 1080x1920px (minimum)
- **Tablet**: 1200x1920px (minimum)

### Image Assets Used in App
These images are already referenced in the code:

1. **Club Logos**
   - Westway Climbing Centre
   - Oxford University Cycling Club
   - Rapha Cycling Club London
   - VauxWall East Climbing Centre

2. **User Profile Images**
   - Using Unsplash images as placeholders
   - In production, these would be user-uploaded

3. **Activity Images**
   - Activity card thumbnails
   - Partner request profile photos

## Font Configuration

The app uses system fonts by default for cross-platform consistency:

- **iOS**: SF Pro Text/Display
- **Android**: Roboto
- **Web**: System fonts stack

### Custom Fonts (Optional)
If you want to use custom fonts matching your web version:

1. Add font files to `assets/fonts/`
2. Configure in `expo-font`
3. Update the typography constants

## Asset Optimization

### Image Optimization Guidelines
1. Use WebP format when possible for smaller file sizes
2. Provide multiple resolutions (@2x, @3x for iOS)
3. Compress images without losing quality
4. Use appropriate color spaces (sRGB)

### Performance Tips
1. Lazy load large images
2. Use placeholder images while loading
3. Cache frequently used images
4. Consider using remote images with caching

## Implementation Notes

The React Native conversion maintains exact visual consistency with your web version by:

1. Using the same color scheme (#1F381F explore-green, etc.)
2. Matching typography hierarchy
3. Preserving layout proportions
4. Using identical image assets where possible

All asset references in the code use URLs that match your existing web assets, ensuring visual consistency between platforms.
