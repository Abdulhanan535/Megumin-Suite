// ─────────────────────────────────────────────────────────────────────────────
// The utility backend router.
//
// Background generations used to have exactly one road: generateQuietPrompt(),
// i.e. the MAIN API. A user on a slow main model (8 t/s) with a fast one sitting
// there (80 t/s) watched memory summarization, NPC scans and the Ban List crawl
// at roleplay speed for work that is not roleplay.
//
// This module gives every background task its own backend choice:
//
//   "main"    → generateQuietPrompt through the prompt interceptor, unchanged.
//   "<id>"    → direct fetch to an OpenAI-compatible /chat/completions endpoint
//               configured in Global Settings. SillyTavern is bypassed: no preset
//               swap, no 3-second wait, no interference with an in-flight
//               roleplay generation.
//
// The backends themselves are stored in
//     extension_settings[extensionName].utilityBackends = [ { id, name, endpointUrl, apiKey, model, temperature, maxTokens } ]
// and the per-task mapping in
//     extension_settings[extensionName].utilityTaskBackends = { taskType: backendId | "main" }
// — global, deliberately NOT per-profile: API keys must never ride tab sync or
// chat-level profile storage.
// ─────────────────────────────────────────────────────────────────────────────

import { extension_settings, saveSettingsDebounced } from "../st.js";
import { extensionName } from "../core/constants.js";
import { generateQuietPrompt } from "../st.js";

// ── Task type registry ───────────────────────────────────────────────────────
// One entry per background generation the suite runs. The label is shown in the
// Global Settings picker; the id is the contract with every feature module.
export const UTILITY_TASKS = [
    { id: "storyPlan", label: "Story Director" },
    { id: "banList", label: "Ban List Analysis" },
    { id: "imageGen", label: "Image Prompt (Manual)" },
    { id: "npcScan", label: "NPC Scan" },
    { id: "npcPortrait", label: "NPC Portrait Prompt" },
    { id: "npcUpdate", label: "NPC Update" },
    { id: "memorySummarize", label: "Memory Summarization" },
    { id: "generationOrder", label: "Manual Generation Order" },
    { id: "imageInline", label: "Image Prompt (Inline Writer)" },
    { id: "castGenerator", label: "Cast Generator" },
];

// The task types that exist in code today. The two reserved ones ride along in
// the picker so the mapping survives feature work, but nothing calls them yet.
export const UTILITY_TASKS_ACTIVE = UTILITY_TASKS.filter(t => !t.label.includes("reserved"));

// ── Settings access ──────────────────────────────────────────────────────────

/** The backend list, creating the bucket on first read. */
export function meguminUtilityBackends() {
    const store = extension_settings[extensionName];
    if (!store) return [];
    if (!Array.isArray(store.utilityBackends)) store.utilityBackends = [];
    return store.utilityBackends;
}

/** The per-task mapping, creating the bucket on first read. */
export function meguminUtilityTaskMap() {
    const store = extension_settings[extensionName];
    if (!store) return {};
    if (!store.utilityTaskBackends || typeof store.utilityTaskBackends !== "object") {
        store.utilityTaskBackends = {};
    }
    return store.utilityTaskBackends;
}

/** Which backend a task routes to right now: a backend object, or null for "main". */
export function meguminTaskBackend(taskType) {
    const id = meguminUtilityTaskMap()[taskType] || "main";
    if (id === "main") return null;
    const found = meguminUtilityBackends().find(b => b && b.id === id);
    // A deleted backend falls back to main rather than failing the task.
    return found || null;
}

export function meguminSetTaskBackend(taskType, backendId) {
    const map = meguminUtilityTaskMap();
    if (!backendId || backendId === "main") delete map[taskType];
    else map[taskType] = backendId;
    saveSettingsDebounced();
}

export function meguminAddUtilityBackend({ name, endpointUrl, apiKey, model, temperature, maxTokens }) {
    const list = meguminUtilityBackends();
    const backend = {
        id: "ub_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: String(name || "").trim() || "Backend",
        endpointUrl: String(endpointUrl || "").trim().replace(/\/+$/, ""),
        apiKey: String(apiKey || ""),
        model: String(model || "").trim(),
        temperature: Number.isFinite(+temperature) ? +temperature : 0.8,
        maxTokens: Number.isFinite(+maxTokens) ? +maxTokens : 1024,
    };
    list.push(backend);
    saveSettingsDebounced();
    return backend;
}

