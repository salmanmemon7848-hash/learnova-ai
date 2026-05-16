/**
 * Centralized API error handler for user-friendly messages.
 * Maps backend error codes to frontend display strings.
 */
export function handleApiError(error: string): string {
  switch (error) {
    case 'feature_locked':
      return '⚠️ This feature is currently locked. Please check your plan or enable required services.';
    case 'limit_reached':
      return '⚠️ Daily limit reached for this feature. Please try again tomorrow or upgrade your plan.';
    case 'invalid_api_key':
      return '⚠️ AI service configuration error. Please check your API keys.';
    case 'powerful_mode_limit':
      return '⚠️ Powerful Mode limit reached. Resets at midnight.';
    case 'image_limit_reached':
      return '⚠️ Image upload limit reached. You can upload 1 image per day.';
    case 'Unauthorized':
      return '⚠️ Session expired. Please sign in again.';
    case 'service_unavailable':
      return '⚠️ The AI service is currently unavailable. Please try again later.';
    default:
      return '⚠️ Something went wrong. Please try again later.';
  }
}
