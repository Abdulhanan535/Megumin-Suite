// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Characters — cast generator (Section 12).
//
// Ported from the standalone "Dynamic Characters" extension (author "gojo",
// v1.0.0, read in full from the user's install). The original generated a JSON
// cast from a scene opening and wrote all members into a single "Narrator"
// SillyTavern character card. This port keeps the original's prompt, format
// rules, appearance lists and one-repair retry — but cast members become
// regular NPC Bank records (the user's chosen destination), with Booru tags
// derived from the pre-rolled appearance so ComfyUI works immediately.
//
// Trigger is the original's one-shot flow: Start Scene button + /dynchar.
// The AI call routes through the per-task Utility Backend system (task type
// "castGenerator") — the original used ST's ConnectionManagerRequestService.
// ─────────────────────────────────────────────────────────────────────────────

import { getContext, Popup, POPUP_TYPE } from "../../st.js";
import { localProfile } from "../../core/state.js";
import { saveProfileToMemory } from "../../core/profile.js";
import { runUtilityGeneration, meguminTaskBackend } from "../engine/utility.js";
import { buildCastGeneratorMessages } from "../engine/taskPrompts.js";
import { npcCreateRecord } from "../npc/data.js";
import { meguminActiveDataIdentity } from "../../core/keys.js";

// ── Appearance lists (ported verbatim from the original) ─────────────────────

const EYE_COLORS = [
    "Brown", "Blue", "Green", "Red", "Purple", "Yellow", "Grey",
    "Black", "Pink", "Amber", "Golden", "Orange", "Cyan",
    "Light Blue", "Light Green", "Light Purple", "Violet", "White",
];

const HAIRSTYLES = [
    // Length
    "Short hair", "Medium hair", "Long hair", "Very long hair",
    // Cuts
    "Bob cut", "Inverted bob", "Pixie cut", "Crew cut", "Buzz cut",
    "Bowl cut", "Undercut", "Flattop", "Mullet", "Wolf cut", "Hime cut",
    "Shag", "Layered", "Asymmetrical cut",
    // Tied
    "Ponytail", "High ponytail", "Low ponytail", "Side ponytail",
    "Braided ponytail", "Split ponytail", "Front ponytail",
    "Twintails", "Tri tails", "Quad tails",
    "Messy bun", "Double bun", "Space buns", "Hair bun",
    "French twist", "Chignon", "Half updo",
    // Braids
    "Braids", "French braids", "Dutch braids", "Fishtail braid",
    "Crown braid", "Side braid", "Single braid", "Braided bangs",
    "Half up braid", "Half up half down braid", "Low-braided long hair",
    // Texture
    "Curly hair", "Wavy hair", "Straight hair", "Spiked hair",
    "Ringlets", "Drill hair", "Fluffy hair", "Big hair",
    // Bangs
    "Bangs", "Blunt bangs", "Choppy bangs", "Wispy bangs",
    "Curtain bangs", "Side-swept bangs", "Arched bangs",
    "Asymmetrical bangs", "Crossed bangs", "Diagonal bangs",
    "Short bangs", "Long bangs", "Swept bangs",
    // Special
    "Messy hair", "Tousled hair", "Bedhead", "Wind-swept hair",
    "Hair behind ear", "Hair over one eye", "Hair between eyes",
    "Widow's peak", "Ahoge", "Heart-shaped hair",
    "Drill sidelocks", "Long sidelocks", "Sidelocks",
    "Beehive", "Quiff", "Afro", "Mohawk", "Sidecut",
    "Hair down", "Hair up", "Slicked back", "Pulled back",
    "One side up", "Two side up",
];

const HAIR_COLORS = [
    "Black", "Brown", "Blonde", "Red", "Auburn", "Pink", "Purple",
    "Blue", "Green", "Grey", "White", "Orange", "Aqua",
    "Light Blue", "Light Purple", "Strawberry Blonde", "Ash Blonde",
    "Silver", "Platinum", "Lavender", "Lilac", "Pastel Pink",
];

// Weighted 45/45/10, exactly as the original's 10×/10×/1× repetition did.
const BREAST_SIZES = [
    "Small", "Small", "Small", "Small", "Small",
    "Small", "Small", "Small", "Small", "Small",
    "Medium", "Medium", "Medium", "Medium", "Medium",
    "Medium", "Medium", "Medium", "Medium", "Medium",
    "Large",
];

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

function randomAppearance() {
    return {
        eyes: pickRandom(EYE_COLORS),
        hairstyle: pickRandom(HAIRSTYLES),
        hairColor: pickRandom(HAIR_COLORS),
        breasts: pickRandom(BREAST_SIZES),
    };
}

