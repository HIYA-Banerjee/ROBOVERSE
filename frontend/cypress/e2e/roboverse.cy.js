describe("RoboVerse AI E2E Comprehensive Tests", () => {
  beforeEach(() => {
    // Start from the landing page
    cy.visit("http://localhost:3000");
  });

  it("should verify landing page styles and navigation options", () => {
    cy.get("div.cyber-grid").should("have.class", "hero-bg");
    cy.get("h1").contains("Learn Robotics Without the").should("be.visible");
    cy.get("a").contains("LAUNCH PLATFORM").should("be.visible");
  });

  it("should verify standalone Learning Hub (/learn) routing, quiz answering, and badge updates", () => {
    // Navigate to learn page
    cy.visit("http://localhost:3000/learn");
    cy.url().should("include", "/learn");
    cy.get("h1").contains("ROBOVERSE_LEARNING_HUB");

    // Click the first lesson and verify content
    cy.get("button").contains("Robotics Fundamentals").click();
    cy.get("h1").contains("Lesson 1: Introduction to Robotics").should("be.visible");

    // Select the second option in the quiz (the correct answer: Actuator)
    cy.get("button").contains("An actuator (like a DC motor or Servo)").click();
    
    // Submit answer and verify feedback
    cy.get("button").contains("SUBMIT ANSWER").click();
    cy.get("span").contains("Assessment Passed! +25 XP").should("be.visible");

    // Check that unlocked badge indicator counts at least 1 badge
    cy.get("span").contains("1 / 4").should("be.visible");
  });

  it("should check dashboard workspaces (Wiring Studio, Builder, Code, Generator) and Tutor chat", () => {
    // Navigate to dashboard
    cy.visit("http://localhost:3000/dashboard");
    cy.url().should("include", "/dashboard");

    // 1. Test AI Tutor Chat Sidebar
    cy.get("input[placeholder='Ask tutor something...']").type("Explain common ground");
    cy.get("button").find("svg").parent().click({ force: true }); // Clicks the send button
    
    // Wait for the tutor to stream reply
    cy.get("div").contains("Common Ground").should("be.visible");

    // 2. Test Wiring Studio Canvas Actions
    cy.get("button").contains("Wiring Studio").click();
    // Add Arduino Uno to canvas
    cy.get("button").contains("Arduino Uno").click();
    // Add Ultrasonic sensor to canvas
    cy.get("button").contains("Ultrasonic (HC-SR04)").click();
    
    // Check if components are rendered on the grid canvas
    cy.get("span").contains("Arduino Uno").should("be.visible");
    cy.get("span").contains("Ultrasonic (HC-SR04)").should("be.visible");

    // 3. Test Robot Builder Studio
    cy.get("button").contains("Robot Builder").click();
    // Select 4-Wheel Rover
    cy.get("button").contains("4-Wheel Rover").click();
    // Select ESP32 Controller
    cy.get("select").select("esp32");
    // Save design
    cy.get("button").contains("SAVE DESIGN CONFIG").click();
    cy.get("span").contains("Robot design catalog updated").should("be.visible");

    // 4. Test Simulation Lab Workspace
    cy.get("button").contains("Simulation Lab").click();
    cy.get("canvas").should("be.visible"); // Canvas is rendered
    cy.get("div").contains("Distance to front obstacle").should("be.visible");

    // 5. Test Programming Lab code compilation dry-run
    cy.get("button").contains("Programming Lab").click();
    // Select Arduino C++
    cy.get("select").select("cpp");
    // Write code in editor
    cy.get("textarea").clear().type("void setup() { Serial.begin(9600); } void loop() {}");
    // Click Upload & Run
    cy.get("button").contains("Upload & Run").click();
    // Verify successful terminal upload log
    cy.get("div").contains("RoboVerse Uno running code successfully.").should("be.visible");

    // 6. Test Real Hardware Generator BOM Tables
    cy.get("button").contains("Hardware Generator").click();
    cy.get("h2").contains("Real Hardware Generator").should("be.visible");
    
    // Check for BOM tables showing estimated budget and supplier link
    cy.get("th").contains("Component Name").should("be.visible");
    cy.get("th").contains("Supplier Link").should("be.visible");
  });
});
