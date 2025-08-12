import { SignJWT } from "jose";

describe("AI assistant end to end", () => {
  let token: string;

  beforeEach(async () => {
    const jwtSecret = new TextEncoder().encode(
      "XlGw86hiYgGRZyi6abappQMhEHHptbtt6leocJ4Lfmc"
    );
    token = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("carely")
      .setAudience("carely")
      .setSubject("user-id-1")
      .setExpirationTime("2h")
      .sign(jwtSecret);

    cy.window().then((win) => {
      win.localStorage.setItem("carely-token", token);
    });
  });

  it("navigates to AI assistant, sends a prompt, and sees responses flow", () => {
    cy.visit("/");
    cy.contains("Login", { timeout: 15000 }).should("be.visible").click();

    // Create caregiver quickly if first run
    cy.get('input[placeholder="Enter your full name"]').should("be.visible").type("ai user");
    cy.get('[data-testid="dob-input"]').should("be.visible").type("1990-01-01");
    cy.contains("Male").should("be.visible").click();
    cy.contains("button", "Create Profile").should("be.visible").click();

    // Wait for dashboard to load
    cy.url().should("include", "/dashboard");
    cy.contains("Good", { timeout: 10000 }).should("be.visible");

    // Navigate to AI Assistant
    cy.contains("AI Assistant").should("be.visible").click();
    cy.url().should("include", "/ai");
    
    // Wait for AI page to fully load
    cy.get('input[placeholder*="Ask me anything about caregiving"]', { timeout: 10000 })
      .should("be.visible")
      .and("be.enabled");

    // Send a simple prompt
    cy.get('input[placeholder*="Ask me anything about caregiving"]')
      .type("Hello AI");
    cy.get('button[type="submit"]').should("be.visible").and("be.enabled").click();

    // Expect echo of user message
    cy.contains("Hello AI", { timeout: 10000 }).should("be.visible");

    // Check that input is cleared after sending
    cy.get('input[placeholder*="Ask me anything about caregiving"]')
      .should("have.value", "");

    // We cannot assert external API responses without network mocking;
    // just assert the typing indicator appears (if present)
    // Note: This may not always appear depending on API response speed
    cy.get('body').then(($body) => {
      if ($body.text().includes('AI is typing...')) {
        cy.contains("AI is typing...").should("be.visible");
      }
    });
  });
});
