/**
 * Utility to wait for a specified number of milliseconds.
 */
export async function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Wrapper for AI calls to handle temporary 503 (Service Unavailable) errors
 * with an exponential backoff strategy.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";

      // Specifically target 503 Service Unavailable (High Demand) or 429 (Quota)
      const is503 = errorMessage.includes("503") || errorMessage.includes("Service Unavailable");
      const is429 = errorMessage.includes("429") || errorMessage.includes("Too Many Requests") || errorMessage.includes("Quota exceeded");
      const isDailyLimit = errorMessage.includes("GenerateRequestsPerDay") || errorMessage.includes("GenerateRequestsPerMonth");

      if (is503 || is429) {
        // If it's a hard daily limit, throw a clean friendly error that survives Next.js serialization
        if (isDailyLimit) {
          throw new Error("Daily Neural Limit Reached: Your current quota for the free diagnostic tier (20 scans/day) has been exhausted. Please wait until tomorrow for a fresh matrix reset.");
        }

        if (attempt < maxAttempts) {
          // Check for specific retry delay in the error summary provided by the API
          let waitTime = delay;
          const delayMatch = errorMessage.match(/retry in ([\d\.]+)s/);
          if (delayMatch) {
            waitTime = (parseFloat(delayMatch[1]) + 0.5) * 1000; // Add 500ms safety buffer
          } else if (is429) {
            waitTime = delay * 2;
          }

          console.log(`[AI Retry] Attempt ${attempt} failed with ${is429 ? "429" : "503"}. Retrying in ${waitTime}ms...`);
          await wait(waitTime);
          delay *= 2; // Exponential backoff for fallback
          continue;
        }

        // If we've run out of attempts, throw a high-demand friendly error
        if (is429) {
          throw new Error("High Neural Demand: The AI engine is currently throttled due to heavy traffic. Please wait a minute before retrying.");
        }
      }

      // If it's not a retryable error or we've run out of attempts, throw original or new friendly error
      throw error;
    }
  }

  throw lastError;
}
