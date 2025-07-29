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
 * Safely render text content (no HTML allowed)
 */
export const SafeText: React.FC<{
  children: string | null | undefined;
  className?: string;
}> = ({ children, className }) => {
  if (!children) return null;
  return <span className={className}>{escapeHtml(children)}</span>;
};

/**
 * Safely render rich text content (allows basic formatting)
 */
export const SafeRichText: React.FC<{
  children: string | null | undefined;
  className?: string;
}> = ({ children, className }) => {
  if (!children) return null;

  // Basic HTML sanitization for allowed tags
  const sanitized = children
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>.*?<\/embed>/gi, "")
    .replace(/<form[^>]*>.*?<\/form>/gi, "")
    .replace(/<input[^>]*>/gi, "")
    .replace(/<textarea[^>]*>.*?<\/textarea>/gi, "")
    .replace(/<select[^>]*>.*?<\/select>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<title[^>]*>.*?<\/title>/gi, "")
    .replace(/<head[^>]*>.*?<\/head>/gi, "")
    .replace(/<body[^>]*>.*?<\/body>/gi, "")
    .replace(/<html[^>]*>.*?<\/html>/gi, "");

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

/**
 * Safely render note content with proper formatting
 */
export const SafeNoteContent: React.FC<{
  content: string | null | undefined;
  className?: string;
}> = ({ content, className }) => {
  if (!content) {
    return <span className="text-gray-400 italic">No content</span>;
  }

  return <SafeRichText className={className}>{content}</SafeRichText>;
};

/**
 * Safely render appointment details
 */
export const SafeAppointmentDetails: React.FC<{
  details: string | null | undefined;
  className?: string;
}> = ({ details, className }) => {
  if (!details) {
    return <span className="text-gray-400 italic">No details</span>;
  }

  return <SafeRichText className={className}>{details}</SafeRichText>;
};

/**
 * Safely render address information
 */
export const SafeAddress: React.FC<{
  address: string | null | undefined;
  className?: string;
}> = ({ address, className }) => {
  if (!address) {
    return <span className="text-gray-400 italic">No address</span>;
  }

  return <SafeText className={className}>{address}</SafeText>;
};

/**
 * Safely render name information
 */
export const SafeName: React.FC<{
  name: string | null | undefined;
  className?: string;
}> = ({ name, className }) => {
  if (!name) {
    return <span className="text-gray-400 italic">No name</span>;
  }

  return <SafeText className={className}>{name}</SafeText>;
};

/**
 * Safely render phone number
 */
export const SafePhone: React.FC<{
  phone: string | null | undefined;
  className?: string;
}> = ({ phone, className }) => {
  if (!phone) {
    return <span className="text-gray-400 italic">No phone</span>;
  }

  return <SafeText className={className}>{phone}</SafeText>;
};

/**
 * Safely render appointment location
 */
export const SafeLocation: React.FC<{
  location: string | null | undefined;
  className?: string;
}> = ({ location, className }) => {
  if (!location) {
    return <span className="text-gray-400 italic">No location specified</span>;
  }

  return <SafeText className={className}>{location}</SafeText>;
};

/**
 * Safely render appointment name
 */
export const SafeAppointmentName: React.FC<{
  name: string | null | undefined;
  className?: string;
}> = ({ name, className }) => {
  if (!name) {
    return <span className="text-gray-400 italic">Missing title</span>;
  }

  return <SafeText className={className}>{name}</SafeText>;
};

/**
 * Safely render note header
 */
export const SafeNoteHeader: React.FC<{
  header: string | null | undefined;
  className?: string;
}> = ({ header, className }) => {
  if (!header) {
    return <span className="text-gray-400 italic">No header</span>;
  }

  return <SafeText className={className}>{header}</SafeText>;
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
