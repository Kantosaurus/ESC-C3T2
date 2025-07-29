/**
 * Frontend XSS Protection Utilities
 *
 * These utilities help prevent XSS attacks by safely rendering user content
 * and providing safe alternatives to dangerouslySetInnerHTML.
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Utility to check if a string contains potentially dangerous content
 */
export const containsDangerousContent = (text: string): boolean => {
  if (!text || typeof text !== "string") {
    return false;
  }

  const dangerousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /<form[^>]*>/i,
    /<input[^>]*>/i,
    /<textarea[^>]*>/i,
    /<select[^>]*>/i,
    /<button[^>]*>/i,
    /<link[^>]*>/i,
    /<meta[^>]*>/i,
    /<title[^>]*>/i,
    /<head[^>]*>/i,
    /<body[^>]*>/i,
    /<html[^>]*>/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
};

/**
 * Log potential XSS attempts for security monitoring
 */
export const logPotentialXSS = (content: string, fieldName: string): void => {
  if (containsDangerousContent(content)) {
    console.warn(`Potential XSS attempt detected in ${fieldName}:`, {
      content: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });
  }
};
