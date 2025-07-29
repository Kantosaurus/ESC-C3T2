import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeAddress,
  sanitizeName,
  sanitizePhone,
  sanitizeAppointmentDetails,
  sanitizeNoteContent,
  sanitizeNoteHeader,
  sanitizeAppointmentName,
  sanitizeAppointmentLocation,
  validateAndSanitize,
  logXSSTAttempt,
  containsDangerousContent,
} from "./xss-protection";

describe("XSS Protection Tests", () => {
  beforeEach(() => {
    // Clear console warnings before each test
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("sanitizeText", () => {
    it("should remove all HTML tags", () => {
      const input = '<script>alert("xss")</script>Hello <b>World</b>';
      const result = sanitizeText(input);
      expect(result).toBe("Hello World");
    });

    it("should handle null and undefined inputs", () => {
      expect(sanitizeText(null as any)).toBe("");
      expect(sanitizeText(undefined as any)).toBe("");
      expect(sanitizeText("")).toBe("");
    });

    it("should remove dangerous attributes", () => {
      const input =
        "<div onclick=\"alert('xss')\" onload=\"alert('xss')\">Content</div>";
      const result = sanitizeText(input);
      expect(result).toBe("Content");
    });
  });

  describe("sanitizeRichText", () => {
    it("should remove all HTML tags for security", () => {
      const input =
        "<p>Hello <strong>World</strong> with <em>formatting</em></p>";
      const result = sanitizeRichText(input);
      expect(result).toBe("Hello World with formatting");
    });

    it("should remove script tags", () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = sanitizeRichText(input);
      expect(result).not.toContain("<script>");
      expect(result).toBe("HelloWorld");
    });

    it("should remove dangerous attributes", () => {
      const input = "<p onclick=\"alert('xss')\">Hello</p>";
      const result = sanitizeRichText(input);
      expect(result).not.toContain("onclick");
      expect(result).toBe("Hello");
    });
  });

  describe("sanitizeAddress", () => {
    it("should sanitize address and limit length", () => {
      const input =
        '<script>alert("xss")</script>123 Main Street, Apt 4B, City, State 12345';
      const result = sanitizeAddress(input);
      expect(result).toBe("123 Main Street, Apt 4B, City, State 12345");
      expect(result).not.toContain("<script>");
    });

    it("should truncate long addresses", () => {
      const longAddress = "A".repeat(300);
      const result = sanitizeAddress(longAddress);
      expect(result.length).toBe(200);
    });
  });

  describe("sanitizeName", () => {
    it("should sanitize names and limit length", () => {
      const input = '<script>alert("xss")</script>John Doe';
      const result = sanitizeName(input);
      expect(result).toBe("John Doe");
      expect(result).not.toContain("<script>");
    });

    it("should truncate long names", () => {
      const longName = "A".repeat(150);
      const result = sanitizeName(longName);
      expect(result.length).toBe(100);
    });
  });

  describe("sanitizePhone", () => {
    it("should sanitize phone numbers", () => {
      const input = '<script>alert("xss")</script>+65 9123 4567';
      const result = sanitizePhone(input);
      expect(result).toBe("+65 9123 4567");
      expect(result).not.toContain("<script>");
    });

    it("should only allow valid phone characters", () => {
      const input = 'Phone: <script>alert("xss")</script>+65-9123-4567';
      const result = sanitizePhone(input);
      expect(result).toBe("+65-9123-4567");
    });
  });

  describe("sanitizeAppointmentDetails", () => {
    it("should remove all HTML tags for security", () => {
      const input =
        "<p>Appointment <strong>details</strong> with <em>formatting</em></p>";
      const result = sanitizeAppointmentDetails(input);
      expect(result).toBe("Appointment details with formatting");
    });

    it("should remove dangerous content", () => {
      const input = '<p>Details</p><script>alert("xss")</script>';
      const result = sanitizeAppointmentDetails(input);
      expect(result).not.toContain("<script>");
      expect(result).toBe("Details");
    });
  });

  describe("sanitizeNoteContent", () => {
    it("should remove all HTML tags for security", () => {
      const input =
        "<p>Note <strong>content</strong> with <em>formatting</em></p>";
      const result = sanitizeNoteContent(input);
      expect(result).toBe("Note content with formatting");
    });

    it("should remove dangerous content from notes", () => {
      const input = '<p>Note content</p><script>alert("xss")</script>';
      const result = sanitizeNoteContent(input);
      expect(result).not.toContain("<script>");
      expect(result).toBe("Note content");
    });
  });

  describe("sanitizeNoteHeader", () => {
    it("should sanitize note headers", () => {
      const input = '<script>alert("xss")</script>Important Note';
      const result = sanitizeNoteHeader(input);
      expect(result).toBe("Important Note");
      expect(result).not.toContain("<script>");
    });

    it("should truncate long headers", () => {
      const longHeader = "A".repeat(80);
      const result = sanitizeNoteHeader(longHeader);
      expect(result.length).toBe(50);
    });
  });

  describe("sanitizeAppointmentName", () => {
    it("should sanitize appointment names", () => {
      const input = '<script>alert("xss")</script>Doctor Visit';
      const result = sanitizeAppointmentName(input);
      expect(result).toBe("Doctor Visit");
      expect(result).not.toContain("<script>");
    });

    it("should truncate long names", () => {
      const longName = "A".repeat(150);
      const result = sanitizeAppointmentName(longName);
      expect(result.length).toBe(100);
    });
  });

  describe("sanitizeAppointmentLocation", () => {
    it("should sanitize appointment locations", () => {
      const input = '<script>alert("xss")</script>123 Medical Center Dr';
      const result = sanitizeAppointmentLocation(input);
      expect(result).toBe("123 Medical Center Dr");
      expect(result).not.toContain("<script>");
    });

    it("should truncate long locations", () => {
      const longLocation = "A".repeat(300);
      const result = sanitizeAppointmentLocation(longLocation);
      expect(result.length).toBe(200);
    });
  });

  describe("validateAndSanitize", () => {
    it("should validate and sanitize input", () => {
      const input = '<script>alert("xss")</script>Valid Name';
      const result = validateAndSanitize(input, sanitizeName, "name");
      expect(result).toBe("Valid Name");
    });

    it("should throw error for null input", () => {
      expect(() => {
        validateAndSanitize(null as any, sanitizeName, "name");
      }).toThrow("name is required and must be a string");
    });

    it("should throw error for empty result", () => {
      expect(() => {
        validateAndSanitize("<script></script>", sanitizeText, "content");
      }).toThrow("content cannot be empty after sanitization");
    });
  });

  describe("logXSSTAttempt", () => {
    it("should log when content is modified", () => {
      const original = '<script>alert("xss")</script>Hello';
      const sanitized = "Hello";

      logXSSTAttempt(original, sanitized, "testField");

      expect(console.warn).toHaveBeenCalledWith(
        "Potential XSS attempt detected in testField:",
        expect.objectContaining({
          original,
          sanitized,
          timestamp: expect.any(String),
        })
      );
    });

    it("should not log when content is unchanged", () => {
      const content = "Hello World";

      logXSSTAttempt(content, content, "testField");

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe("containsDangerousContent", () => {
    it("should detect script tags", () => {
      expect(containsDangerousContent('<script>alert("xss")</script>')).toBe(
        true
      );
    });

    it("should detect javascript protocol", () => {
      expect(containsDangerousContent('javascript:alert("xss")')).toBe(true);
    });

    it("should detect event handlers", () => {
      expect(containsDangerousContent("<div onclick=\"alert('xss')\">")).toBe(
        true
      );
    });

    it("should detect iframe tags", () => {
      expect(containsDangerousContent('<iframe src="malicious.com">')).toBe(
        true
      );
    });

    it("should not flag safe content", () => {
      expect(containsDangerousContent("<p>Hello World</p>")).toBe(false);
      expect(containsDangerousContent("<strong>Bold text</strong>")).toBe(
        false
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle nested dangerous content", () => {
      const input = '<div><script>alert("xss")</script><p>Content</p></div>';
      const result = sanitizeText(input);
      expect(result).toBe("Content");
    });

    it("should handle mixed case dangerous content", () => {
      const input = '<SCRIPT>alert("xss")</SCRIPT>Hello';
      const result = sanitizeText(input);
      expect(result).toBe("Hello");
    });

    it("should handle encoded dangerous content", () => {
      const input = '&lt;script&gt;alert("xss")&lt;/script&gt;Hello';
      const result = sanitizeText(input);
      // DOMPurify handles HTML entities, so this should be preserved
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;Hello');
    });
  });
});
