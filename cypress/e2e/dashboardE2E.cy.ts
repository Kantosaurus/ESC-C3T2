import { SignJWT } from "jose";

describe("dashboard end to end", () => {
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

  it("creates caregiver, adds elders, shows dashboard stats and upcoming appointments", () => {
    cy.visit("/");
    cy.contains("Login", { timeout: 15000 }).should("be.visible").click();

    // Create caregiver
    cy.get('input[placeholder="Enter your full name"]').should("be.visible").type("dashboard user");
    cy.get('[data-testid="dob-input"]').should("be.visible").type("1990-01-01");
    cy.contains("Male").should("be.visible").click();
    cy.contains("button", "Create Profile").should("be.visible").click();
    cy.url().should("include", "/dashboard");

    // Add first elder
    cy.contains("Add Elder").should("be.visible").click();
    cy.get('input[placeholder="Enter their full name"]').should("be.visible").type("Elder One");
    cy.get('[data-testid="elder-dob-input"]').should("be.visible").type("1940-05-21");
    cy.contains("Female").should("be.visible").click();
    cy.contains("button", "Create Profile").should("be.visible").click();
    cy.url().should("include", "/dashboard");

    // Add second elder
    cy.contains("Add Elder").should("be.visible").click();
    cy.get('input[placeholder="Enter their full name"]').should("be.visible").type("Elder Two");
    cy.get('[data-testid="elder-dob-input"]').should("be.visible").type("1935-05-21");
    cy.contains("Male").should("be.visible").click();
    cy.contains("button", "Create Profile").should("be.visible").click();
    cy.url().should("include", "/dashboard");

    // Go to calendar to create an appointment for upcoming list
    cy.contains("Calendar").should('be.visible').click();
    cy.url().should("include", "/calendar");
    cy.get("[data-testid='choose-elder-button']").should('be.visible').click();
    cy.get('[role="listbox"]').should('be.visible').contains("Elder One").click();
    cy.get('[data-testid="calendar-cell-6"]').should('be.visible').click();
    cy.contains("Add Appointment").should('be.visible').click();
    cy.contains("Start Time")
      .parent()
      .find('[data-state="closed"]')
      .eq(0)
      .should('be.visible')
      .click();
    cy.get('[role="listbox"]').should('be.visible').contains("07").click({ force: true });
    cy.contains("End Time").parent().find('[data-state="closed"]').eq(0).should('be.visible').click();
    cy.get('[role="listbox"]').should('be.visible').contains("09").click({ force: true });
    cy.get('input[placeholder="e.g., Doctor Visit, Therapy Session"]').should('be.visible').type(
      "Doctor Visit"
    );
    cy.get('input[placeholder="Address or location"]').should('be.visible').type("Clinic A");
    cy.contains("Create Appointment").should('be.visible').click();

    // Return to dashboard
    cy.get("[data-testid='back-to-dashboard-button']").should('be.visible').click();
    cy.url().should("include", "/dashboard");

    // Validate dashboard content
    cy.contains("Good").should('be.visible');
    cy.contains("Total Elders").parent().should('contain', "2");
    cy.contains("Upcoming Appointments").should('be.visible');
  });
});
