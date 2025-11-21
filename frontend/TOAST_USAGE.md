# Toast Component Usage Guide

## Overview

The Toast component provides a clean, reusable way to display success and error messages throughout your application. Toasts appear in the top-right corner, auto-hide after 3 seconds, and support multiple stacked notifications.

## Setup

The Toast system is already integrated in `App.jsx` via `ToastProvider`. No additional setup needed!

## Basic Usage

### Import the hook

```jsx
import { useToast } from '../hooks/useToast';
```

### In your component

```jsx
const MyComponent = () => {
  const { showToast } = useToast();

  const handleAction = () => {
    // Show success toast
    showToast({
      type: 'success',
      message: 'Operation completed successfully!'
    });
  };

  const handleError = () => {
    // Show error toast
    showToast({
      type: 'error',
      message: 'Something went wrong!'
    });
  };

  return (
    // Your component JSX
  );
};
```

## Example: Login Component

See `src/components/Login.jsx` for a complete example:

```jsx
import { useToast } from '../hooks/useToast';

const Login = () => {
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        showToast({
          type: 'success',
          message: 'Login successful! Redirecting...'
        });
        // ... redirect logic
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Login failed'
      });
    }
  };
};
```

## API Reference

### `showToast(options)`

Display a toast notification.

**Parameters:**
- `type` (string, required): `'success'` or `'error'`
- `message` (string, required): Message to display
- `duration` (number, optional): Duration in milliseconds (default: 3000)

**Example:**
```jsx
showToast({
  type: 'success',
  message: 'Profile updated successfully!',
  duration: 5000 // Show for 5 seconds
});
```

## Features

✅ **Auto-hide**: Toasts automatically disappear after 3 seconds (configurable)  
✅ **Stacked**: Multiple toasts can appear simultaneously  
✅ **Animations**: Smooth slide-in and slide-out animations  
✅ **Dismissible**: Users can manually close toasts with the X button  
✅ **Positioned**: Fixed at top-right corner  
✅ **Styled**: Beautiful Tailwind CSS styling with success/error colors  
✅ **Accessible**: Includes proper ARIA labels  

## Customization

### Change Duration

```jsx
showToast({
  type: 'success',
  message: 'Custom duration',
  duration: 5000 // 5 seconds
});
```

### Multiple Toasts

You can show multiple toasts at once - they'll stack vertically:

```jsx
showToast({ type: 'success', message: 'First message' });
showToast({ type: 'error', message: 'Second message' });
showToast({ type: 'success', message: 'Third message' });
```

## Styling

Toasts use Tailwind CSS classes. To customize:

1. **Success Toast**: Green background (`bg-green-50`), green border (`border-green-200`)
2. **Error Toast**: Red background (`bg-red-50`), red border (`border-red-200`)

Edit `src/components/Toast.jsx` to customize colors, size, or animations.

## Best Practices

1. **Keep messages concise**: Toast messages should be short and clear
2. **Use appropriate types**: Use `success` for positive actions, `error` for failures
3. **Don't overuse**: Too many toasts can be overwhelming
4. **Provide context**: Make error messages actionable when possible

## Examples

### Form Submission

```jsx
const handleSubmit = async (data) => {
  try {
    await saveData(data);
    showToast({
      type: 'success',
      message: 'Data saved successfully!'
    });
  } catch (error) {
    showToast({
      type: 'error',
      message: 'Failed to save data. Please try again.'
    });
  }
};
```

### API Error Handling

```jsx
try {
  const response = await api.get('/data');
  showToast({
    type: 'success',
    message: 'Data loaded successfully!'
  });
} catch (error) {
  showToast({
    type: 'error',
    message: error.response?.data?.message || 'Failed to load data'
  });
}
```

### Validation Errors

```jsx
if (!email || !password) {
  showToast({
    type: 'error',
    message: 'Please fill in all required fields'
  });
  return;
}
```

