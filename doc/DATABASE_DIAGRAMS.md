# FitFix Database Diagrams

This document contains visual database diagrams using Mermaid syntax. These diagrams can be rendered on GitHub, in documentation tools, or using Mermaid-compatible tools.

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ CHATS : "participates"
    USERS ||--o{ MESSAGES : "sends/receives"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ PROGRESS : "tracks"
    USERS ||--o{ MEAL_PLANS : "assigned"
    USERS ||--o{ WORKOUT_PLANS : "assigned"
    USERS ||--o{ SUBSCRIPTIONS : "has"
    USERS ||--o{ EMPLOYEE_PAYMENTS : "makes"
    USERS ||--o{ EMPLOYEE_REQUESTS : "creates"
    
    CHATS ||--o{ MESSAGES : "contains"
    
    EMPLOYEE_PAYMENTS ||--|| SUBSCRIPTIONS : "creates"
    EMPLOYEE_REQUESTS ||--o| USERS : "becomes"
    
    EXERCISES ||--o{ WORKOUT_PLANS : "referenced_in"
    MEAL_PLAN_TEMPLATES ||--o{ MEAL_PLANS : "used_in"
    
    PAYMENTS ||--o{ ADMIN_TRANSACTIONS : "generates"
    
    USERS {
        string uid PK
        string email UK
        string displayName
        string role
        string phoneNumber
        string photoURL
        timestamp createdAt
        timestamp updatedAt
        string status
        boolean verified
        string assignedEmployeeId FK
        string subscriptionId FK
    }
    
    CHATS {
        string chatId PK
        array participants
        object lastMessage
        timestamp lastActivity
        timestamp createdAt
        object unreadCount
    }
    
    MESSAGES {
        string messageId PK
        string chatId FK
        string senderId FK
        string recipientId FK
        string content
        string type
        boolean read
        timestamp createdAt
    }
    
    NOTIFICATIONS {
        string id PK
        string userId FK
        string type
        string title
        string message
        boolean read
        timestamp createdAt
    }
    
    PAYMENTS {
        string id PK
        string userId FK
        string employeeId FK
        number amount
        string method
        string status
        boolean approvedByEmployee
        boolean approvedByAdmin
        timestamp createdAt
    }
    
    EMPLOYEE_PAYMENTS {
        string id PK
        string email UK
        string name
        string selectedPlan
        number amount
        boolean paid
        boolean accountCreated
        timestamp createdAt
    }
    
    SUBSCRIPTIONS {
        string id PK
        string employeePaymentId FK
        string employeeEmail
        string planType
        number amount
        timestamp startDate
        timestamp expirationDate
        string status
        boolean isActive
    }
    
    EMPLOYEE_REQUESTS {
        string id PK
        string email UK
        string fullName
        string selectedPlan
        string status
        timestamp createdAt
    }
    
    MEAL_PLANS {
        string id PK
        string userId FK
        string employeeId FK
        string title
        array meals
        number duration
        timestamp startDate
        boolean isActive
    }
    
    MEAL_PLAN_TEMPLATES {
        string id PK
        string title
        string category
        array meals
        string createdBy FK
    }
    
    WORKOUT_PLANS {
        string id PK
        string userId FK
        string employeeId FK
        string title
        array exercises
        number duration
        boolean isActive
    }
    
    EXERCISES {
        string id PK
        string name
        string category
        array muscleGroups
        string difficulty
        string gifUrl
        string gifUrlFemale
    }
    
    PROGRESS {
        string id PK
        string userId FK
        timestamp date
        number weight
        object measurements
        array photos
        string notes
    }
    
    ADMIN_TRANSACTIONS {
        string id PK
        string type
        number amount
        string relatedId
        string createdBy FK
        timestamp createdAt
    }
```

---

## Collection Hierarchy Diagram

```mermaid
graph TD
    A[Firestore Database] --> B[users Collection]
    A --> C[chats Collection]
    A --> D[messages Collection]
    A --> E[notifications Collection]
    A --> F[payments Collection]
    A --> G[employeePayments Collection]
    A --> H[subscriptions Collection]
    A --> I[employeeRequests Collection]
    A --> J[mealPlans Collection]
    A --> K[mealPlanTemplates Collection]
    A --> L[workoutPlans Collection]
    A --> M[exercises Collection]
    A --> N[adminTransactions Collection]
    
    B --> O[users/{uid}/progress Subcollection]
    
    C --> P[chats/{chatId}/messages Subcollection]
    
    style A fill:#4285f4,stroke:#333,stroke-width:3px,color:#fff
    style B fill:#34a853,stroke:#333,stroke-width:2px
    style C fill:#34a853,stroke:#333,stroke-width:2px
    style O fill:#fbbc04,stroke:#333,stroke-width:2px
    style P fill:#fbbc04,stroke:#333,stroke-width:2px
```

---

## User Role Relationships

```mermaid
graph LR
    A[Admin] -->|Creates & Manages| B[Employees]
    A -->|Views & Manages| C[Users]
    A -->|Approves| D[Employee Requests]
    A -->|Approves| E[Payments]
    A -->|Manages| F[Subscriptions]
    A -->|Chats with| B
    A -->|Chats with| C
    
    B -->|Creates & Manages| C
    B -->|Assigns| G[Meal Plans]
    B -->|Assigns| H[Workout Plans]
    B -->|Tracks| I[User Progress]
    B -->|Approves| E
    B -->|Chats with| A
    B -->|Chats with| C
    
    C -->|Makes| E
    C -->|Tracks| I
    C -->|Views| G
    C -->|Views| H
    C -->|Chats with| B
    
    style A fill:#ea4335,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#34a853,stroke:#333,stroke-width:2px,color:#fff
```

---

## Chat System Structure

```mermaid
graph TD
    A[Chat System] --> B[Chat Document]
    B --> C[Chat Metadata]
    B --> D[Messages Subcollection]
    
    C --> E[chatId: admin_123__emp_456]
    C --> F[participants: array]
    C --> G[lastMessage: object]
    C --> H[unreadCount: object]
    
    D --> I[Message Document]
    I --> J[senderId]
    I --> K[recipientId]
    I --> L[content]
    I --> M[read status]
    I --> N[reactions]
    
    style A fill:#4285f4,stroke:#333,stroke-width:3px,color:#fff
    style B fill:#34a853,stroke:#333,stroke-width:2px
    style D fill:#fbbc04,stroke:#333,stroke-width:2px
```

---

## Payment Flow State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: User submits payment
    Pending --> EmployeeApproved: Employee approves
    Pending --> Rejected: Employee rejects
    EmployeeApproved --> Completed: Admin approves
    EmployeeApproved --> Rejected: Admin rejects
    Completed --> [*]
    Rejected --> [*]
    
    note right of Pending
        status: 'pending'
        approvedByEmployee: false
        approvedByAdmin: false
    end note
    
    note right of EmployeeApproved
        status: 'pending'
        approvedByEmployee: true
        approvedByAdmin: false
    end note
    
    note right of Completed
        status: 'completed'
        approvedByEmployee: true
        approvedByAdmin: true
    end note
```

---

## Subscription Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active: Payment received
    Active --> Expiring: 7 days before expiration
    Expiring --> Active: Renewed
    Expiring --> Expired: Not renewed
    Expired --> [*]
    
    note right of Active
        status: 'active'
        isActive: true
    end note
    
    note right of Expiring
        Reminder email sent
    end note
    
    note right of Expired
        status: 'expired'
        isActive: false
        Expiration email sent
    end note
```

---

## Data Flow Architecture

```mermaid
flowchart TB
    subgraph Client
        A[React Frontend]
    end
    
    subgraph API
        B[Express.js Server]
        C[Routes]
        D[Controllers]
        E[Middleware]
    end
    
    subgraph Services
        F[Firebase Admin SDK]
        G[Email Service]
        H[OpenAI API]
    end
    
    subgraph Data
        I[Firestore]
        J[Firebase Auth]
        K[Firebase Storage]
    end
    
    subgraph Scheduler
        L[Node-Cron]
        M[Reminders]
    end
    
    A -->|HTTP Requests| B
    B --> C
    C --> E
    E --> D
    D --> F
    F --> I
    F --> J
    F --> K
    D --> G
    D --> H
    L --> M
    M --> G
    M --> I
    
    style A fill:#61dafb,stroke:#333,stroke-width:2px
    style B fill:#339933,stroke:#333,stroke-width:2px
    style I fill:#ffa000,stroke:#333,stroke-width:2px
    style J fill:#ffa000,stroke:#333,stroke-width:2px
    style K fill:#ffa000,stroke:#333,stroke-width:2px
```

---

## Collection Access Patterns

```mermaid
graph TD
    A[Collection Access] --> B[Admin Access]
    A --> C[Employee Access]
    A --> D[User Access]
    
    B --> E[All Collections]
    B --> F[Full CRUD]
    
    C --> G[users - assigned only]
    C --> H[mealPlans - created by]
    C --> I[workoutPlans - created by]
    C --> J[payments - assigned users]
    C --> K[chats - own chats]
    
    D --> L[users - own profile]
    D --> M[mealPlans - assigned]
    D --> N[workoutPlans - assigned]
    D --> O[payments - own payments]
    D --> P[progress - own progress]
    D --> Q[chats - own chats]
    
    style B fill:#ea4335,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#34a853,stroke:#333,stroke-width:2px,color:#fff
```

---

## How to Use These Diagrams

### On GitHub
GitHub automatically renders Mermaid diagrams in markdown files. Just view this file on GitHub.

### In Documentation Tools
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Obsidian**: Native Mermaid support
- **Notion**: Copy Mermaid code blocks
- **Mermaid Live Editor**: https://mermaid.live/

### Export as Images
1. Go to https://mermaid.live/
2. Paste the Mermaid code
3. Export as PNG, SVG, or PDF

---

**Last Updated**: Current Implementation
**Version**: 1.0.0

