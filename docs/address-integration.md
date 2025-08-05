# Address Integration Setup

This document describes the new robust address system that integrates with Google Maps Places API for address autocomplete and validation.

## Features

- **Google Maps Places Autocomplete**: Real-time address suggestions as users type
- **Structured Address Data**: Separate fields for street address, unit number, postal code, city, state, and country
- **Geolocation**: Automatic latitude/longitude coordinates from Google Maps
- **Backward Compatibility**: Maintains support for the legacy address field
- **Form Validation**: Ensures all required address fields are completed

## Important: Google Maps API Update

⚠️ **Note**: As of March 1st, 2025, `google.maps.places.Autocomplete` is not available to new customers. Google recommends using `google.maps.places.PlaceAutocompleteElement` instead.

While the current implementation will continue to work for existing customers, new implementations should migrate to the new API. See the [migration guide](https://developers.google.com/maps/documentation/javascript/places-migration-overview) for details.

## Database Schema

The new address system adds the following fields to both `caregivers` and `elders` tables:

```sql
ALTER TABLE caregivers
ADD COLUMN street_address VARCHAR(255),
ADD COLUMN unit_number VARCHAR(20),
ADD COLUMN postal_code VARCHAR(10),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

## Environment Setup

### 1. Google Maps API Key

Add your Google Maps API key to the environment variables:

```bash
# .env.local
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 3. Database Migration

Run the new migration to add address fields:

```bash
npm run migrate
```

## Usage

### Frontend Components

The new address system uses the `AddressForm` component:

```tsx
import { AddressForm } from "@/components/ui/address-form";

<AddressForm
  value={addressDetails}
  onChange={handleAddressChange}
  onValidationChange={setIsAddressValid}
/>;
```

### Backend Integration

The backend automatically handles both the new structured address fields and maintains backward compatibility with the legacy address field.

## Address Schema

```typescript
interface Address {
  street_address: string; // Required: Street number and name
  unit_number?: string; // Optional: Apartment, suite, etc.
  postal_code: string; // Required: Postal/ZIP code
  city: string; // Required: City name
  state: string; // Required: State/Province
  country: string; // Required: Country
  latitude?: number; // Optional: GPS coordinates
  longitude?: number; // Optional: GPS coordinates
}
```

## Validation Rules

- **Street Address**: Required, max 255 characters
- **Unit Number**: Optional, max 20 characters
- **Postal Code**: Required, 6-10 characters
- **City**: Required, max 100 characters
- **State/Province**: Required, max 100 characters
- **Country**: Required, max 100 characters
- **Coordinates**: Optional, automatically populated by Google Maps

## Google Maps Integration

The system automatically:

1. Loads the Google Maps JavaScript API
2. Initializes Places Autocomplete on the address input
3. Parses address components from Google's response
4. Populates all address fields automatically
5. Extracts latitude/longitude coordinates
6. Provides real-time validation feedback

## Error Handling

- Graceful fallback when Google Maps API key is not configured
- Clear error messages for missing required fields
- Validation feedback for address completeness
- Network error handling for API calls

## Security Considerations

- API key is restricted to specific domains
- No sensitive data is stored in client-side code
- Address validation happens server-side
- Geolocation data is optional and user-controlled

## Migration Guide

### For Existing Users

The system maintains backward compatibility:

- Existing address data continues to work
- New structured fields are optional
- Legacy address field is automatically populated from structured data

### For New Implementations

1. Set up Google Maps API key
2. Run database migrations
3. Use the new `AddressForm` component
4. Update backend handlers to accept `address_details`

## Troubleshooting

### Common Issues

1. **API Key Not Working**: Ensure the key is enabled for Maps JavaScript API and Places API
2. **Autocomplete Not Showing**: Check browser console for JavaScript errors
3. **Validation Errors**: Verify all required fields are populated
4. **Database Errors**: Ensure migration has been run successfully

### Debug Mode

Enable debug logging by setting:

```bash
VITE_DEBUG_ADDRESS=true
```

This will log address parsing and validation details to the console.
