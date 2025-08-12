import { SignJWT } from "jose";

describe("elder profile page end to end", () => {
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

  it("creates caregiver and elder, opens elder profile, invites caregiver, and toggles tabs", () => {
    cy.visit("/");
  cy.contains("Login", { timeout: 15000 }).click();

  // Create caregiver
  cy.get('input[placeholder="Enter your full name"]').type("elder e2e user");
  cy.get('[data-testid="dob-input"]').type("1990-01-01");
  cy.contains("Male").click();
  cy.contains("button", "Create Profile").click();

  // Create elder
  cy.contains("Add Elder").click();
  cy.get('input[placeholder="Enter their full name"]').type("Elder A");
  cy.get('[data-testid="elder-dob-input"]').type("1940-05-21");
  cy.contains("Female").click();
  cy.contains("button", "Create Profile").click();

    // Go to elder profile from dashboard tile
    cy.contains("Elder A").should("be.visible").click();
    cy.url().should("include", "/elder");
    cy.contains("Edit Profile").should("be.visible");

    // Invite flow
    cy.contains("Invite").should("be.visible").click();
    cy.contains("Invite Caregivers").should("be.visible");
    
    // Close modal by pressing Escape
    cy.get('body').type('{esc}');
    
    // Wait for modal to close and ensure it's no longer visible
    cy.get('[role="dialog"]').should('not.exist');

    // Toggle tabs
    cy.contains("My Notes").should("be.visible").click();
    cy.contains("Calendar").should("be.visible");
  });
});
