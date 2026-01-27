# Entity-Relationship (ER) Diagram Creation Guide for FitFix Database

## Using Visual Paradigm

This guide provides step-by-step instructions for creating a complete ER diagram in Visual Paradigm based on the existing Firestore database schema for the FitFix fitness management system.

---

## 1. Entity Identification

Based on the Firestore collections, identify the following **14 main entities**:

1. **Users** (represents Admin, Employee, and User roles)
2. **Chats**
3. **Messages**
4. **Notifications**
5. **Payments**
6. **EmployeePayments**
7. **Subscriptions**
8. **EmployeeRequests**
9. **MealPlans**
10. **MealPlanTemplates**
11. **WorkoutPlans**
12. **Exercises**
13. **Progress** (subcollection - special handling required)
14. **AdminTransactions**

---

## 2. Entity Specifications

### 2.1 Entity: Users

**Primary Key (PK):**
- `uid` (String) - Firebase Auth UID

**Main Attributes:**
- `email` (string, UNIQUE)
- `displayName` (string)
- `role` (string) - 'admin', 'employee', or 'user'
- `isActive` (boolean)
- `phoneNumber` (string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `assignedEmployeeId` (string) - **FK** → Users.uid (self-referencing)
- `subscriptionId` (string) - **FK** → Subscriptions.id

**Note on Data Types**: In Firestore, data types are lowercase: `string`, `number`, `boolean`, `timestamp`, `array`, `map`, `reference`, `null`. In ER diagrams, these are commonly represented with capital letters for clarity, but the actual Firestore types are lowercase.

**Special Notes:**
- This entity represents three roles (Admin, Employee, User) in a single table
- Use a discriminator attribute `role` to distinguish between types
- `assignedEmployeeId` creates a self-referencing relationship (User → Employee)

**Visual Paradigm Steps:**
1. Create entity named "Users"
2. Add `uid` as Primary Key
3. Add all attributes listed above
4. Mark `assignedEmployeeId` and `subscriptionId` as Foreign Keys (you'll connect them later)

---

### 2.2 Entity: Chats

**Primary Key (PK):**
- `chatId` (String) - Format: `{role1}_{id1}__{role2}_{id2}`

**Main Attributes:**
- `chatId` (String, PK)
- `lastActivity` (Timestamp)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `participants` (Array<String>) - **Special handling required** (see Section 7)

**Foreign Keys:**
- No direct FK fields (relationships handled through participants array)

**Visual Paradigm Steps:**
1. Create entity named "Chats"
2. Add `chatId` as Primary Key
3. Add other attributes
4. Note: `participants` will be handled as a Many-to-Many relationship

---

### 2.3 Entity: Messages

**Primary Key (PK):**
- `messageId` (String)

**Main Attributes:**
- `messageId` (String, PK)
- `content` (String)
- `type` (String) - 'text', 'image', 'file'
- `read` (Boolean)
- `readAt` (Timestamp)
- `createdAt` (Timestamp)
- `chatId` (String) - **FK** → Chats.chatId
- `senderId` (String) - **FK** → Users.uid
- `recipientId` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "Messages"
2. Add `messageId` as Primary Key
3. Add all attributes
4. Mark `chatId`, `senderId`, and `recipientId` as Foreign Keys

---

### 2.4 Entity: Notifications

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `type` (String)
- `title` (String)
- `message` (String)
- `read` (Boolean)
- `createdAt` (Timestamp)
- `userId` (String) - **FK** → Users.uid
- `relatedId` (String)
- `relatedType` (String)

**Visual Paradigm Steps:**
1. Create entity named "Notifications"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `userId` as Foreign Key

---

### 2.5 Entity: Payments

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `amount` (Number)
- `method` (String)
- `status` (String) - 'pending', 'completed', 'rejected'
- `createdAt` (Timestamp)
- `userId` (String) - **FK** → Users.uid
- `employeeId` (String) - **FK** → Users.uid
- `approvedByEmployeeId` (String) - **FK** → Users.uid
- `approvedByAdminId` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "Payments"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark all user-related fields as Foreign Keys

---

### 2.6 Entity: EmployeePayments

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `name` (String)
- `email` (String, UNIQUE)
- `phoneNumber` (String)
- `selectedPlan` (String)
- `amount` (Number)
- `paid` (Boolean)
- `createdAt` (Timestamp)
- `accountCreated` (Boolean)

**Foreign Keys:**
- None (standalone entity, referenced by Subscriptions)

**Visual Paradigm Steps:**
1. Create entity named "EmployeePayments"
2. Add `id` as Primary Key
3. Add all attributes

---

### 2.7 Entity: Subscriptions

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `employeeEmail` (String)
- `planType` (String)
- `amount` (Number)
- `startDate` (Timestamp)
- `expirationDate` (Timestamp)
- `status` (String)
- `isActive` (Boolean)
- `employeePaymentId` (String) - **FK** → EmployeePayments.id

**Visual Paradigm Steps:**
1. Create entity named "Subscriptions"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `employeePaymentId` as Foreign Key

---

### 2.8 Entity: EmployeeRequests

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `fullName` (String)
- `email` (String, UNIQUE)
- `phone` (String)
- `selectedPlan` (String)
- `amount` (Number)
- `status` (String) - 'pending', 'approved', 'rejected'
- `createdAt` (Timestamp)
- `reviewedBy` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "EmployeeRequests"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `reviewedBy` as Foreign Key

---

### 2.9 Entity: MealPlans

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `title` (String)
- `goal` (String)
- `totalCalories` (Number)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `userId` (String) - **FK** → Users.uid
- `employeeId` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "MealPlans"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `userId` and `employeeId` as Foreign Keys

---

### 2.10 Entity: MealPlanTemplates

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `title` (String)
- `category` (String)
- `createdAt` (Timestamp)
- `createdBy` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "MealPlanTemplates"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `createdBy` as Foreign Key

---

### 2.11 Entity: WorkoutPlans

**Primary Key (PK):**
- `id` (String) - Usually equals userId

**Main Attributes:**
- `id` (String, PK)
- `title` (String)
- `duration` (Number)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `userId` (String) - **FK** → Users.uid
- `employeeId` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "WorkoutPlans"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `userId` and `employeeId` as Foreign Keys

---

### 2.12 Entity: Exercises

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `name` (String)
- `category` (String)
- `difficulty` (String)
- `gifUrl` (String)
- `gifUrlFemale` (String)
- `createdAt` (Timestamp)

**Foreign Keys:**
- None (referenced by WorkoutPlans through exercises array)

**Visual Paradigm Steps:**
1. Create entity named "Exercises"
2. Add `id` as Primary Key
3. Add all attributes

---

### 2.13 Entity: Progress

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `date` (Timestamp)
- `weight` (Number)
- `bodyFat` (Number)
- `createdAt` (Timestamp)
- `userId` (String) - **FK** → Users.uid

**Special Notes:**
- This is a subcollection under `users/{userId}/progress`
- In ER diagram, treat as regular entity with FK to Users

**Visual Paradigm Steps:**
1. Create entity named "Progress"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `userId` as Foreign Key

---

### 2.14 Entity: AdminTransactions

**Primary Key (PK):**
- `id` (String)

**Main Attributes:**
- `id` (String, PK)
- `type` (String)
- `amount` (Number)
- `description` (String)
- `createdAt` (Timestamp)
- `createdBy` (String) - **FK** → Users.uid

**Visual Paradigm Steps:**
1. Create entity named "AdminTransactions"
2. Add `id` as Primary Key
3. Add all attributes
4. Mark `createdBy` as Foreign Key

---

## 3. Relationship Definitions

### 3.1 One-to-One (1:1) Relationships

**Users ↔ Subscriptions** (via `subscriptionId`)
- **Cardinality**: One User can have One Subscription (optional)
- **Direction**: Users → Subscriptions
- **Visual Paradigm**: 
  - Draw relationship line from Users to Subscriptions
  - Set cardinality: Users (1) to Subscriptions (0..1)
  - Label: "has subscription"

---

### 3.2 One-to-Many (1:N) Relationships

#### 3.2.1 Users → Users (Self-Referencing)
- **Relationship**: User assigned to Employee
- **Cardinality**: One Employee can have Many Users (1:N)
- **Direction**: Users (Employee) → Users (User)
- **Visual Paradigm**:
  - Draw relationship line from Users to itself (self-referencing)
  - Set cardinality: Users (1) to Users (0..*)
  - Label: "assigned to"
  - Add role constraint: "where role='employee'" and "where role='user'"

#### 3.2.2 Users → Notifications
- **Cardinality**: One User can have Many Notifications (1:N)
- **Direction**: Users → Notifications
- **Visual Paradigm**:
  - Draw relationship from Users to Notifications
  - Set cardinality: Users (1) to Notifications (0..*)
  - Label: "receives"

#### 3.2.3 Users → Payments (as payer)
- **Cardinality**: One User can make Many Payments (1:N)
- **Direction**: Users → Payments
- **Visual Paradigm**:
  - Draw relationship from Users to Payments
  - Set cardinality: Users (1) to Payments (0..*)
  - Label: "makes payment"

#### 3.2.4 Users → Payments (as payee - Employee)
- **Cardinality**: One Employee can receive Many Payments (1:N)
- **Direction**: Users (Employee) → Payments
- **Visual Paradigm**:
  - Draw relationship from Users to Payments
  - Set cardinality: Users (1) to Payments (0..*)
  - Label: "receives payment"
  - Add role constraint: "where role='employee'"

#### 3.2.5 Users → Progress
- **Cardinality**: One User can have Many Progress entries (1:N)
- **Direction**: Users → Progress
- **Visual Paradigm**:
  - Draw relationship from Users to Progress
  - Set cardinality: Users (1) to Progress (0..*)
  - Label: "tracks progress"

#### 3.2.6 Users → MealPlans
- **Cardinality**: One User can have Many MealPlans (1:N)
- **Direction**: Users → MealPlans
- **Visual Paradigm**:
  - Draw relationship from Users to MealPlans
  - Set cardinality: Users (1) to MealPlans (0..*)
  - Label: "has meal plan"

#### 3.2.7 Users → MealPlans (as creator - Employee)
- **Cardinality**: One Employee can create Many MealPlans (1:N)
- **Direction**: Users (Employee) → MealPlans
- **Visual Paradigm**:
  - Draw relationship from Users to MealPlans
  - Set cardinality: Users (1) to MealPlans (0..*)
  - Label: "creates meal plan"
  - Add role constraint: "where role='employee'"

#### 3.2.8 Users → WorkoutPlans
- **Cardinality**: One User can have Many WorkoutPlans (1:N)
- **Direction**: Users → WorkoutPlans
- **Visual Paradigm**:
  - Draw relationship from Users to WorkoutPlans
  - Set cardinality: Users (1) to WorkoutPlans (0..*)
  - Label: "has workout plan"

#### 3.2.9 Users → WorkoutPlans (as creator - Employee)
- **Cardinality**: One Employee can create Many WorkoutPlans (1:N)
- **Direction**: Users (Employee) → WorkoutPlans
- **Visual Paradigm**:
  - Draw relationship from Users to WorkoutPlans
  - Set cardinality: Users (1) to WorkoutPlans (0..*)
  - Label: "creates workout plan"
  - Add role constraint: "where role='employee'"

#### 3.2.10 Users → MealPlanTemplates
- **Cardinality**: One Employee can create Many MealPlanTemplates (1:N)
- **Direction**: Users (Employee) → MealPlanTemplates
- **Visual Paradigm**:
  - Draw relationship from Users to MealPlanTemplates
  - Set cardinality: Users (1) to MealPlanTemplates (0..*)
  - Label: "creates template"
  - Add role constraint: "where role='employee'"

#### 3.2.11 Users → EmployeeRequests
- **Cardinality**: One Admin can review Many EmployeeRequests (1:N)
- **Direction**: Users (Admin) → EmployeeRequests
- **Visual Paradigm**:
  - Draw relationship from Users to EmployeeRequests
  - Set cardinality: Users (1) to EmployeeRequests (0..*)
  - Label: "reviews request"
  - Add role constraint: "where role='admin'"

#### 3.2.12 Users → AdminTransactions
- **Cardinality**: One Admin can create Many AdminTransactions (1:N)
- **Direction**: Users (Admin) → AdminTransactions
- **Visual Paradigm**:
  - Draw relationship from Users to AdminTransactions
  - Set cardinality: Users (1) to AdminTransactions (0..*)
  - Label: "creates transaction"
  - Add role constraint: "where role='admin'"

#### 3.2.13 Chats → Messages
- **Cardinality**: One Chat can have Many Messages (1:N)
- **Direction**: Chats → Messages
- **Visual Paradigm**:
  - Draw relationship from Chats to Messages
  - Set cardinality: Chats (1) to Messages (0..*)
  - Label: "contains"

#### 3.2.14 EmployeePayments → Subscriptions
- **Cardinality**: One EmployeePayment can create One Subscription (1:1)
- **Direction**: EmployeePayments → Subscriptions
- **Visual Paradigm**:
  - Draw relationship from EmployeePayments to Subscriptions
  - Set cardinality: EmployeePayments (1) to Subscriptions (0..1)
  - Label: "creates subscription"

#### 3.2.15 Users → Payments (as approver - Employee)
- **Cardinality**: One Employee can approve Many Payments (1:N)
- **Direction**: Users (Employee) → Payments
- **Visual Paradigm**:
  - Draw relationship from Users to Payments
  - Set cardinality: Users (1) to Payments (0..*)
  - Label: "approves payment"
  - Add role constraint: "where role='employee'"

#### 3.2.16 Users → Payments (as approver - Admin)
- **Cardinality**: One Admin can approve Many Payments (1:N)
- **Direction**: Users (Admin) → Payments
- **Visual Paradigm**:
  - Draw relationship from Users to Payments
  - Set cardinality: Users (1) to Payments (0..*)
  - Label: "approves payment (admin)"
  - Add role constraint: "where role='admin'"

#### 3.2.17 Users → Messages (as sender)
- **Cardinality**: One User can send Many Messages (1:N)
- **Direction**: Users → Messages
- **Visual Paradigm**:
  - Draw relationship from Users to Messages
  - Set cardinality: Users (1) to Messages (0..*)
  - Label: "sends"

#### 3.2.18 Users → Messages (as recipient)
- **Cardinality**: One User can receive Many Messages (1:N)
- **Direction**: Users → Messages
- **Visual Paradigm**:
  - Draw relationship from Users to Messages
  - Set cardinality: Users (1) to Messages (0..*)
  - Label: "receives"

---

### 3.3 Many-to-Many (M:N) Relationships

#### 3.3.1 Users ↔ Chats
- **Relationship**: Users participate in Chats
- **Cardinality**: Many Users can participate in Many Chats (M:N)
- **Implementation**: Through `participants` array in Chats entity
- **Visual Paradigm**:
  - Draw relationship line between Users and Chats
  - Set cardinality: Users (0..*) to Chats (0..*)
  - Label: "participates in"
  - **Note**: This represents the participants array - in ER diagram, show as M:N relationship

#### 3.3.2 Exercises ↔ WorkoutPlans
- **Relationship**: Exercises are included in WorkoutPlans
- **Cardinality**: Many Exercises can be in Many WorkoutPlans (M:N)
- **Implementation**: Through `exercises` array in WorkoutPlans entity
- **Visual Paradigm**:
  - Draw relationship line between Exercises and WorkoutPlans
  - Set cardinality: Exercises (0..*) to WorkoutPlans (0..*)
  - Label: "included in"
  - **Note**: This represents the exercises array - in ER diagram, show as M:N relationship

---

## 4. Handling Role-Based Users in Single Entity

### 4.1 Concept

The `Users` entity represents three distinct roles (Admin, Employee, User) in a single table. This is called a **Single Table Inheritance** pattern.

### 4.2 Visual Representation in Visual Paradigm

**Option 1: Single Entity with Discriminator**
1. Create one "Users" entity
2. Add `role` attribute as a discriminator
3. Use relationship labels to indicate role constraints
4. Example: "Users (Employee) → Payments" means only users with role='employee'

**Option 2: Subtypes (Recommended for Clarity)**
1. Create base entity "Users" with common attributes
2. Create three subtypes:
   - **Admin** (inherits from Users)
   - **Employee** (inherits from Users)
   - **User** (inherits from Users)
3. In Visual Paradigm:
   - Right-click Users entity → Add → Subtype
   - Create Admin, Employee, User subtypes
   - Draw relationships from specific subtypes where applicable

**Visual Paradigm Steps for Option 2:**
1. Create "Users" entity with common attributes (uid, email, displayName, createdAt, etc.)
2. Right-click Users → Add → Subtype → Name it "Admin"
3. Right-click Users → Add → Subtype → Name it "Employee"
4. Right-click Users → Add → Subtype → Name it "User"
5. Add role-specific attributes to subtypes if needed
6. Draw relationships from appropriate subtypes:
   - Employee → Users (User) [assignedEmployeeId]
   - Employee → MealPlans [employeeId]
   - Employee → WorkoutPlans [employeeId]
   - Admin → EmployeeRequests [reviewedBy]
   - Admin → AdminTransactions [createdBy]

---

## 5. Handling Firestore Subcollections

### 5.1 Concept

In Firestore, `progress` is stored as a subcollection: `users/{userId}/progress`. In a relational ER diagram, this is represented as a regular entity with a foreign key.

### 5.2 Visual Representation

**Progress Entity:**
- Treat `Progress` as a regular entity (not nested)
- Add `userId` as Foreign Key → Users.uid
- Draw One-to-Many relationship: Users (1) → Progress (0..*)
- Label: "tracks progress"

**Visual Paradigm Steps:**
1. Create "Progress" entity normally
2. Add `userId` attribute marked as Foreign Key
3. Draw relationship line from Users to Progress
4. Set cardinality: Users (1) to Progress (0..*)
5. Add note: "Stored as subcollection: users/{userId}/progress"

**Note**: Similarly, `chats/{chatId}/messages` subcollection is represented as Messages entity with FK to Chats.

---

## 6. Handling Array Fields in Relationships

### 6.1 Concept

Firestore uses arrays for many-to-many relationships (e.g., `participants[]` in Chats, `exercises[]` in WorkoutPlans). In ER diagrams, these are represented as M:N relationships.

### 6.2 Array Fields to Convert

#### 6.2.1 Chats.participants[]
- **Represents**: Many Users participate in Many Chats
- **ER Representation**: M:N relationship between Users and Chats
- **Visual Paradigm**:
  - Draw relationship between Users and Chats
  - Set cardinality: Users (0..*) ↔ Chats (0..*)
  - Label: "participates in"
  - Add note: "Implemented via participants[] array"

#### 6.2.2 WorkoutPlans.exercises[]
- **Represents**: Many Exercises are in Many WorkoutPlans
- **ER Representation**: M:N relationship between Exercises and WorkoutPlans
- **Visual Paradigm**:
  - Draw relationship between Exercises and WorkoutPlans
  - Set cardinality: Exercises (0..*) ↔ WorkoutPlans (0..*)
  - Label: "included in"
  - Add note: "Implemented via exercises[] array"

### 6.3 Visual Paradigm Steps for M:N Relationships

1. Draw relationship line between the two entities
2. Double-click the relationship line
3. Set cardinality on both ends to "0..*" (Many)
4. Add relationship label
5. Add note explaining array implementation

---

## 7. Step-by-Step Visual Paradigm Instructions

### 7.1 Initial Setup

1. **Open Visual Paradigm**
   - Launch Visual Paradigm
   - Create new project: File → New Project → Name it "FitFix_ER_Diagram"

2. **Create ER Diagram**
   - Right-click project → New Diagram → Entity Relationship Diagram
   - Name it "FitFix_Database_ERD"

3. **Set Diagram Properties**
   - Right-click diagram → Properties
   - Set notation: Crow's Foot (recommended) or IDEF1X

### 7.2 Creating Entities

**For each entity:**

1. **Add Entity**
   - Click "Entity" tool from toolbar (or Insert → Entity)
   - Click on diagram canvas
   - Name the entity (e.g., "Users")

2. **Add Attributes**
   - Double-click entity to open properties
   - Go to "Attributes" tab
   - Click "Add" to add each attribute
   - For each attribute:
     - Name: e.g., "uid"
     - Type: Use Firestore types (lowercase): `string`, `number`, `boolean`, `timestamp`, `array`, `map`
       - Note: Visual Paradigm may show these as capitalized (String, Number, etc.) which is acceptable for ER diagrams
       - The actual Firestore types are lowercase: string, number, boolean, timestamp
     - Check "Primary Key" for PK
     - Check "Foreign Key" for FK (you'll connect later)

3. **Set Primary Key**
   - Select attribute → Right-click → Set as Primary Key
   - Or check "Primary Key" checkbox in attribute properties

4. **Repeat for all 14 entities**

### 7.3 Creating Relationships

**For each relationship:**

1. **Draw Relationship Line**
   - Click "Relationship" tool from toolbar
   - Click on source entity (e.g., Users)
   - Drag to target entity (e.g., Notifications)
   - Release mouse

2. **Set Cardinality**
   - Double-click relationship line
   - Go to "Cardinality" tab
   - Set source cardinality (e.g., "1")
   - Set target cardinality (e.g., "0..*" for Many)
   - Common cardinalities:
     - 1:1 → "1" to "0..1" or "1" to "1"
     - 1:N → "1" to "0..*"
     - M:N → "0..*" to "0..*"

3. **Add Relationship Label**
   - Double-click relationship line
   - Go to "Name" field
   - Enter label (e.g., "receives", "creates", "assigned to")

4. **Add Role Constraints (if needed)**
   - For relationships involving specific roles:
     - Right-click relationship → Add Note
     - Add constraint: "where role='employee'" or similar

### 7.4 Layout and Organization

**Recommended Layout:**

1. **Center**: Place "Users" entity in center (largest, most connected)

2. **Top Section**: 
   - EmployeePayments
   - EmployeeRequests
   - Subscriptions

3. **Left Section**:
   - MealPlans
   - MealPlanTemplates
   - WorkoutPlans
   - Exercises

4. **Right Section**:
   - Chats
   - Messages
   - Notifications

5. **Bottom Section**:
   - Payments
   - Progress
   - AdminTransactions

**Visual Paradigm Layout Tools:**
- Select multiple entities → Right-click → Align → Choose alignment
- Select entities → Right-click → Auto Layout → Choose layout style
- Use "Auto Route" for relationship lines

### 7.5 Adding Notes and Constraints

1. **Add Notes for Special Cases**
   - Right-click entity → Add Note
   - Add notes for:
     - Subcollections: "Stored as subcollection: users/{userId}/progress"
     - Array fields: "Implemented via participants[] array"
     - Role constraints: "Only for role='employee'"

2. **Add Constraints**
   - Double-click relationship
   - Go to "Constraints" tab
   - Add constraint text (e.g., "role='employee'")

### 7.6 Finalizing the Diagram

1. **Review All Relationships**
   - Verify all foreign keys are connected
   - Check cardinalities are correct
   - Ensure labels are clear

2. **Add Title and Legend**
   - Insert → Text Box → Add title: "FitFix Database ER Diagram"
   - Add legend explaining:
     - Cardinality notation
     - Role constraints
     - Subcollection notation

3. **Export Diagram**
   - File → Export → Image
   - Choose format: PNG, JPG, or PDF
   - Set resolution (recommended: 300 DPI for reports)

---

## 8. Complete Relationship Summary Table

| Relationship | Type | Cardinality | Label | Notes |
|--------------|------|-------------|-------|-------|
| Users → Users | 1:N | 1 to 0..* | assigned to | Self-referencing, Employee → User |
| Users → Subscriptions | 1:1 | 1 to 0..1 | has subscription | Optional |
| Users → Notifications | 1:N | 1 to 0..* | receives | |
| Users → Payments (payer) | 1:N | 1 to 0..* | makes payment | |
| Users → Payments (payee) | 1:N | 1 to 0..* | receives payment | role='employee' |
| Users → Payments (approver) | 1:N | 1 to 0..* | approves payment | role='employee' or 'admin' |
| Users → Progress | 1:N | 1 to 0..* | tracks progress | Subcollection |
| Users → MealPlans (owner) | 1:N | 1 to 0..* | has meal plan | |
| Users → MealPlans (creator) | 1:N | 1 to 0..* | creates meal plan | role='employee' |
| Users → WorkoutPlans (owner) | 1:N | 1 to 0..* | has workout plan | |
| Users → WorkoutPlans (creator) | 1:N | 1 to 0..* | creates workout plan | role='employee' |
| Users → MealPlanTemplates | 1:N | 1 to 0..* | creates template | role='employee' |
| Users → EmployeeRequests | 1:N | 1 to 0..* | reviews request | role='admin' |
| Users → AdminTransactions | 1:N | 1 to 0..* | creates transaction | role='admin' |
| Users → Messages (sender) | 1:N | 1 to 0..* | sends | |
| Users → Messages (recipient) | 1:N | 1 to 0..* | receives | |
| Users ↔ Chats | M:N | 0..* to 0..* | participates in | Via participants[] array |
| Chats → Messages | 1:N | 1 to 0..* | contains | Subcollection |
| EmployeePayments → Subscriptions | 1:1 | 1 to 0..1 | creates subscription | |
| Exercises ↔ WorkoutPlans | M:N | 0..* to 0..* | included in | Via exercises[] array |

---

## 9. Best Practices for ER Diagram in Visual Paradigm

1. **Use Consistent Naming**
   - Entity names: Singular (User, not Users) or Plural (Users) - be consistent
   - Attribute names: camelCase or snake_case - be consistent
   - Relationship labels: Verb phrases (e.g., "creates", "has", "belongs to")

2. **Color Coding (Optional)**
   - Use colors to distinguish entity types:
     - Blue: Core entities (Users, Chats)
     - Green: Transaction entities (Payments, Subscriptions)
     - Orange: Content entities (MealPlans, WorkoutPlans)
     - Purple: Reference entities (Exercises, Templates)

3. **Group Related Entities**
   - Use Visual Paradigm's "Package" or grouping feature
   - Group by domain: Authentication, Payments, Content, Communication

4. **Documentation**
   - Add notes for complex relationships
   - Document business rules
   - Explain Firestore-specific implementations

5. **Validation**
   - Ensure all foreign keys have corresponding relationships
   - Verify cardinalities match business logic
   - Check that role constraints are properly documented

---

## 10. Example Visual Paradigm Workflow

### Step 1: Create Users Entity
1. Click Entity tool → Click canvas → Name: "Users"
2. Double-click → Attributes tab → Add:
   - uid (String, PK)
   - email (String, UNIQUE)
   - displayName (String)
   - role (String)
   - isActive (Boolean)
   - assignedEmployeeId (String, FK)
   - subscriptionId (String, FK)

### Step 2: Create Subtypes (Optional)
1. Right-click Users → Add → Subtype → "Admin"
2. Right-click Users → Add → Subtype → "Employee"
3. Right-click Users → Add → Subtype → "User"

### Step 3: Create Notifications Entity
1. Click Entity tool → Click canvas → Name: "Notifications"
2. Add attributes with userId as FK

### Step 4: Create Relationship
1. Click Relationship tool
2. Click Users → Drag to Notifications
3. Double-click relationship → Set cardinality: 1 to 0..*
4. Set label: "receives"

### Step 5: Repeat for All Entities and Relationships

---

## 11. Final Checklist

Before finalizing your ER diagram, verify:

- [ ] All 14 entities are created
- [ ] All primary keys are defined
- [ ] All foreign keys are connected via relationships
- [ ] All cardinalities are correct
- [ ] Role constraints are documented
- [ ] Subcollections are represented correctly
- [ ] Array fields are represented as M:N relationships
- [ ] Relationship labels are clear and descriptive
- [ ] Diagram is well-organized and readable
- [ ] Notes are added for special cases
- [ ] Title and legend are included

---

## 12. Exporting for Report

1. **High-Resolution Export**
   - File → Export → Image
   - Format: PNG or PDF
   - Resolution: 300 DPI minimum
   - Size: Large enough for report printing

2. **Including in Report**
   - Add figure caption: "Figure X: FitFix Database Entity-Relationship Diagram"
   - Reference in text: "As shown in Figure X, the database consists of 14 main entities..."
   - Explain key relationships in text

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Purpose**: Graduation Project Documentation - ER Diagram Creation Guide