// Booru tags straight from the pre-rolled appearance, so Image Gen works on a
// fresh cast member without a second AI call.
function appearanceToBooruTags(app, sex) {
    const tags = [
        sex && /f/i.test(sex) ? "1girl" : sex && /m/i.test(sex) ? "1boy" : "1girl",
        `${app.eyes.toLowerCase()} eyes`,
        `${app.hairColor.toLowerCase()} hair`,
        app.hairstyle.toLowerCase(),
        `${app.breasts.toLowerCase()} breasts`,
    ];
    return tags.join(", ");
}

// ── Profile settings ─────────────────────────────────────────────────────────

export function castGenSettings() {
    if (!localProfile.castGen || typeof localProfile.castGen !== "object") {
        localProfile.castGen = { guidance: "", temperature: 0.8, maxTokens: 2048 };
    }
    const s = localProfile.castGen;
    if (typeof s.guidance !== "string") s.guidance = "";
    if (!Number.isFinite(+s.temperature)) s.temperature = 0.8;
    if (!Number.isFinite(+s.maxTokens)) s.maxTokens = 2048;
    return s;
}

// ── Scene text collection (main path needs clean chat, direct path too) ──────

function recentChatText() {
    const chat = getContext()?.chat || [];
    return chat
        .filter(m => !m.is_system && !m.is_small_system)
        .slice(-15)
        .map(m => `${m.is_user ? "User" : (m.name || "Character")}: ${String(m.mes || "").slice(0, 500)}`)
        .join("\n");
}

// ── JSON parse + repair (ported from the original, tabbed to the suite) ──────

