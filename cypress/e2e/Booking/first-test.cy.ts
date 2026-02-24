describe("Page d’accueil", () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit("http://localhost:5173");
  });

  it("affiche le logo", () => {
    cy.get("img").should("be.visible");
  });

  it("affiche le nombre d'options", () => {
    cy.get("select")
      .find("option")
      .should("have.length", 2)
      .then((options) => {
        expect(options[0]).to.have.text("Standard  -  80 €/nuit");
        expect(options[1]).to.have.text("Deluxe  -  120 €/nuit");
      });
  });

  it("affiche le premier type de chambre", () => {
    cy.get("select > option ")
      .first()
      .should("have.text", "Standard  -  80 €/nuit");
  });

  it("affiche le dernier type de chambre", () => {
    cy.get("select > option ")
      .last()
      .should("have.text", "Deluxe  -  120 €/nuit");
  });
});
