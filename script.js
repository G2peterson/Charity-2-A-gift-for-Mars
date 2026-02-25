/* Charity Water One — Phase 2 (Kids Version)
   Requirements implemented:
   - Mars: 3 decisions (deliver water, attend summit, skip)
   - Ceres: 3 decisions (extract fast, recon (time), return now)
   - Consequences:
     A) Give up purifier module on Mars => ship grounded; Spencer continues to Titan (carrot)
     B) Skip recon => you can complete mission but get stuck (no funding); purifier ends up used on Mars anyway
     C) Recon => water + fuel + gold => huge payoff, 🏁 flags, Titan unlocked
*/

(() => {
  const $ = (id) => document.getElementById(id);

  const ui = {
    sceneArt: $("sceneArt"),
    sceneName: $("sceneName"),
    sceneHint: $("sceneHint"),
    shipPill: $("shipPill"),
    endingPill: $("endingPill"),

    fuelText: $("fuelText"),
    earthText: $("earthText"),
    marsText: $("marsText"),
    timeText: $("timeText"),
    goldText: $("goldText"),

    fuelBar: $("fuelBar"),
    earthBar: $("earthBar"),
    marsBar: $("marsBar"),
    timeBar: $("timeBar"),
    goldBar: $("goldBar"),

    log: $("log"),
    buttons: $("buttons"),
    choicesTitle: $("choicesTitle"),

    btnReset: $("btnReset"),
    btnSave: $("btnSave"),
    btnLoad: $("btnLoad"),

    modal: $("modal"),
    modalTitle: $("modalTitle"),
    modalBody: $("modalBody"),
    modalActions: $("modalActions"),
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const fmtThirds = (n) => `${n}/3`;
  const fmtFive = (n) => `${n}/5`;

  const START = {
    scene: "INTRO",
    shipMobile: true,
    fuelThirds: 3, // start full for Phase 2
    earthWater: 3, // stable-ish
    marsWater: 0, // crisis
    time: 0, // 0..10
    goldFound: false, // hidden prize
    ending: "In progress",
  };

  let state = structuredClone(START);

  function log(who, msg, kind = "ai") {
    const div = document.createElement("div");
    div.className = `entry ${kind}`;
    div.innerHTML = `<div class="who">${who}</div><div class="msg">${msg}</div>`;
    ui.log.appendChild(div);
    ui.log.scrollTop = ui.log.scrollHeight;
  }

  function setScene(name, art, hint) {
    ui.sceneName.textContent = name;
    ui.sceneArt.textContent = art;
    ui.sceneHint.textContent = hint;
  }

  function setButtons(title, buttons) {
    ui.choicesTitle.textContent = title;
    ui.buttons.innerHTML = "";
    for (const b of buttons) {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      if (b.variant) btn.classList.add(b.variant);
      btn.addEventListener("click", b.onClick);
      ui.buttons.appendChild(btn);
    }
  }

  function updateMeters() {
    ui.fuelText.textContent = fmtThirds(state.fuelThirds);
    ui.fuelBar.style.width = `${(state.fuelThirds / 3) * 100}%`;

    ui.earthText.textContent = fmtFive(state.earthWater);
    ui.earthBar.style.width = `${(state.earthWater / 5) * 100}%`;

    ui.marsText.textContent = fmtFive(state.marsWater);
    ui.marsBar.style.width = `${(state.marsWater / 5) * 100}%`;

    ui.timeText.textContent = `${state.time}/10`;
    ui.timeBar.style.width = `${(state.time / 10) * 100}%`;

    ui.goldText.textContent = state.goldFound ? "Found" : "Hidden";
    ui.goldBar.style.width = `${state.goldFound ? 100 : 0}%`;

    ui.shipPill.textContent = `Ship: ${state.shipMobile ? "Mobile" : "Grounded (module left on Mars)"}`;
    ui.endingPill.textContent = `Outcome: ${state.ending}`;
  }

  function spendFuel(n) {
    state.fuelThirds = clamp(state.fuelThirds - n, 0, 3);
  }
  function addTime(n) {
    state.time = clamp(state.time + n, 0, 10);
  }
  function addEarth(n) {
    state.earthWater = clamp(state.earthWater + n, 0, 5);
  }
  function addMars(n) {
    state.marsWater = clamp(state.marsWater + n, 0, 5);
  }

  function showModal(title, bodyHtml, actions) {
    ui.modalTitle.textContent = title;
    ui.modalBody.innerHTML = bodyHtml;
    ui.modalActions.innerHTML = "";
    actions.forEach(a => {
      const btn = document.createElement("button");
      btn.textContent = a.label;
      if (a.variant) btn.classList.add(a.variant);
      btn.addEventListener("click", a.onClick);
      ui.modalActions.appendChild(btn);
    });
    ui.modal.style.display = "flex";
    ui.modal.setAttribute("aria-hidden", "false");
  }
  function hideModal() {
    ui.modal.style.display = "none";
    ui.modal.setAttribute("aria-hidden", "true");
  }

  // ------------------------
  // PHASE 2 FLOW
  // ------------------------

  function intro() {
    state.scene = "INTRO";
    setScene("Moon Orbit — Phase 2 Briefing", "🌕", "Mars is pressure. Ceres is leverage.");
    log("AI", "Welcome aboard Charity Water One.", "ai");
    log("Captain rini", "Earth is holding at 3/5… but Mars is at zero.", "k");
    log("Science officer spencer", "Captain: short-term relief is not the same as long-term resilience.", "s");

    setButtons("Mars decision (3 options)", [
      { label: "🚰 Deliver emergency water to Mars (no summit)", variant: "secondary", onClick: marsDeliver },
      { label: "🫖 Attend the Mars summit (Tea Time)", variant: "warn", onClick: marsSummit },
      { label: "🚀 Skip Mars → Go straight to Ceres", variant: "good", onClick: ceresArrive },
    ]);

    updateMeters();
  }

  // MARS OPTION 1
  function marsDeliver() {
    state.scene = "MARS_DELIVER";
    setScene("Mars — Emergency Delivery", "🟥", "Band-aid help. Fuel cost is real.");
    log("Captain rini", "Deliver water. Keep the ship moving.", "k");

    spendFuel(1); // landing + ops
    addTime(1);
    addMars(1);

    log("AI", "Mars receives emergency water (+1). Fuel spent (-1/3).", "ai");
    log("Science officer spencer", "We helped. Now we need leverage. Ceres is leverage.", "s");

    setButtons("Next move", [
      { label: "🚀 Proceed to Ceres", variant: "good", onClick: ceresArrive },
      { label: "🫖 Go to the summit anyway", variant: "warn", onClick: marsSummit },
      { label: "🔧 Stay and patch more (costs fuel)", variant: "danger", onClick: marsPatchMore },
    ]);

    updateMeters();
  }

  function marsPatchMore() {
    setScene("Mars — Patchwork Trap", "🧰", "Every extra patch costs future missions.");
    log("Captain rini", "One more patch. Quick fixes.", "k");
    spendFuel(1);
    addTime(1);
    addMars(1);
    log("AI", "Mars improves again (+1). Fuel drops further.", "ai");

    setButtons("Leave or get stuck", [
      { label: "🚀 Leave now → Ceres", variant: "good", onClick: ceresArrive },
      { label: "🫖 Summit pressure increases", variant: "warn", onClick: marsSummit },
      { label: "🛑 Keep helping (not recommended)", variant: "danger", onClick: marsPatchMore },
    ]);

    updateMeters();
  }

  // MARS OPTION 2
  function marsSummit() {
    state.scene = "MARS_SUMMIT";
    setScene("Mars — Tea Time Summit", "🫖", "They want your purifier module.");
    log("Mars council", "Captain rini, land. We need a permanent plan.", "m");
    log("Mars council", "If you truly care… leave your purifier module here.", "m");
    log("Science officer spencer", "Captain. That’s a trap wrapped in applause.", "s");

    // 3 decisions at Mars remains true via this “sub-decision”
    setButtons("Summit decision (3 options)", [
      { label: "🧩 Give up the purifier module (ship grounded)", variant: "danger", onClick: marsGiveModule },
      { label: "🛠 Refuse module, give a small water boost, then leave", variant: "secondary", onClick: marsRefuseButHelp },
      { label: "🚀 Refuse and depart immediately to Ceres", variant: "good", onClick: ceresArrive },
    ]);

    updateMeters();
  }

  function marsGiveModule() {
    state.scene = "MARS_GIVE_MODULE";
    state.shipMobile = false;
    setScene("Mars — Module Removed", "🧩", "You saved Mars today. You lost the bridge.");
    log("Captain rini", "We’ll leave the module. Mars needs it now.", "k");
    addMars(2);
    addTime(2);

    state.ending = "Ship grounded on Mars";

    // Ending: Spencer continues to Titan
    endSpencerContinues();
  }

  function marsRefuseButHelp() {
    state.scene = "MARS_REFUSE_HELP";
    setScene("Mars — Temporary Aid Only", "🚰", "Help without surrender.");
    log("Captain rini", "We’re not dismantling the ship. We’ll provide temporary aid.", "k");

    spendFuel(1);
    addTime(1);
    addMars(1);

    log("Mars council", "You are choosing to leave us vulnerable.", "m");
    log("Science officer spencer", "We are choosing to keep the bridge alive.", "s");

    setButtons("Proceed", [
      { label: "🚀 Continue to Ceres", variant: "good", onClick: ceresArrive },
      { label: "🫖 Let the summit continue (pressure rises)", variant: "warn", onClick: marsSummit },
      { label: "🔧 Patch more (fuel cost)", variant: "danger", onClick: marsPatchMore },
    ]);

    updateMeters();
  }

  // MARS OPTION 3 is Skip → Ceres (handled by ceresArrive)

  // CERES (ASTEROID BELT) — 3 decisions
  function ceresArrive() {
    state.scene = "CERES_ARRIVE";
    setScene("Ceres — Asteroid Belt Node", "🪨", "Fuel vs Time. Extraction vs Recon.");
    log("AI", "Arrival: Ceres. Ice detected. Mineral anomalies possible.", "ai");
    log("Science officer spencer", "Captain: recon costs time, not much fuel.", "s");

    setButtons("Ceres decision (3 options)", [
      { label: "🧊 Land & extract water fast (costs fuel)", variant: "secondary", onClick: ceresExtractFast },
      { label: "🛰 Recon first (costs time, unlocks gold)", variant: "good", onClick: ceresRecon },
      { label: "↩️ Turn back now (no extraction)", variant: "danger", onClick: returnEmpty },
    ]);

    updateMeters();
  }

  function ceresExtractFast() {
    state.scene = "CERES_FAST";
    setScene("Ceres — Fast Extraction", "🧊", "You get water. You miss the multiplier.");
    log("Captain rini", "Land. Extract. Keep it simple.", "k");

    spendFuel(1);
    addTime(1);

    log("AI", "Basic water load secured. No recon performed.", "ai");

    // Return and evaluate consequence: stuck due to no gold funding
    returnToEarth({ water: true, gold: false, fuelBonus: false });
  }

  function ceresRecon() {
    state.scene = "CERES_RECON";
    setScene("Ceres — Recon Sweep", "🛰️", "Patience unlocks the hidden prize.");
    log("Captain rini", "Run recon. Slow is smooth.", "k");

    addTime(2); // time cost
    state.goldFound = true;

    log("AI", "Recon complete: ice mapped. Fuel route identified. Gold signature confirmed.", "ai");

    // Recon unlocks “full package” with near-zero extra fuel penalty (time paid instead)
    // Convert that into: +fuel efficiency back
    // Mechanic: spend 1 fuel to operate, then earn 1 back from fuel conversion = net neutral.
    spendFuel(1);
    state.fuelThirds = clamp(state.fuelThirds + 1, 0, 3);

    returnToEarth({ water: true, gold: true, fuelBonus: true });
  }

  function returnEmpty() {
    returnToEarth({ water: false, gold: false, fuelBonus: false });
  }

  // RETURN / ENDINGS
  function returnToEarth(payload) {
    state.scene = "EARTH_RETURN";
    setScene("Earth — Return Burn", "🌍", "The system changes here.");
    log("AI", "Return burn executed. Earth approach.", "ai");

    spendFuel(1);
    addTime(1);

    if (payload.water) {
      // Mission 2 brings Earth up
      addEarth(2); // bigger impact in Phase 2
      log("AI", "Water delivered to Earth. Condition rises.", "ai");
    } else {
      log("AI", "No water delivered this run.", "ai");
    }

    if (payload.gold) {
      log("AI", "Gold delivered: funding unlocked for 10 purification systems.", "ai");
      // multiplier: Earth and Mars improve “in perpetuity” (modeled as immediate bump)
      addEarth(0); // already boosted above
      addMars(2);
    }

    // Decide ending
    if (!state.shipMobile) {
      state.ending = "Grounded on Mars";
      endSpencerContinues();
      return;
    }

    // Strategic win requirements
    const titanUnlocked = state.goldFound && state.fuelThirds >= 2 && state.shipMobile;

    if (titanUnlocked) {
      state.ending = "Strategic Victory (Titan unlocked)";
      endStrategicVictory();
      return;
    }

    // No recon / no gold => “stuck on Mars anyway” ending you described
    if (payload.water && !payload.gold) {
      state.ending = "Short-term success, long-term stuck";
      endStuckNoFunding();
      return;
    }

    // Otherwise: basic finish
    state.ending = "Mission complete";
    endBasic();
  }

  function endStrategicVictory() {
    updateMeters();

    const body = `
      <div><strong>🏁 STRATEGIC VICTORY</strong></div>
      <div style="margin-top:8px;">
        Earth is now <strong>5/5</strong> and stable.<br>
        Mars is funded, fueled, and supported in perpetuity.<br><br>
        Gold funded <strong>10 purification systems</strong> and new ships.
        People on Earth can chase their own comets now.<br><br>
        Charity Water One doesn’t stay for applause.<br>
        It leaves.
      </div>
      <div style="margin-top:10px; font-size:18px;">🏁🏁🏁</div>
      <div style="margin-top:10px;"><strong>Next:</strong> Titan — Sophia awaits.</div>
    `;

    showModal("🏁 Finish Line Unlocked", body, [
      { label: "Reset (play again)", variant: "secondary", onClick: () => { hideModal(); reset(); } },
      { label: "Close", variant: "secondary", onClick: hideModal },
    ]);

    setButtons("End of Phase 2", [
      { label: "Reset and try a different strategy", variant: "secondary", onClick: reset },
    ]);
  }

  function endSpencerContinues() {
    updateMeters();

    const body = `
      <div><strong>ENDING:</strong> You saved Mars today… but grounded the ship.</div>
      <div style="margin-top:8px;">
        The purifier module stays on Mars.<br>
        Charity Water One becomes infrastructure.<br><br>
        <strong>Carrot:</strong> Spencer continues the mission without you.
        He reaches Titan. You never do.
      </div>
      <div style="margin-top:10px;">Lesson: applause can be a trap. Mobility is the bridge.</div>
    `;

    showModal("Mars Trap Ending", body, [
      { label: "Try again", variant: "secondary", onClick: () => { hideModal(); reset(); } },
      { label: "Close", variant: "secondary", onClick: hideModal },
    ]);

    setButtons("End of Phase 2", [
      { label: "Reset and try again", variant: "secondary", onClick: reset },
    ]);
  }

  function endStuckNoFunding() {
    updateMeters();

    const body = `
      <div><strong>ENDING:</strong> Mission success… but expansion fails.</div>
      <div style="margin-top:8px;">
        You delivered water.<br>
        Everyone feels relief.<br><br>
        But you skipped recon, so you missed the gold funding.<br>
        Without money, you can't buy new purification systems on Earth.<br><br>
        And when you got stuck anyway, the purifier ends up used on Mars no matter what.
        <strong>You could have brought 10 systems back.</strong>
      </div>
      <div style="margin-top:10px;">Lesson: water solves today. funding scales tomorrow.</div>
    `;

    showModal("Short-Term Win, Long-Term Stuck", body, [
      { label: "Try again (do recon)", variant: "good", onClick: () => { hideModal(); reset(); } },
      { label: "Close", variant: "secondary", onClick: hideModal },
    ]);

    setButtons("End of Phase 2", [
      { label: "Reset and try again", variant: "secondary", onClick: reset },
    ]);
  }

  function endBasic() {
    updateMeters();

    const body = `
      <div><strong>Mission Complete</strong></div>
      <div style="margin-top:8px;">
        You finished the run.<br>
        Try for the Strategic Victory: <strong>Recon + Gold + Fuel ≥ 2/3</strong>.
      </div>
    `;

    showModal("Mission Complete", body, [
      { label: "Play again", variant: "secondary", onClick: () => { hideModal(); reset(); } },
      { label: "Close", variant: "secondary", onClick: hideModal },
    ]);

    setButtons("End of Phase 2", [
      { label: "Reset and try again", variant: "secondary", onClick: reset },
    ]);
  }

  // SAVE / LOAD (simple)
  function save() {
    try {
      localStorage.setItem("cw_phase2_save", JSON.stringify(state));
      log("AI", "Saved.", "ai");
    } catch {
      log("AI", "Save failed.", "ai");
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem("cw_phase2_save");
      if (!raw) { log("AI", "No save found.", "ai"); return; }
      state = JSON.parse(raw);
      log("AI", "Loaded.", "ai");
      // restart scene with current meters (simple)
      ui.log.innerHTML = "";
      setScene("Loaded State", "🌕", "Meters restored. Start again.");
      setButtons("Restart Phase 2", [
        { label: "Start", variant: "good", onClick: () => { ui.log.innerHTML=""; intro(); } }
      ]);
      updateMeters();
    } catch {
      log("AI", "Load failed.", "ai");
    }
  }

  function reset() {
    state = structuredClone(START);
    ui.log.innerHTML = "";
    hideModal();
    intro();
  }

  ui.btnReset.addEventListener("click", reset);
  ui.btnSave.addEventListener("click", save);
  ui.btnLoad.addEventListener("click", load);

  ui.modal.addEventListener("click", (e) => {
    if (e.target === ui.modal) hideModal();
  });

  // Start
  intro();
})();
