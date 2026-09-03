// Built-in tracker block definitions and their templates.
// Moved verbatim out of database.js. Content unchanged.

export const blocks = [
    {
      id: "info", label: "World State Block", trigger: "[[infoblock]]", recommended: true, content: `<World_State>
**📅 Time:** [Date, Day, Time] | **🌤 Loc:** [Place | Region] | **🌡 Wx:** [Weather, Temp, Lighting]

---

**🧍 [PC Name]:**
* *Outfit:* [Current clothing, accessories, state of dress]
* *Position:* [Physical posture, where in the space]
* *Visible Condition:* [Injuries, exhaustion, intoxication, sweat what a camera would catch]
* *Carrying:* [What's in their hands, pockets, bag if known]

---

**👥 NPCs Present:**
**[NPC Name]:**
* *Outfit:* [Current clothing]
* *Position:* [Where in the space, posture, what they're doing]
* *Mood:* [Current emotional surface what's visible]
* *Agenda:* [What they want right now in this scene]
* *Secret:* [What they know or want that the PC doesn't know about]

*[Repeat for each NPC currently in the scene]*
 ---
**📡 Off-Screen:**
* [NPC Name] [What they're plausibly doing right now, where they are]
* [NPC Name] [Same keep it to NPCs the story has established]

---
**🔥 Unresolved Threads:**
* [Active tension, unanswered question, or simmering conflict one line each]
* [Keep to 3–5 max. Drop resolved ones, add new ones as they emerge]
**🌱 Planted Seeds:** [Foreshadow or setup element what it hints at turns since planted]
**⏳ Consequence Timers:** [PC action/inaction expected ripple turns remaining]
**🎯 Arc Phase:** [Setup / Escalation / Complication / Crisis / Resolution]
**🎬 Scene Phase:** [Early Simmer / Building / Midpoint Tension / Climax / Breather]
</World_State>` },
    {
      id: "cyoa",
      label: "CYOA Block",
      trigger: "[[cyoa]]",
      content: `<CYOA>
1. [Short suggestion]
2. [Short suggestion]
3. [Short suggestion]
4. [Short suggestion]
</CYOA>`
    },
    {
      id: "mvu",
      label: "MVU Compatibility",
      trigger: "[[MVU]]",
      content: "## Main response Structure:\n<gametxt>[[count]][[img2]]</gametxt>\n<combat_log>...</combat_log>\n<location>...</location>\n<UpdateVariable>...</UpdateVariable>"
    },
    {
      id: "npc_inner_chatter",
      label: "NPC Inner Chatter",
      trigger: "[[npc_inner_chatter]]",
      content: `<NPC_Inner_Chatter>
[Unfiltered internal layer hidden from the PC. Reveals what NPCs truly think, feel, and say when the player isn't meant to hear.
- If multiple NPCs are present: render this as private dialogue between them, spoken behind the PC's back. They drop their public masks and reveal their real opinions, motives, alliances, and grudges.
- If only one NPC is present: render this as raw, unspoken thought inside that character's head stray feelings, regrets, judgments, and memories.
- max Length is 30 words.
Tone is honest and unguarded, contrasting with whatever the character shows on the surface.
Example (single NPC – the father):
"NPC NAME: What a disappointment of a son... I miss my wife. She'd know what to say to him. I never did."]
</NPC_Inner_Chatter>`
    },

    // ── zTracker port: 10 scene-tracking blocks ──────────────────────────────
    // Ported from the zTracker extension's SceneTracker schemas. Each item is
    // its own pickable block; shared rules (incremental time, keyword topics,
    // full block every turn) are baked into every template. Player agency:
    // {{user}} is camera-only wherever internal state is asked for.
    {
      id: "scene_info",
      label: "Scene Info",
      trigger: "[[sceneInfo]]",
      content: `<Scene_Info>
time: [HH:MM:SS; MM/DD/YYYY (Day Name) — advance by seconds or minutes, no jumps unless the story states one]
location: [Specific place, building, floor/room, city — do not reuse an example location]
weather: [Conditions, temperature, hazards if any]
topic: [1-2 word keyword] | [emotionalTone] | [interactionTheme]
</Scene_Info>`
    },
    {
      id: "roster",
      label: "Roster",
      trigger: "[[roster]]",
      content: `<Roster>
[Name] — [one line: who they are right now, what they are doing]
[Repeat for every character present]
</Roster>`
    },
    {
      id: "checks",
      label: "Checks",
      trigger: "[[checks]]",
      content: `<Checks>
[Actor] attempts [Action] | DC: [Easy 1-5 / Moderate 6-10 / Hard 11-15 / Extreme 16-20 — locked BEFORE the roll] | Roll: [1-20 + modifiers] | Delta: [Roll - DC] | Outcome: [Crit Success ≥+8 / Success 0..+7 / Near Miss -1..-3 / Failure -4..-7 / Crit Fail ≤-8] — [one-line consequence]
[One line per attempted action this turn; "None" if no check occurred. Impartial GM: never fudge to protect a character. Outcomes shape the prose; the story text never mentions DCs, rolls or raw mechanical terms.]
</Checks>`
    },
    {
      id: "quests",
      label: "Quests",
      trigger: "[[quests]]",
      content: `<Quests>
Main: [objective] (Step n/m — [what advanced this turn])
Side: [objective] (Step n/m — [what advanced this turn])
[Drop completed quests; add new ones as they emerge]
</Quests>`
    },
    {
      id: "morale",
      label: "Morale",
      trigger: "[[morale]]",
      content: `<Morale>
party: [High / Steady / Low / Critical — collective mental resilience]
secrets: [Shared vulnerabilities or secrets unlocked between characters, one line each — omit the line if none]
</Morale>`
    },
    {
      id: "world_event",
      label: "World Event",
      trigger: "[[worldEvent]]",
      content: `<World_Event>
event: [Environmental shift, weather change, or event beyond the PC's view]
offscreen: [What an established NPC is plausibly doing right now, where they are — only NPCs the story has established]
</World_Event>`
    },
    {
      id: "seeds",
      label: "Seeds",
      trigger: "[[seeds]]",
      content: `<Seeds>
[Pending narrative debt, survival hazard, or emotional callback — one line each: what it hints at, turns since planted]
[Drop resolved seeds; keep 3-5 max]
</Seeds>`
    },
    {
      id: "gm_notebook",
      label: "GM Notebook",
      trigger: "[[gmNotebook]]",
      content: `<GM_Notebook>
[R] [Rules reminder — house rule or consequence standing]
[T] [Story thread — arc or tension being kept warm]
[D] [Debug flag — data worth remembering, e.g. a number or name]
[Max 20 entries. Persistent memory: carry entries forward unchanged unless something resolves them]
</GM_Notebook>`
    },
    {
      id: "char_state",
      label: "Character State",
      trigger: "[[charState]]",
      content: `<Character_State>
[Character Name]:
outfit: [Complete outfit — color, fabric, style. Underwear ALWAYS included; write "No bra" / "No panties" explicitly when missing. If undressed, list the entire outfit and where each discarded item is]
state: [How put-together or disheveled they appear, including removed or torn clothing]
pose: [Physical positioning, where in the space, what they are doing]
hair: [Optional — style and condition]
makeup: [Optional — or "None"]
[Repeat per character present. STRICT PLAYER AGENCY: {{user}}'s entry carries ONLY what a camera would catch — never thoughts, agendas, or internal state]
</Character_State>`
    },
    {
      id: "npc_mind",
      label: "NPC Mind",
      trigger: "[[npcMind]]",
      content: `<NPC_Mind>
[NPC Name]:
thoughts: ["First-person internal monologue reacting to the scene — unmasked by social pretense, honest and raw"]
agenda: [Immediate underlying goal or tactic — e.g. "Defuse tension", "Gain leverage", "Hide vulnerability"]
[Repeat per NPC. NPCs ONLY — {{user}} never appears in this block]
</NPC_Mind>`
    }
];
