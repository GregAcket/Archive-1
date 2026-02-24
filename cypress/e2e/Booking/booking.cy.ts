describe("Formulaire de réservation", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  // ─── Affichage ───────────────────────────────────────────────────────────────

  describe("Affichage du formulaire", () => {
    it("affiche le formulaire complet avec tous ses champs", () => {
      cy.get("select").should("be.visible");
      cy.get('input[type="date"]').should("have.length", 2);
      cy.get('input[type="text"]').should("be.visible");
      cy.get("button").should("be.visible").and("have.text", "Réserver");
    });

    it("le bouton Réserver est actif par défaut", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("aucun message d'erreur ou de succès n'est affiché par défaut", () => {
      cy.get(".error").should("not.exist");
      cy.get(".success").should("not.exist");
    });

    it("la chambre Standard est sélectionnée par défaut", () => {
      cy.get("select").should("have.value", "1");
    });
  });

  // ─── Validation des dates ─────────────────────────────────────────────────────

  describe("Validation des dates", () => {
    it("affiche une erreur si la date de fin est antérieure à la date de début", () => {
      cy.get('input[type="date"]').first().type("2026-06-10");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".error").should("be.visible").and("contain", "Dates invalides");
    });

    it("affiche une erreur si les deux dates sont identiques (0 nuit)", () => {
      cy.get('input[type="date"]').first().type("2026-06-10");
      cy.get('input[type="date"]').last().type("2026-06-10");
      cy.get("button").click();
      cy.get(".error").should("be.visible").and("contain", "Dates invalides");
    });

    it("n'affiche pas de message de succès en cas de dates invalides", () => {
      cy.get('input[type="date"]').first().type("2026-06-10");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".success").should("not.exist");
    });
  });

  // ─── Réservation réussie ──────────────────────────────────────────────────────

  describe("Réservation réussie", () => {
    beforeEach(() => {
      // Forcer Math.random à retourner 0.5 :
      //   checkAvailability : 0.5 >= 0.2  → chambre disponible
      //   createBooking     : 0.5 >= 0.1  → pas d'erreur serveur
      cy.window().then((win) => {
        cy.stub(win.Math, "random").returns(0.5);
      });
    });

    it("confirme une réservation Standard (4 nuits = 320 €)", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".success")
        .should("be.visible")
        .and("contain", "Réservation confirmée")
        .and("contain", "320");
    });

    it("confirme une réservation Deluxe (4 nuits = 480 €)", () => {
      cy.get("select").select("Deluxe  -  120 €/nuit");
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".success")
        .should("be.visible")
        .and("contain", "Réservation confirmée")
        .and("contain", "480");
    });

    it("applique le code promo SUMMER10 (−10%) → 4 nuits Standard = 288 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get('input[type="text"]').type("SUMMER10");
      cy.get("button").click();
      // 4 * 80 * 0.9 = 288
      cy.get(".success").should("be.visible").and("contain", "288");
    });

    it("ignore un code promo invalide (pas de réduction)", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get('input[type="text"]').type("INVALID");
      cy.get("button").click();
      // 4 * 80 = 320 (aucune réduction)
      cy.get(".success").should("be.visible").and("contain", "320");
    });

    it("applique la réduction séjour long pour 7 nuits ou plus (−5%) → 9 nuits Standard = 684 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-10");
      cy.get("button").click();
      // 9 * 80 * 0.95 = 684
      cy.get(".success").should("be.visible").and("contain", "684");
    });

    it("cumule les deux réductions (SUMMER10 + séjour long) → 9 nuits Standard = 616 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-10");
      cy.get('input[type="text"]').type("SUMMER10");
      cy.get("button").click();
      // 9 * 80 * 0.9 * 0.95 = 615.6 → Math.round → 616
      cy.get(".success").should("be.visible").and("contain", "616");
    });

    it("n'affiche pas de message d'erreur après une réservation réussie", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".success").should("be.visible");
      cy.get(".error").should("not.exist");
    });
  });

  // ─── Chambre indisponible ────────────────────────────────────────────────────

  describe("Chambre indisponible", () => {
    beforeEach(() => {
      // Math.random() retourne 0.1 < 0.2 → unavailable = true → chambre indisponible
      cy.window().then((win) => {
        cy.stub(win.Math, "random").returns(0.1);
      });
    });

    it("affiche une erreur 'Chambre indisponible'", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".error")
        .should("be.visible")
        .and("contain", "Chambre indisponible");
    });

    it("n'affiche pas de message de succès quand la chambre est indisponible", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".error").should("be.visible");
      cy.get(".success").should("not.exist");
    });
  });

  // ─── État de chargement ───────────────────────────────────────────────────────

  describe("État de chargement", () => {
    it("désactive le bouton et affiche 'Réservation...' pendant l'appel API", () => {
      cy.window().then((win) => {
        cy.stub(win.Math, "random").returns(0.5);
      });
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get("button").should("be.disabled").and("contain", "Réservation...");
    });

    it("réactive le bouton 'Réserver' après confirmation", () => {
      cy.window().then((win) => {
        cy.stub(win.Math, "random").returns(0.5);
      });
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get(".success").should("be.visible");
      cy.get("button").should("not.be.disabled").and("have.text", "Réserver");
    });
  });
});