export function meguminUpdateUtilityBackend(id, patch) {
    const b = meguminUtilityBackends().find(x => x && x.id === id);
    if (!b) return null;
    if (patch.name !== undefined) b.name = String(patch.name).trim() || b.name;
    if (patch.endpointUrl !== undefined) b.endpointUrl = String(patch.endpointUrl).trim().replace(/\/+$/, "");
    if (patch.apiKey !== undefined) b.apiKey = String(patch.apiKey);
    if (patch.model !== undefined) b.model = String(patch.model).trim();
    if (patch.temperature !== undefined && Number.isFinite(+patch.temperature)) b.temperature = +patch.temperature;
    if (patch.maxTokens !== undefined && Number.isFinite(+patch.maxTokens)) b.maxTokens = +patch.maxTokens;
    saveSettingsDebounced();
    return b;
}

export function meguminDeleteUtilityBackend(id) {
    const list = meguminUtilityBackends();
    const idx = list.findIndex(x => x && x.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    // Tasks pointing at the deleted backend go back to main, silently but
    // predictably — a missing backend must never strand a background task.
    const map = meguminUtilityTaskMap();
    Object.keys(map).forEach(task => { if (map[task] === id) delete map[task]; });
    saveSettingsDebounced();
    return true;
}

/** One line for the token-counter-style readout: which model a task will hit. */
export function meguminTaskBackendLabel(taskType) {
    const b = meguminTaskBackend(taskType);
    if (!b) return "Main API";
    return `${b.name} (${b.model || "no model set"})`;
}

// ── The direct path ──────────────────────────────────────────────────────────

/**
 * POST to the backend's /chat/completions. OpenAI-compatible shape covers
 * OpenRouter, local LLM servers (llama.cpp, Oobabooga, TabbyAPI), most cheap
 * fast APIs, and the "Custom (OpenAI-compatible)" entry in ST itself.
 *
 * Returns the assistant text. Throws on HTTP failure or a missing choice.
 */
export async function meguminDirectChat(backend, messages, { maxTokens, temperature } = {}) {
    if (!backend || !backend.endpointUrl) throw new Error("Utility backend has no endpoint URL");
    const url = backend.endpointUrl.replace(/\/+$/, "") + "/chat/completions";
    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(backend.apiKey ? { "Authorization": `Bearer ${backend.apiKey}` } : {}),
            },
            body: JSON.stringify({
                model: backend.model || undefined,
                messages,
                temperature: temperature !== undefined ? temperature : (backend.temperature !== undefined ? backend.temperature : 0.8),
                max_tokens: maxTokens !== undefined ? maxTokens : (backend.maxTokens !== undefined ? backend.maxTokens : 1024),
                stream: false,
            }),
        });
    } catch (e) {
        throw new Error(`Utility backend unreachable (${backend.name}): ${e.message}`);
    }
    if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(`Utility backend ${backend.name} returned ${res.status}: ${bodyText.slice(0, 300)}`);
    }
    const data = await res.json();
    const choice = data?.choices?.[0];
    const content = choice?.message?.content ?? choice?.text ?? "";
    if (typeof content !== "string" || !content.trim()) {
        throw new Error(`Utility backend ${backend.name} returned no text`);
    }
    return content;
}

// think-tag stripping, the same hygiene analyzeSlopDirectly has always applied
// to quiet-prompt output. Reasoning models leak a <think> block into the body;
// none of the background consumers want it.
export function meguminStripThink(text) {
    return String(text || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/**
 * The one entry point every feature calls.
 *
 * taskType  one of the UTILITY_TASKS ids.
 * messages  the request shape: [{role, content}] — built by taskPrompts.js on
 *           the direct path, or ignored here on the main path (the interceptor
 *           builds that prompt itself from the activeRequests marker).
 *
 * opts.quietPrompt — the { prompt: "___PS_...___" } payload for the main path.
 * opts.identity    — optional recheck callback for chat-switch race guards; not
 *                    used here directly, features keep their own stamps.
 */
export async function runUtilityGeneration(taskType, messages, opts = {}) {
    const backend = meguminTaskBackend(taskType);

    // ── Main path: exactly the current behaviour ─────────────────────────────
    if (!backend) {
        if (!opts.quietPrompt) throw new Error(`runUtilityGeneration("${taskType}"): main backend selected but no quietPrompt payload given`);
        const raw = await generateQuietPrompt(opts.quietPrompt);
        return { text: raw, via: "main" };
    }

    // ── Direct path: bypass ST entirely ──────────────────────────────────────
    // opts.maxTokens/opts.temperature ride through for one-off tasks that carry
    // their own settings (e.g. the cast generator); undefined falls back to the
    // backend's stored values.
    const raw = await meguminDirectChat(backend, messages, {
        maxTokens: opts.maxTokens,
        temperature: opts.temperature,
    });
    return { text: meguminStripThink(raw), via: "direct" };
}
