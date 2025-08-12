import { SignJWT } from "jose";

describe("calendar + dashboard e2e", () => {
  let token2: string;
  let token: string;
  let inviteLinkValue = "";

  beforeEach(async () => {
    const jwtSecret = new TextEncoder().encode(
      "XlGw86hiYgGRZyi6abappQMhEHHptbtt6leocJ4Lfmc" // This is hardcoded, ensure that your local .env matches this secret
    );
    token = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("carely")
      .setAudience("carely")
      .setSubject("user-id-1")
      .setExpirationTime("2h")
      .sign(jwtSecret);

    token2 = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("carely")
      .setAudience("carely")
      .setSubject("user-id-2")
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
  cy.wait(1000);
  cy.contains("Login").click();
  cy.wait(10000);

  //Create caregiver1
  cy.get('input[placeholder="Enter your full name"]').type("test caregiver");
  cy.get('[data-testid="dob-input"]').type("1999-01-01");
  cy.contains("Male").click();
  cy.contains("button", "Create Profile").click();
  cy.wait(1000);

  //create the first elder
  cy.contains("Add Elder").click();
  cy.get('input[placeholder="Enter their full name"]').type("Ahmaaa");
  cy.get('[data-testid="elder-dob-input"]').type("1940-05-21");
  cy.contains("Female").click();
  cy.contains("button", "Create Profile").click();
  //create the second elder
  cy.contains("Add Elder").click();
  cy.get('input[placeholder="Enter their full name"]').type("Ahgong");
  cy.get('[data-testid="elder-dob-input"]').type("1932-05-27");
  cy.contains("Male").click();
  cy.contains("button", "Create Profile").click();
  cy.contains("Calendar").click();
  cy.wait(1000);
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
  cy.wait(1000);
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
  cy.wait(1000);
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
  cy.wait(1000);
  cy.get('input[placeholder="e.g., Doctor Visit, Therapy Session"]').type(
    "Dental Visit"
  );
  cy.get('input[placeholder="Additional notes or details..."]').type(
    "Annual check-up at Dr Lim"
  );
  cy.wait(1000);
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
  cy.wait(1000);
  cy.get('[data-testid="appointment-Doctor-Visit"]').click();
  cy.wait(1000);
  cy.contains("Edit").click();
  cy.wait(1000);
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
  cy.wait(1000);

  //Accept and decline appt 2
  cy.get("body").type("{esc}");
  cy.wait(1000);
  cy.contains("Pending").click();
  cy.wait(1000);
  cy.contains("Doctor Visit").click();
  cy.wait(1000);
  cy.get('[data-testid="accept-appointment-button"]').click();
  cy.wait(1000);
  cy.get("body").should("contain", "Accepted by you");
  cy.get('[data-testid="undo-accept-button"]').click();
  cy.wait(1000);
  cy.get('[data-testid="decline-appointment-button"]').click();
  cy.wait(1000);
  cy.get("body").should("contain", "Declined by you");
  cy.wait(1000);
  cy.get('[data-testid="undo-decline-button"]').click();
  cy.get("body").type("{esc}");

  //Back to dashboard
  cy.get("[data-testid='back-to-dashboard-button']").click();
  cy.wait(1000);
  cy.contains("Ahmaaa").click();
  cy.wait(5000);
  //Click invite button to open modal
  cy.contains("Invite").click();
  cy.wait(1000);
  //store the copied value in clipboard
  cy.get('[data-testid="invite-link"]')
    .invoke("text")
    .then((text) => {
      inviteLinkValue = text;
      cy.log("Invite Link:", inviteLinkValue);
    });
  //Close the modal by clicking the X button
  cy.get('[data-testid="close-invite-modal"]').click();
  cy.wait(1000);
  cy.get("[data-testid='avatar-button']").click();
  cy.wait(1000);
  cy.get('[data-testid="logout-button"]').click();

  //Generate second token for the second user
  cy.log("JWT Token:", token2);
  cy.window().then((win) => {
    win.localStorage.setItem("carely-token", token2);
  });
  cy.visit("http://localhost:5173/");
  cy.wait(2000);
  cy.contains("Login").click();
  cy.wait(1000);

  //Create caregiver2
  cy.get('input[placeholder="Enter your full name"]').type("test caregiver two");
  cy.wait(1000);
  cy.get('[data-testid="dob-input"]').type("1999-01-01");
  cy.contains("Male").click();
  cy.contains("button", "Create Profile").click();
  cy.wait(1500);
  cy.then(() => {
    cy.visit(inviteLinkValue);
  });
  cy.wait(1000);
  //Handle profile creation if redirected, then accept invite or go to dashboard
  cy.get('body').then(($body) => {
    if ($body.find('button').filter(':contains("Create Profile")').length > 0) {
      // If we're on the create caregiver profile page, create the profile
      cy.get('input[placeholder="Enter your full name"]').clear().type("test caregiver two");
      cy.get('[data-testid="dob-input"]').clear().type("1999-01-01");
      cy.contains("Male").click();
      cy.contains("button", "Create Profile").click();
      cy.wait(2000);
    }
  });
  
  //Now accept invite or go to dashboard if already a caregiver
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="accept-invite-button"]').length > 0) {
      cy.get('[data-testid="accept-invite-button"]').click();
    } else if ($body.find('button').filter(':contains("Go to Dashboard")').length > 0) {
      cy.contains("Go to Dashboard").click();
    }
  });
  cy.wait(1000);
  //Go to calendar
  cy.contains("Calendar").click();
  cy.wait(1000);
  cy.get('[data-testid="calendar-cell-6"]').click();
  cy.wait(1000);
  cy.get('[data-testid="appointment-Doctor-Visit"]').click();
  cy.wait(1000);
  cy.get('[data-testid="accept-appointment-button"]').click();
  cy.wait(1000);
  // Verify the acceptance was successful
  cy.get("body").should("contain", "Accepted by you");
  cy.get("body").type("{esc}");
  cy.wait(1000);
  cy.get('[data-testid="calendar-cell-7"]').click();
  cy.wait(1000);
  cy.get('[data-testid="appointment-Dental-Visit"]').click();
  cy.wait(1000);
  cy.get('[data-testid="decline-appointment-button"]').click();
  cy.get("body").type("{esc}");
  cy.wait(1000);

  //Get back to dashboard and logout of caregiver 2
  cy.get("[data-testid='back-to-dashboard-button']").click();
  cy.wait(1000);
  cy.get("[data-testid='avatar-button']").click();
  cy.wait(1000);
  cy.get('[data-testid="logout-button"]').click();

  //Log in to caregiver 1 again
  cy.log("JWT Token:", token);
  cy.window().then((win) => {
    win.localStorage.setItem("carely-token", token);
  });
  cy.visit("http://localhost:5173/");
  cy.wait(2000);
  cy.contains("Login").click();
  cy.wait(1000);
  cy.contains("Calendar").click();
  cy.wait(1000);
  cy.get('[data-testid="calendar-cell-6"]').click();
  cy.get('[data-testid="appointment-Doctor-Visit"]').click();
  cy.wait(2000);
  // Check if appointment shows it was accepted (either by the same user or another caregiver)
  cy.get('body').then(($body) => {
    const bodyText = $body.text();
    // Should show either the caregiver name or acceptance status
    expect(bodyText).to.satisfy((text) => 
      text.includes('test caregiver two') || 
      text.includes('Already accepted by another caregiver') ||
      text.includes('Accepted by you')
    );
  });
  cy.get("body").type("{esc}");
  cy.get('[data-testid="calendar-cell-7"]').click();
  cy.wait(1000);
  cy.get('[data-testid="appointment-Dental-Visit"]').click();
  cy.wait(1000);
  cy.get('[data-testid="decline-appointment-button"]').click();
  cy.wait(1000);
  cy.contains(
    "All caregivers have declined this appointment, kindly contact external caregivers for assistance"
  ).should("be.visible");

  //delete appt 2
  cy.contains("Delete").click();
  cy.get('[data-testid="confirm-delete-button"]').click();
  cy.wait(1000);
  cy.get("body").type("{esc}");
  cy.get("body").should("not.contain", "Dental Visit");
  });
});
