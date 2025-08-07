import { SignJWT } from "jose";

describe("create,edit,delete,accept,deny appointment", () => {});

beforeEach(async () => {
  const jwtSecret = new TextEncoder().encode(
    "XlGw86hiYgGRZyi6abappQMhEHHptbtt6leocJ4Lfmc" // This is hardcoded, ensure that your local .env matches this secret
  );
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("carely")
    .setAudience("carely")
    .setSubject("user-id-1")
    .setExpirationTime("2h")
    .sign(jwtSecret);

  cy.log("JWT Token:", token);

  cy.window().then((win) => {
    win.localStorage.setItem("carely-token", token);
  });
});

it("full calendar end to end test", () => {
  cy.viewport(2560, 1440);
  cy.visit("http://localhost:5173/");
  cy.contains("Login").click();
  cy.wait(10000);
  //create the first elder
  cy.contains("Add Elder").click();
  cy.get('input[placeholder="Enter their full name"]').type("Ahma");
  cy.get('input[name="date_of_birth"]').type("1940-05-21");
  cy.contains("Female").click();
  cy.contains("button", "Create Profile").click();

  //create the second elder
  cy.contains("Add Elder").click();
  cy.get('input[placeholder="Enter their full name"]').type("Ahgong");
  cy.get('input[name="date_of_birth"]').type("1932-05-27");
  cy.contains("Male").click();
  cy.contains("button", "Create Profile").click();
  cy.contains("Calendar").click();
  //choose ah ma
  cy.get("[data-testid='choose-elder-button']").click();
  cy.get('[role="listbox"]').contains("Ahma").click();

  //create the appointments for ah ma
  //First appt
  cy.get('[data-testid="calendar-cell-6"]').click();
  cy.contains("Add Appointment").click();
  cy.contains("Start Time")
    .parent()
    .find('[data-state="closed"]')
    .eq(0)
    .click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("07").click({ force: true });
    });
  cy.contains("End Time").parent().find('[data-state="closed"]').eq(0).click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("11").click({ force: true });
    });
  cy.get('input[placeholder="e.g., Doctor Visit, Therapy Session"]').type(
    "Doctor Visit"
  );
  cy.get('input[placeholder="Additional notes or details..."]').type(
    "Annual check-up at Dr Kok"
  );
  cy.get('input[placeholder="Address or location"]').type(
    "123 Main Street Clinic"
  );
  cy.contains("Create Appointment").click();
  //Second appt
  cy.get('[data-testid="calendar-cell-7"]').click();
  cy.contains("Add Appointment").click();
  cy.contains("Start Time")
    .parent()
    .find('[data-state="closed"]')
    .eq(0)
    .click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("07").click({ force: true });
    });
  cy.contains("End Time").parent().find('[data-state="closed"]').eq(0).click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("11").click({ force: true });
    });
  cy.get('input[placeholder="e.g., Doctor Visit, Therapy Session"]').type(
    "Dental Visit"
  );
  cy.get('input[placeholder="Additional notes or details..."]').type(
    "Annual check-up at Dr Lim"
  );
  cy.get('input[placeholder="Address or location"]').type("123 Avenue Clinic");
  cy.contains("Create Appointment").click();

  //View appointments for ah gong
  cy.get("[data-testid='choose-elder-button']").click();
  cy.contains("Ahgong").click();
  cy.get("body").should("not.contain", "Dental Visit");

  //Go back to ah ma
  cy.get("[data-testid='choose-elder-button']").click();
  cy.contains("Ahma").click();

  //Edit appt 1
  cy.get('[data-testid = "calendar-cell-6"]').click();
  cy.wait(500);
  cy.get('[data-testid="appointment-Doctor-Visit"]').click();

  cy.contains("Edit").click();
  cy.contains("Start Time")
    .parent()
    .find('[data-state="closed"]')
    .eq(0)
    .click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("06").click({ force: true });
    });
  cy.contains("End Time").parent().find('[data-state="closed"]').eq(0).click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .within(() => {
      cy.contains("09").click({ force: true });
    });
  cy.get('input[placeholder="Additional notes or details..."]')
    .clear()
    .type("Annual check-up at Dr Kok, bring medical records");
  cy.contains("Save Changes").click();

  //Accept and decline appt 2
  cy.get("body").type("{esc}");
  cy.contains("Pending").click();
  cy.wait(1000);
  cy.contains("Doctor Visit").click();
  cy.get('[data-testid="accept-appointment-button"]').click();
  cy.get("body").should("contain", "Accepted by you");
  cy.get('[data-testid="undo-accept-button"]').click();
  cy.get('[data-testid="decline-appointment-button"]').click();
  cy.get("body").should("contain", "Declined by you");
  cy.get("body").type("{esc}");

  //delete appt 2
  cy.get('[data-testid="calendar-cell-7"]').click();
  cy.get('[data-testid="appointment-Dental-Visit"]').click();
  cy.contains("Delete").click();
  cy.get('[data-testid="confirm-delete-button"]').click();
  cy.wait(100);
  cy.get("body").type("{esc}");
  cy.get("body").should("not.contain", "Dental Visit");
});
