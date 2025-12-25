# Employee Reports & Analytics - Technical Documentation

## File Structure
- **Main Component**: `frontend/src/pages/EmployeeReportsAndAnalytics.jsx` (~2000 lines)
- **Status**: Self-contained component (can be split if needed)

## Backend Integration TODOs

### 1. User Data Endpoints
- ✅ `GET /api/employee/users` - Working
- ✅ `GET /api/employee/users/:userId/progress` - Working
- ✅ `GET /api/employee/workout-plans/:userId` - Working
- ⚠️ `GET /api/employee/users/:userId/full-report` - **TODO: Create single endpoint for complete user report**

### 2. Analytics Endpoints
- ⚠️ `GET /api/employee/analytics/user-activity?days=7` - **TODO: Create endpoint for time-series activity data**
- ⚠️ `GET /api/employee/analytics/plan-distribution` - **TODO: Create endpoint for plan distribution analytics**

### 3. Email Service
- ⚠️ `POST /api/employee/users/:userId/send-report` - **TODO: Create endpoint to send user report via email**

### 4. Data Structure Improvements
- ⚠️ Add `progressEntriesCount` field to user object - **TODO: Include in user response**
- ⚠️ Add `assignedDate` to meal plan object - **TODO: Include assignment timestamp**
- ⚠️ Ensure workout plan includes all exercise details - **TODO: Verify complete exercise data**

## Mock Fallback Data
- Mock data is provided in `MOCK_FALLBACK_DATA` constant
- Used when API calls fail
- Provides empty/default values to prevent crashes

## Reusable Components
- **KPICard**: Inline component (can be extracted to `components/reports/KPICard.jsx`)
- **Charts**: Using Recharts directly (can extract to separate chart components if needed)

## Dependencies
- `react` - Core framework
- `react-router-dom` - Navigation
- `gsap` - Animations
- `axios` - API calls
- `recharts` - Data visualization
- `react-icons/fi` - Icons
- `../hooks/useDebounce` - Search debouncing
- `../context/ThemeContext` - Dark mode support
- `../hooks/useNotification` - Notifications

## Performance Considerations
- Debounced search (300ms delay)
- Parallel API calls using Promise.all
- GSAP animations optimized with context cleanup
- Responsive charts with ResponsiveContainer

## Future Improvements
1. Extract KPI cards to separate component
2. Extract chart components to separate files
3. Add caching layer for API responses
4. Implement error retry logic
5. Add data refresh interval option

