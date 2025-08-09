import { SignJWT } from "jose";

describe("create, view, edit, delete note", () => { });

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

it("full note end to end test", () => {
    cy.viewport(2560, 1440);
    cy.visit("http://localhost:5173/");
    cy.wait(4500);
    cy.contains("Login", { timeout: 15000 })
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    cy.wait(10000);

    //Create the caregiver
    cy.get('input[placeholder="Enter your full name"]', { timeout: 10000 })
        .should("be.visible");
    cy.get('input[placeholder="Enter your full name"]').type("test caregiver");
    cy.wait(1000);
    cy.get('[data-testid="dob-input"]').type("1999-01-01");
    cy.contains("Male").click();
    cy.contains("button", "Create Profile").click();
    cy.wait(3000);

    // show that notes need at least one elder to be created
    cy.contains("Notes").click();
    cy.contains("Add Elder Profile").should("be.visible").click();
    cy.wait(2000);

    //create the first elder
    cy.contains("Add Elder").should("be.visible").click();
    cy.wait(1500);
    cy.get('input[placeholder="Enter their full name"]').type("Ahmaaa");
    cy.wait(1000);
    cy.get('[data-testid="elder-dob-input"]').type("1940-05-21");
    cy.wait(500);
    cy.contains("Female").click();
    cy.contains("button", "Create Profile").click();
    cy.wait(1500);
    cy.contains("Ahmaaa").should("be.visible");
    cy.wait(1500);
    //create the second elder
    cy.contains("Add Elder").should("be.visible").click();
    cy.wait(1000);
    cy.get('input[placeholder="Enter their full name"]').should("be.visible").type("Ahgong");
    cy.get('[data-testid="elder-dob-input"]').type("1932-05-27");
    cy.wait(500);
    cy.contains("Male").click();
    cy.contains("button", "Create Profile").click();
    cy.wait(1500);
    cy.contains("Ahgong").should("be.visible");
    cy.wait(1500);

    cy.contains("Notes").should("be.visible").click();
    cy.contains("New Note").should("be.visible");
    cy.wait(1000);


    // Create note for Ahmaaa
    cy.contains("Create First Note").should("be.visible").click();
    cy.wait(1000);
    cy.get('[data-testid="select-elder-assigned-button"]').click();
    cy.get('[role="listbox"]').contains("Ahmaaa").click();
    cy.wait(1000);
    cy.get('[data-testid="note-header-input"]')
        .type('Meds List', { force: true })
        .blur()
        .should('have.value', 'Meds List');
    cy.wait(1000);
    cy.get('[data-testid="note-content-input"]')
        .type('Take medication at 9am after meal', { force: true })
        .blur()
        .should('have.value', 'Take medication at 9am after meal');
    cy.wait(1000);
    cy.contains("Create Note").click();
    cy.wait(1000);
    cy.contains("Meds List").should("be.visible");
    cy.wait(2000);

    // Create note for Ahgong
    cy.contains("New Note").should("be.visible").click();
    cy.wait(1000);
    cy.get('[data-testid="select-elder-assigned-button"]').click();
    cy.get('[role="listbox"]').contains("Ahgong").click();
    cy.wait(1000);
    cy.get('[data-testid="note-header-input"]').type("Clinic Contact list", { delay: 50 });
    cy.wait(1000);
    cy.get('[data-testid="note-content-input"]')
        .type("ABC clinic, 62345678. Dr Loh, 87654321.\n\nTCM clinic, 62115678. Dr Amy, 87774321.", { force: true })
        .blur()
        .should('have.value', "ABC clinic, 62345678. Dr Loh, 87654321.\n\nTCM clinic, 62115678. Dr Amy, 87774321."
        );
    cy.wait(1000);
    cy.contains("Create Note").click();
    cy.wait(1000);
    cy.contains("Clinic Contact list").should("be.visible");
    cy.wait(1000);


    // Edit ahma note and check changes are visible
    cy.get('[data-testid="note-card"]')
        .contains("Meds List")
        .closest('[data-testid="note-card"]')  // Get the full card
        .within(() => {
            cy.contains("View Details").should("be.visible").click();
        });
    cy.wait(1000);
    cy.contains("Edit Note").click();
    cy.wait(1000);
    cy.get('[data-testid="note-header-edit-input"]').clear().type("Medication reminders!",
        { delay: 50 });
    cy.wait(1500);
    cy.get('[data-testid="note-content-edit-input"]')
        .clear()
        .type("Refill paracetamol\n\nFeed ibuprofen when necessary", { force: true })
        .blur()
        .should('have.value', "Refill paracetamol\n\nFeed ibuprofen when necessary"
        );
    cy.wait(1000);
    cy.contains("Save Changes").click();
    cy.wait(1000);
    cy.contains("Medication reminders!").should("be.visible");
    cy.contains("Meds List").should("not.exist");
    cy.wait(1000);

    // Delete ahgong note and check it is gone
    cy.get('[data-testid="note-card"]')
        .contains("Clinic Contact list")
        .closest('[data-testid="note-card"]')
        .within(() => {
            cy.contains("View Details").should("be.visible").click();
        });
    cy.wait(1000);
    cy.contains("Delete Note").should("be.visible").click();
    cy.wait(500);
    cy.contains("Clinic Contact list").should("not.exist");
});
