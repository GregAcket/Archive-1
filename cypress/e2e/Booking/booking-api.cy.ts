// Endpoints interceptés :
//   GET  /booking/room/:roomId/availability?startDate=...&endDate=...  → { available: boolean }
//   POST /booking                                                        → { status: "ok" }

describe("Formulaire de réservation (API stubée)", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  // ─── Affichage ──────────────────────────────────────────────────────────────

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

  // ─── Validation des dates ───────────────────────────────────────────────────

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

    it("n'appelle pas l'API si les dates sont invalides", () => {
      cy.intercept("GET", "/booking/room/*/availability*").as("availability");
      cy.get('input[type="date"]').first().type("2026-06-10");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      // Aucune requête ne doit partir
      cy.get("@availability.all").should("have.length", 0);
    });
  });

  // ─── Réservation réussie ────────────────────────────────────────────────────

  describe("Réservation réussie", () => {
    beforeEach(() => {
      cy.intercept("GET", "/booking/room/*/availability*", {
        body: { available: true },
      }).as("checkAvailability");

      cy.intercept("POST", "/booking", {
        statusCode: 200,
        body: { status: "ok" },
      }).as("createBooking");
    });

    it("confirme une réservation Standard (4 nuits = 320 €)", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@checkAvailability");
      cy.wait("@createBooking");
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
      cy.wait("@checkAvailability");
      cy.wait("@createBooking");
      cy.get(".success")
        .should("be.visible")
        .and("contain", "Réservation confirmée")
        .and("contain", "480");
    });

    it("vérifie que la requête POST /booking contient les bonnes données", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@createBooking").its("request.body").should("deep.equal", {
        roomId: "1",
        startDate: "2026-06-01",
        endDate: "2026-06-05",
        total: 320,
      });
    });

    it("vérifie que la requête GET availability est appelée avec le bon roomId", () => {
      cy.get("select").select("Deluxe  -  120 €/nuit");
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@checkAvailability")
        .its("request.url")
        .should("include", "/booking/room/2/availability");
    });

    it("applique le code promo SUMMER10 (−10%) → 4 nuits Standard = 288 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get('input[type="text"]').type("SUMMER10");
      cy.get("button").click();
      cy.wait("@createBooking");
      // 4 * 80 * 0.9 = 288
      cy.get(".success").should("be.visible").and("contain", "288");
    });

    it("envoie le bon total avec le code promo SUMMER10 dans le corps de la requête", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get('input[type="text"]').type("SUMMER10");
      cy.get("button").click();
      cy.wait("@createBooking")
        .its("request.body.total")
        .should("equal", 288);
    });

    it("ignore un code promo invalide (total = 320 €)", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get('input[type="text"]').type("INVALID");
      cy.get("button").click();
      cy.wait("@createBooking");
      cy.get(".success").should("be.visible").and("contain", "320");
    });

    it("applique la réduction séjour long (≥ 7 nuits, −5%) → 9 nuits Standard = 684 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-10");
      cy.get("button").click();
      cy.wait("@createBooking");
      // 9 * 80 * 0.95 = 684
      cy.get(".success").should("be.visible").and("contain", "684");
    });

    it("cumule SUMMER10 et séjour long → 9 nuits Standard = 616 €", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-10");
      cy.get('input[type="text"]').type("SUMMER10");
      cy.get("button").click();
      cy.wait("@createBooking");
      // 9 * 80 * 0.9 * 0.95 = 615.6 → round → 616
      cy.get(".success").should("be.visible").and("contain", "616");
    });

    it("n'affiche pas de message d'erreur après une réservation réussie", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@createBooking");
      cy.get(".success").should("be.visible");
      cy.get(".error").should("not.exist");
    });
  });

  // ─── Chambre indisponible ───────────────────────────────────────────────────

  describe("Chambre indisponible", () => {
    beforeEach(() => {
      cy.intercept("GET", "/booking/room/*/availability*", {
        body: { available: false },
      }).as("checkAvailability");
    });

    it("affiche l'erreur 'Chambre indisponible'", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@checkAvailability");
      cy.get(".error")
        .should("be.visible")
        .and("contain", "Chambre indisponible");
    });

    it("n'appelle pas POST /booking si la chambre est indisponible", () => {
      cy.intercept("POST", "/booking").as("createBooking");
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@checkAvailability");
      cy.get("@createBooking.all").should("have.length", 0);
    });

    it("n'affiche pas de message de succès si la chambre est indisponible", () => {
      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@checkAvailability");
      cy.get(".error").should("be.visible");
      cy.get(".success").should("not.exist");
    });
  });

  // ─── État de chargement ─────────────────────────────────────────────────────

  describe("État de chargement", () => {
    it("désactive le bouton et affiche 'Réservation...' pendant l'appel API", () => {
      // Retarde la réponse pour observer l'état de chargement
      cy.intercept("GET", "/booking/room/*/availability*", (req) => {
        req.reply({ delay: 500, body: { available: true } });
      }).as("checkAvailability");

      cy.intercept("POST", "/booking", {
        body: { status: "ok" },
      }).as("createBooking");

      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.get("button").should("be.disabled").and("contain", "Réservation...");
    });

    it("réactive le bouton 'Réserver' une fois la réservation confirmée", () => {
      cy.intercept("GET", "/booking/room/*/availability*", {
        body: { available: true },
      }).as("checkAvailability");

      cy.intercept("POST", "/booking", {
        body: { status: "ok" },
      }).as("createBooking");

      cy.get('input[type="date"]').first().type("2026-06-01");
      cy.get('input[type="date"]').last().type("2026-06-05");
      cy.get("button").click();
      cy.wait("@createBooking");
      cy.get("button").should("not.be.disabled").and("have.text", "Réserver");
    });
  });
});
