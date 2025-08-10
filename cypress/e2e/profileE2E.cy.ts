import { SignJWT } from "jose";

describe("caregiver profile page end to end", () => {
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

  it("logs in, creates caregiver, edits profile bio, and navigates tabs", () => {
    cy.visit("/");
    cy.contains("Login", { timeout: 15000 }).should("be.visible").click();

    // Create caregiver profile
    cy.get('input[placeholder="Enter your full name"]').should("be.visible").type("profile user");
    cy.get('[data-testid="dob-input"]').should("be.visible").type("1991-02-02");
    cy.contains("Female").should("be.visible").click();
    cy.contains("button", "Create Profile").should("be.visible").click();
    cy.url().should("include", "/dashboard");

    // Go to Profile (avatar dropdown)
    cy.get('[data-testid="avatar-button"]').should('be.visible').click();
    cy.contains("Profile").should('be.visible').click();
    cy.url().should("include", "/profile");
    cy.contains("Edit Profile").should('be.visible').click();

    // Update bio and submit
    cy.get('textarea[placeholder="Tell us about yourself"]')
      .should('be.visible')
      .clear()
      .type("I am a caring person");
    cy.contains("button", "Update Profile").should('be.visible').click();
    
    // Verify bio was updated
    cy.contains("I am a caring person").should('be.visible');

    // Navigate tabs and open import modal
    cy.contains("My Calendar").should('be.visible').click();
    cy.contains("Import Your Calendar").should('be.visible').click();
    cy.contains("Import Your Schedule").should('be.visible');
    
    // Close modal if open
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('body').type('{esc}');
      }
    });

    cy.contains("My Notes").should('be.visible').click();
  });
});
