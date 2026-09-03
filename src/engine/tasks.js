// ──────────────────────────────────────────────────────────────────────────────
// Running a one-off generation through SillyTavern.
//
// The pattern throughout: park a payload in activeRequests, fire a quiet prompt
// that the injection handler recognises, clear the payload in a finally.
// useMeguminEngine additionally swaps the OpenAI preset for the duration and puts
// it back, so a background task can use a different preset than the roleplay.
//
// Since the utility backend system (engine/utility.js), each task first checks
// its per-task backend: a configured direct backend bypasses the interceptor
// entirely, calls the endpoint itself, and never touches the preset.
// ──────────────────────────────────────────────────────────────────────────────

import { generateQuietPrompt } from "../st.js";
import { extensionName, TARGET_PRESET_NAME } from "../core/constants.js";
import { setActiveBanListChat, setActiveGenerationOrder } from "../core/activeRequests.js";
import { runUtilityGeneration, meguminStripThink } from "./utility.js";
import { buildBanListMessages, meguminUtilityPrefillEnabled } from "./taskPrompts.js";

export async function analyzeSlopDirectly(chatText) {
    const built = buildBanListMessages(chatText);
    const messages = meguminUtilityPrefillEnabled() && built.prefill
        ? [...built.messages, { role: "assistant", content: built.prefill }]
        : built.messages;

    const { text } = await runUtilityGeneration("banList", messages, { quietPrompt: { prompt: "___PS_BANLIST___" } });
    return meguminStripThink(text);
}

export async function analyzeSlopWithPreset(chatText) {
    let result = null;
    await useMeguminEngine(async () => {
        // We still use the interceptor! This just makes the engine switch first.
        result = await analyzeSlopDirectly(chatText);
    });
    return result;
}

export async function useMeguminEngine(task, targetPreset = TARGET_PRESET_NAME) { // Added parameter with default value
    const selector = $("#settings_preset_openai");
    const option = selector.find(`option`).filter(function () { return $(this).text().trim() === targetPreset; }); // Use the new parameter
    let originalValue = null;

    if (option.length) {
        originalValue = selector.val();
        selector.val(option.val()).trigger("change");
        toastr.info(`Switched to ${targetPreset} preset... Please wait.`);
        await new Promise(r => setTimeout(r, 3000));
    } else {
        toastr.error(`"${targetPreset}" not found in OpenAI presets.`);
        return;
    }

    try {
        await task();
    } catch (e) {
        console.error(`[${extensionName}] AI Error:`, e);
    } finally {
        await new Promise(r => setTimeout(r, 500));
        selector.val(originalValue).trigger("change");
    }
}

export async function runMeguminTask(orderText) {
    setActiveGenerationOrder(orderText);
    try {
        return await generateQuietPrompt({ prompt: "___PS_DUMMY___" });
    } finally {
        setActiveGenerationOrder(null);
    }
}
