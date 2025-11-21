# Firestore Security Rules

## Required Rules for Employee Verification System

Add these rules to your Firestore Security Rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is employee
    function isEmployee() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'employee';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Employee Requests Collection - Only admins can read/write
    match /employeeRequests/{requestId} {
      allow read: if isAdmin();
      allow create: if true; // Anyone can create a request (public signup)
      allow update, delete: if isAdmin();
    }
    
    // Users Collection - Role-based access
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        resource.data.role == 'employee' || 
        request.auth.uid == userId ||
        isAdmin()
      );
      allow create: if isAdmin();
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }
    
    // Subscriptions Collection - Admin only
    match /subscriptions/{subscriptionId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Payments Collection - Role-based access
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.userId == request.auth.uid ||
        resource.data.employeeId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAdmin() || resource.data.employeeId == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    // Employee Payments Collection - Admin only
    match /employeePayments/{paymentId} {
      allow read: if isAdmin();
      allow create: if true; // Public signup can create
      allow update, delete: if isAdmin();
    }
    
    // Admin Transactions Collection - Admin only
    match /adminTransactions/{transactionId} {
      allow read, write: if isAdmin();
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules** tab
4. Paste the rules above
5. Click **Publish**

## Important Notes

- These rules assume you have a `users` collection where each document ID is the Firebase Auth UID
- The `role` field in the user document should be one of: `admin`, `employee`, `user`
- For development/testing, you can temporarily use more permissive rules, but **NEVER** deploy these to production

## Testing Rules

After applying rules, test them using:
- Firebase Console > Firestore > Rules > Rules Playground
- Or use the Firebase Emulator Suite for local testing

