# Car Rental Nigeria - Google Maps Integration

## Setup Instructions

### 1. Google Maps API Setup

To use the location picker functionality, you need to set up Google Maps API:

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable these APIs:
     - Places API
     - Maps JavaScript API
   - Create credentials (API Key)

2. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **API Restrictions (Recommended):**
   - Restrict API key to your domain
   - Enable only Places API and Maps JavaScript API
   - Set HTTP referrer restrictions

### 2. Features

- **Real-time Location Search:** Google Places Autocomplete
- **Nigeria-focused:** Restricted to Nigerian locations
- **Smart Suggestions:** Airports, businesses, addresses
- **Professional UI:** Styled to match the booking form

### 3. Admin Panel Integration (Future)

The admin panel will include:
- Custom location management
- Frequently used locations
- Business-specific pickup points
- Location analytics

## Current Status

✅ **Google Maps API Integration Complete**
✅ **Location Picker Component Created**
✅ **Booking Form Updated**
✅ **Nigeria Location Restriction**
✅ **Professional Styling**

## Next Steps

1. Add your Google Maps API key to `.env.local`
2. Test location search functionality
3. Implement admin panel location management
4. Add location-based pricing
5. Integrate with booking system