function parseCharacterJson(text) {
    const cleaned = String(text || "").replace(/```(?:json)?/gi, "").trim();

    const tryEndpoints = (open, close) => {
        const start = cleaned.indexOf(open);
        const end = cleaned.lastIndexOf(close);
        if (start === -1 || end <= start) return null;
        return cleaned.slice(start, end + 1);
    };

    const candidates = [tryEndpoints("[", "]"), tryEndpoints("{", "}")].filter(Boolean);
    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch {
            const repaired = candidate
                .replace(/,\s*}/g, "}")
                .replace(/,\s*]/g, "]")
                .replace(/}\s*\{/g, "},{")
                .replace(/}\s*\[/g, "},")
                .replace(/\bundefined\b/g, "null");
            try {
                return JSON.parse(repaired);
            } catch {
                // try next candidate
            }
        }
    }
    throw new Error("Model reply contained no valid JSON");
}

async function requestJson(messages, maxTokens) {
    const request = async (msgs) => {
        const { text } = await runUtilityGeneration("castGenerator", msgs, {
            maxTokens,
            temperature: castGenSettings().temperature,
        });
        return text;
    };

    const text = await request(messages);
    try {
        return parseCharacterJson(text);
    } catch (err) {
        console.warn("[Megumin-Suite] cast reply was not valid JSON, retrying once…", text);
        const retryText = await request([
            ...messages,
            { role: "user", content: "Your previous reply was not valid JSON. Reply again with ONLY the JSON, no markdown, no extra text." },
        ]);
        return parseCharacterJson(retryText);
    }
}

// ── Sheet-line mapping into NPC Bank native fields ───────────────────────────

function sheetToFieldMap(description) {
    const lines = String(description || "").split(/\n/);
    const get = (label) => {
        const hit = lines.find(l => new RegExp(`^\\s*${label}\\s*:`, "i").test(l));
        return hit ? hit.replace(new RegExp(`^\\s*${label}\\s*:`, "i"), "").trim() : "";
    };
    const details = get("Details");
    const personality = get("Personality");
    const appearance = get("Appearance");
    const hates = get("Hates");
    const desires = get("Desires");

    // Hates/Desires are not native fields; they ride as extra Personality lines
    // (a list field) so nothing the model wrote is lost.
    const personalityExtra = [
        hates ? `Hates: ${hates}` : "",
        desires ? `Desires: ${desires}` : "",
    ].filter(Boolean);

    return {
        background: details,
        personality: [personality, ...personalityExtra].filter(Boolean).join("\n"),
        appearance: appearance,
    };
}

// ── The one-shot flow ────────────────────────────────────────────────────────

let busy = false;

async function askSceneOpening(prefillText) {
    const text = await new Promise(resolve => {
        const popup = new Popup(
            `<h3>Scene opening</h3>Write the opening of the scene. The generator uses it to build the cast.`,
            POPUP_TYPE.INPUT,
            prefillText || "",
            { okButton: "Start", rows: 6, wide: true, placeholder: "e.g. The smuggling ship Aurora drops out of hyperspace above a rust-red desert moon and the crew gathers on the bridge…" }
        );
        popup.show().then(v => resolve(String(v ?? "").trim() || null));
    });
    return text;
}

export async function meguminCastGenerate() {
    if (busy) return;
    busy = true;
    try {
        const settings = castGenSettings();

        const guidance = settings.guidance;
        const sceneText = await askSceneOpening(guidance);
        if (!sceneText) return;

        const identity = meguminActiveDataIdentity();
        const chatText = recentChatText();

        // Ten pre-rolled appearances, assigned to cast members in order — the
        // original's mechanic. Appearance comes from RNG, not the model, and
        // the same assignment builds the Booru tags below.
        const apps = Array.from({ length: 10 }, () => randomAppearance());
        const appearanceLines = apps.map((a, i) =>
            `Character ${i + 1}: ${a.eyes} eyes, ${a.hairColor} ${a.hairstyle} hair, ${a.breasts} breasts`
        ).join("\n");

        const built = buildCastGeneratorMessages({ sceneText, chatText, guidance, appearanceLines });
        // The original capped the cast call at 1800 tokens; same cap here.
        const maxTokens = Math.min(Number(settings.maxTokens) || 2048, 1800);
        const parsed = await requestJson(built.messages, maxTokens);

        // Chat moved during the call → refuse to write into the wrong bank.
        if (meguminActiveDataIdentity() !== identity) {
            console.debug(`[Megumin-Suite] Cast declined: requested in "${identity}" but "${meguminActiveDataIdentity()}" is active now.`);
            return;
        }

        const cast = (Array.isArray(parsed) ? parsed : [parsed])
            .map(c => ({ name: String(c?.name || "").trim(), description: String(c?.description || "").trim() }))
            .filter(c => c.name && c.description);
        if (!cast.length) throw new Error("Model reply contained no usable cast members");

        // Write each cast member as an NPC Bank record. The assigned appearance
        // is deterministic in JS, so the Booru tags are built here rather than
        // asked for — Image Gen works on the fresh cast with no extra call.
        if (!localProfile.npcBank.npcs) localProfile.npcBank.npcs = [];
        const chat = getContext()?.chat || [];
        const msgIndex = Math.max(0, chat.length - 1);
        const existing = new Set(localProfile.npcBank.npcs.map(n => (n.name || "").trim().toLowerCase()));
        let added = 0;

        cast.forEach((member, idx) => {
            if (existing.has(member.name.toLowerCase())) return;
            existing.add(member.name.toLowerCase());

            // Same position in the assigned-appearance list the prompt offered,
            // so the tags match what the model wrote in its Appearance line.
            const app = apps[idx] || randomAppearance();
            const fields = sheetToFieldMap(member.description);
            const record = npcCreateRecord({ parsed: {}, name: member.name, messageIndex: msgIndex });
            record.background = fields.background || record.background;
            record.personality = fields.personality || record.personality;
            record.appearance = fields.appearance || record.appearance;
            record.role = fields.background ? fields.background.split(/[.,]/)[0].trim() : "";
            record.imageTags = appearanceToBooruTags(app, record.sex);
            localProfile.npcBank.npcs.push(record);
            added++;
        });

        if (added > 0) {
            saveProfileToMemory();
            toastr.success(`Cast written to NPC Bank: ${cast.map(c => c.name).join(", ")}`, "Dynamic Characters");
        } else {
            toastr.info("Every cast member is already in the NPC Bank.", "Dynamic Characters");
        }
    } catch (err) {
        console.error("[Megumin-Suite] Cast generation failed:", err);
        toastr.error(`Dynamic Characters: ${err.message}`);
    } finally {
        busy = false;
    }
}

/** /dynchar slash command entry. */
export function registerCastGenCommand() {
    try {
        const ctx = getContext();
        const { SlashCommandParser, SlashCommand, SlashCommandNamedArgument, ARGUMENT_TYPE } = ctx;
        if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps) return;

        const namedArguments = SlashCommandNamedArgument?.fromProps ? [SlashCommandNamedArgument.fromProps({
            name: "guidance",
            description: "Style guidance override for the generated cast",
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: false,
        })] : [];

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: "dynchar",
            callback: () => { meguminCastGenerate(); return ""; },
            helpString: "Dynamic Characters: generate a cast from a scene opening and write it into the NPC Bank.",
            namedArguments,
        }));
    } catch (err) {
        console.warn("[Megumin-Suite] /dynchar registration failed:", err);
    }
}
