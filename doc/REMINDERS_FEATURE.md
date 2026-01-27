# Reminders Feature

## Overview

The Reminders feature allows users to configure reminder settings for water, sleep, gym, and meal activities. Reminders are stored in Firestore under the user document.

## API Endpoints

### GET /api/user/reminders

Get user's reminder settings.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "water": {
      "enabled": true,
      "time": "09:00"
    },
    "sleep": {
      "enabled": false,
      "time": "22:00"
    },
    "gym": {
      "enabled": true,
      "time": "18:00"
    },
    "meal": {
      "enabled": true,
      "time": "12:00"
    }
  }
}
```

**Notes:**
- If no reminders exist, returns default values (all disabled)
- Default times: water (09:00), sleep (22:00), gym (18:00), meal (12:00)

---

### PUT /api/user/reminders

Update user's reminder settings.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "water": {
    "enabled": true,
    "time": "09:00"
  },
  "sleep": {
    "enabled": false,
    "time": "22:00"
  },
  "gym": {
    "enabled": true,
    "time": "18:00"
  },
  "meal": {
    "enabled": true,
    "time": "12:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminders updated successfully",
  "data": {
    "water": { "enabled": true, "time": "09:00" },
    "sleep": { "enabled": false, "time": "22:00" },
    "gym": { "enabled": true, "time": "18:00" },
    "meal": { "enabled": true, "time": "12:00" }
  }
}
```

**Validation:**
- All four reminder types (water, sleep, gym, meal) are required
- `enabled` must be a boolean
- `time` must be a string in HH:mm format (e.g., "09:00", "22:30")
- Valid time range: 00:00 to 23:59

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid water reminder: Time must be in HH:mm format (e.g., 09:00, 22:30)"
}
```

---

## Firestore Structure

### users/{uid}

```javascript
{
  // ... other user fields ...
  
  reminders: {
    water: {
      enabled: true,
      time: "09:00"
    },
    sleep: {
      enabled: false,
      time: "22:00"
    },
    gym: {
      enabled: true,
      time: "18:00"
    },
    meal: {
      enabled: true,
      time: "12:00"
    }
  },
  
  updatedAt: Timestamp  // Updated when reminders are modified
}
```

### Example Document

```javascript
{
  email: "user@fitfix.com",
  displayName: "John Doe",
  role: "user",
  // ... other fields ...
  reminders: {
    water: {
      enabled: true,
      time: "09:00"
    },
    sleep: {
      enabled: true,
      time: "22:00"
    },
    gym: {
      enabled: true,
      time: "18:00"
    },
    meal: {
      enabled: false,
      time: "12:00"
    }
  },
  updatedAt: Timestamp(2024, 1, 15, 10, 30, 0)
}
```

---

## Reminder Types

1. **water** - Water intake reminder
2. **sleep** - Sleep/bedtime reminder
3. **gym** - Gym/workout reminder
4. **meal** - Meal reminder

Each reminder has:
- `enabled` (boolean): Whether the reminder is active
- `time` (string): Time in HH:mm format (24-hour format)

---

## Default Values

If a user has no reminders configured, the system returns:

```json
{
  "water": { "enabled": false, "time": "09:00" },
  "sleep": { "enabled": false, "time": "22:00" },
  "gym": { "enabled": false, "time": "18:00" },
  "meal": { "enabled": false, "time": "12:00" }
}
```

---

## Implementation Notes

- Reminders are stored as a nested object under `users/{uid}/reminders`
- The `updateReminders` function only updates the `reminders` field, preserving all other user fields
- Time validation ensures format is HH:mm (24-hour format)
- All reminders must be provided in the PUT request (partial updates not supported)
- Authentication is required for both endpoints using the `authenticate` middleware

---

## Testing

### Get Reminders
```bash
curl -X GET http://localhost:3000/api/user/reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Reminders
```bash
curl -X PUT http://localhost:3000/api/user/reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "water": { "enabled": true, "time": "09:00" },
    "sleep": { "enabled": false, "time": "22:00" },
    "gym": { "enabled": true, "time": "18:00" },
    "meal": { "enabled": true, "time": "12:00" }
  }'
```

---

## Files Created

1. **src/controllers/remindersController.js** - Reminders controller with get/update functions
2. **src/routes/user.js** - Added reminders routes (modified)

---

## Future Enhancements

- Notification scheduling (cron jobs) to send reminders at specified times
- Push notification integration
- Reminder history/logging
- Custom reminder messages

