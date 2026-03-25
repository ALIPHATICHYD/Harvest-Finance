# Authentication & Profile Management Test Guide

## Test Endpoints

### 1. User Registration
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "role": "FARMER",
  "full_name": "John Farmer",
  "phone_number": "+1234567890",
  "stellar_address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

### 2. User Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}
```

### 3. Get User Profile
```bash
GET /api/v1/users/{userId}
Authorization: Bearer {access_token_from_login}
```

### 4. Update User Profile
```bash
PUT /api/v1/users/{userId}
Authorization: Bearer {access_token_from_login}
Content-Type: application/json

{
  "first_name": "John Updated",
  "phone": "+9876543210"
}
```

### 5. Create Order (Protected Endpoint)
```bash
POST /api/v1/orders
Authorization: Bearer {access_token_from_login}
Content-Type: application/json

{
  "crop_type": "WHEAT",
  "quantity": 1000,
  "price_per_ton": 500,
  "delivery_location": "Farm Address"
}
```

## Security Features Implemented

✅ **JWT Authentication**: All sensitive endpoints are protected
✅ **Password Hashing**: Using bcrypt with salt rounds
✅ **Input Validation**: Using class-validator with comprehensive rules
✅ **Role-based Access**: Different roles have different permissions
✅ **Token Blacklisting**: Logout functionality invalidates tokens
✅ **Rate Limiting**: Throttling on auth endpoints
✅ **Profile Management**: Full CRUD operations for user profiles

## Testing the System

1. Start the server: `npm run start:dev`
2. Use the above endpoints to test the authentication flow
3. Verify that protected endpoints return 401 without tokens
4. Test role-based access by creating users with different roles
5. Verify password validation and email uniqueness

## Expected Responses

- **Registration**: 201 Created with user data and tokens
- **Login**: 200 OK with access and refresh tokens
- **Protected Routes**: 401 Unauthorized without valid JWT
- **Profile Updates**: 200 OK with updated user data
- **Invalid Tokens**: 401 Unauthorized with clear error messages
