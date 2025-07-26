/**
 * Environment variable validation utility
 */

export function validateEnvironment() {
  const requiredEnvVars = {
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  };

  const missingVars: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '' || value === 'your_gemini_api_key_here') {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing or invalid environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and ensure all required API keys are set.'
    );
  }

  return true;
}

export function getGeminiApiKey(): string {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GOOGLE_GEMINI_API_KEY is not configured. Please set it in your .env.local file.'
    );
  }
  
  return apiKey;
}
