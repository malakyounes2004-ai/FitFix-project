// frontend/src/utils/firebaseStorage.js
// Firebase Storage utilities for exercise GIF uploads

/**
 * Upload male and female GIF files for an exercise
 * @param {File} maleGif - The male GIF file (optional)
 * @param {File} femaleGif - The female GIF file (optional)
 * @param {string} exerciseId - The exercise ID
 * @param {function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{gifMaleUrl: string|null, gifFemaleUrl: string|null}>}
 */
export const uploadExerciseGifs = async (maleGif, femaleGif, exerciseId, onProgress = null) => {
  if (!maleGif && !femaleGif) {
    throw new Error('At least one GIF file (male or female) is required');
  }

  if (!exerciseId) {
    throw new Error('Exercise ID is required');
  }

  console.log('📤 Starting GIF uploads:', {
    maleGif: maleGif ? `${maleGif.name} (${(maleGif.size / 1024).toFixed(2)} KB)` : 'None',
    femaleGif: femaleGif ? `${femaleGif.name} (${(femaleGif.size / 1024).toFixed(2)} KB)` : 'None',
    exerciseId
  });

  // Validate male GIF if provided
  if (maleGif) {
    const maleValidation = validateGifFile(maleGif);
    if (!maleValidation.valid) {
      throw new Error(`Male GIF: ${maleValidation.error}`);
    }
  }

  // Validate female GIF if provided
  if (femaleGif) {
    const femaleValidation = validateGifFile(femaleGif);
    if (!femaleValidation.valid) {
      throw new Error(`Female GIF: ${femaleValidation.error}`);
    }
  }

  try {
    const token = localStorage.getItem('token');
    
    // Create FormData
    const formData = new FormData();
    formData.append('exerciseId', exerciseId);
    
    if (maleGif) {
      formData.append('maleGif', maleGif);
    }
    
    if (femaleGif) {
      formData.append('femaleGif', femaleGif);
    }

    // Upload via backend API
    const response = await fetch('http://localhost:3000/api/employee/upload-gifs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ GIFs uploaded successfully:', result.data);
      
      // Simulate progress callback
      if (onProgress) {
        onProgress(100);
      }
      
      return result.data; // { gifMaleUrl, gifFemaleUrl }
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  } catch (error) {
    console.error('❌ GIF upload error:', error);
    throw new Error('Failed to upload GIF files: ' + error.message);
  }
};

/**
 * Validate GIF file before upload
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateGifFile = (file) => {
  if (!file) {
    return {
      valid: false,
      error: 'No file selected'
    };
  }

  // Check file type
  if (file.type !== 'image/gif') {
    return {
      valid: false,
      error: 'Only GIF files are allowed'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than 10MB (current: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    };
  }

  return { valid: true };
};

/**
 * Delete GIF files from Firebase Storage (via backend)
 * @param {string} exerciseId - The exercise ID
 * @returns {Promise<void>}
 */
export const deleteExerciseGifs = async (exerciseId) => {
  if (!exerciseId) return;

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/employee/delete-gifs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exerciseId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete GIF files');
    }

    console.log('✅ GIF files deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    // Don't throw - deletion failure shouldn't block other operations
    console.warn('⚠️ GIF deletion failed, but continuing...');
  }
};
