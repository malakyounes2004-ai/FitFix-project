# Firestore Data Types - Clarification

## Actual Firestore Data Types

Firestore uses **lowercase** data types. Here are the official Firestore data types:

| Firestore Type | Description | Example |
|----------------|-------------|---------|
| **string** | Text data (lowercase) | "John Doe", "user@example.com" |
| **number** | Numeric data (lowercase) | 100, 75.5, 0 |
| **boolean** | True/false value (lowercase) | true, false |
| **timestamp** | Date and time (lowercase) | Firestore Timestamp object |
| **array** | Ordered list of values (lowercase) | ["goal1", "goal2"], [1, 2, 3] |
| **map** | Key-value pairs / object (lowercase) | {name: "John", age: 30} |
| **reference** | Reference to another document (lowercase) | DocumentReference |
| **null** | Empty value (lowercase) | null |
| **geopoint** | Geographic coordinates (lowercase) | GeoPoint(lat, lng) |

## Important Notes

1. **All Firestore data types are lowercase** in the actual database
2. **In documentation and ER diagrams**, it's common to capitalize them (String, Number, Boolean) for readability and convention
3. **Visual Paradigm** may display types as capitalized (String, Number, etc.) - this is acceptable for ER diagrams
4. **When writing code or queries**, always use lowercase: `string`, `number`, `boolean`, `timestamp`

## Common Confusion

- ❌ **Wrong**: `String`, `Number`, `Boolean`, `Timestamp` (capitalized - these are not Firestore types)
- ✅ **Correct**: `string`, `number`, `boolean`, `timestamp` (lowercase - actual Firestore types)

## In ER Diagrams

When creating ER diagrams in Visual Paradigm or other tools:
- You can use capitalized types (String, Number, Boolean) for clarity and readability
- Add a note that actual Firestore types are lowercase
- Or use lowercase types directly if the tool supports it

## Example from FitFix Schema

**In Firestore (actual):**
```javascript
{
  email: "user@example.com",        // string (lowercase)
  age: 25,                           // number (lowercase)
  isActive: true,                    // boolean (lowercase)
  createdAt: Timestamp,             // timestamp (lowercase)
  goals: ["weight loss", "muscle"], // array (lowercase)
  profile: {name: "John"}           // map (lowercase)
}
```

**In ER Diagram (documentation):**
- Can be represented as: `email: String`, `age: Number`, `isActive: Boolean`
- But note: Actual Firestore type is lowercase

---

**Document Version**: 1.0  
**Purpose**: Clarification of Firestore data type naming conventions

