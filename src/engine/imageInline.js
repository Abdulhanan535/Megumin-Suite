// ─────────────────────────────────────────────────────────────────────────────
// Side-model inline images ("Inline Prompt Writer").
//
// The old inline flow makes the MAIN model write <img prompt="..."> inside its
// reply — hundreds of tokens per visual turn on a slow API, and the main model
// may be weak at Booru tags. This module flips the job to the utility backend:
//
//   Main model mode (default): unchanged. The reply carries the tag, the
//   MESSAGE_RECEIVED handler in index.js finds it and renders.
//
//   Side model mode: the main model writes NO tags — buildBaseDict swaps the
//   [[img1]] rules for a lighter variant that omits the tag-writing instruction
//   — and on each qualifying AI reply this module asks the fast backend to
//   write the image prompt, injects it into the message, and hands it to
//   ComfyUI exactly like a main-model tag would have been.
//
// Task type: "imageInline" in the per-task backend picker.
// ─────────────────────────────────────────────────────────────────────────────

import { getContext, saveChat, updateMessageBlock, reloadCurrentChat } from "../st.js";
import { localProfile } from "../core/state.js";
import { meguminActiveDataIdentity } from "../core/keys.js";
import { runUtilityGeneration, meguminTaskBackend, meguminStripThink } from "./utility.js";
import { buildImageGenMessages } from "./taskPrompts.js";
import { meguminCleanChatHistoryText } from "./chatText.js";
import { getRelevantNpcImageTags } from "../features/npc/data.js";
import { igGenerateWithComfy } from "../features/imagegen/index.js";
import { DEFAULT_PROMPTS } from "../prompts/index.js";

// The tag-writing instruction the lighter variant must NOT carry. Same regex
// family the main handler uses to find real tags, reused to tell a main-model
// tag from a bare marker.
const FULL_TAG_RE = /<img[^>]*?prompt=(["']?)([\s\S]*?)(?:\1\s*\/?>|\1\s*>|\1\s+[a-zA-Z]+=| \/>|>|$)/i;

/** Is side-model inline writing switched on? */
export function meguminInlineWriterEnabled() {
    const ig = localProfile?.imageGen;
    return Boolean(ig && ig.enabled && ig.inlineWriter === "side");
}

/** Does this AI reply qualify for a side-model prompt under the current trigger? */
export function meguminInlineShouldTrigger(lastMsg, chat) {
    const ig = localProfile?.imageGen;
    if (!ig) return false;
    const mode = ig.inlineTriggerMode || "always";
    if (mode === "always") return true;
    if (mode === "marker") {
        // A bare <img> with no prompt attribute — the main model's way of saying
        // "a picture goes here" without paying for the tag itself.
        return /<img(?![^>]*prompt=)[^>]*>/i.test(lastMsg.mes || "");
    }
    if (mode === "frequency") {
        const aiMsgCount = chat.filter(m => !m.is_user && !m.is_system).length;
        const freq = parseInt(ig.autoGenFreq) || 1;
        return aiMsgCount > 0 && aiMsgCount % freq === 0;
    }
    return false;
}

/**
 * The lighter [[img1]] variant: everything the normal injection carries EXCEPT
 * the instruction to write the tag. Sent to the main model so it still knows an
 * image may appear and can style the scene toward it, without spending its own
 * tokens on the tag.
 */
export function meguminInlineLighterImg1({ conditionalText, templateRules, extraSection, directLangStr, npcTagsStr, templateExamples }) {
    return `### IMAGE ILLUSTRATION (handled by a second model):
An image prompt for this scene is written by a separate model after your reply. Do NOT write any <img> tag yourself — do not mention image tags in your reply.
${conditionalText || ""}${templateRules || ""}

${extraSection || ""}

${directLangStr || ""}

${npcTagsStr || ""}

${templateExamples || ""}`.trim();
}

/**
 * Build the side-model request from the same ingredients generateImagePromptText
 * assembles (last 5 AI messages cleaned, template rules + examples, NPC tags,
 * direct-language block), then call the per-task backend.
 * Returns the prompt text, or null when the backend declined/failed.
 */
export async function meguminWriteInlinePrompt() {
    const ig = localProfile?.imageGen;
    if (!ig) return null;

    const chat = getContext().chat || [];
    const lastMessages = chat.filter(m => !m.is_user && !m.is_system).slice(-5).map(m => {
        return `${m.name}: ${meguminCleanChatHistoryText(m.mes)}`;
    }).join("\n\n");

    const customIg = ig.customPromptsEnabled ? (ig.customPrompts || {}) : {};
    const defIg = DEFAULT_PROMPTS.imageGen;

    let rules = "", examples = "";
    const tmpl = ig.promptTemplate || "illus_cinematic";
    const map = {
        "illus_pov": ["rulesIllusPov", "examplesIllusPov"],
        "sdxl_pov": ["rulesSdxlPov", "examplesSdxlPov"],
        "illus_cinematic": ["rulesIllusCinematic", "examplesIllusCinematic"],
        "sdxl_cinematic": ["rulesSdxlCinematic", "examplesSdxlCinematic"],
        "illus_portrait": ["rulesIllusPortrait", "examplesIllusPortrait"],
        "sdxl_portrait": ["rulesSdxlPortrait", "examplesSdxlPortrait"]
    };
    const keys = map[tmpl];
    if (keys) {
        rules = customIg[keys[0]] || defIg[keys[0]];
        examples = customIg[keys[1]] || defIg[keys[1]];
    }
    if (!ig.includeExamples) examples = "";

    let directLangStr = ig.directLanguage ? "**DIRECT LANGUAGE:** Use exact Booru tags only. \"naked\" not \"wearing nothing.\" \"erection\" not \"visible arousal.\"\n\n**NSFW TAG REFERENCE (use when scene is explicit):**\nBody: naked, nude, topless, exposed nipples, small breasts, medium breasts, large breasts, spread legs, ass, erection, veins, veiny penis\nActions: hetero, sex, vaginal, anal, oral, fellatio, after fellatio, paizuri, straddling, riding, missionary, doggystyle, cowgirl position, moaning, open mouth, tongue out, ahegao, clenching teeth\nFluids: cum, cum on body, cum on breasts, cum on face, cum on hair, cum in mouth, cum inside, ejaculation, facial, saliva, sweat\nState: flushed face, heavy breathing, trembling, crying with eyes open, half-closed eyes, solo focus" : "";
    let npcTagsStr = getRelevantNpcImageTags();

    const built = buildImageGenMessages({
        chatText: lastMessages,
        templateRules: rules,
        templateExamples: examples,
        extraStr: ig.promptExtra || "",
        directLanguageStr: directLangStr,
        npcTagsStr: npcTagsStr
    });

    const { text } = await runUtilityGeneration("imageInline", built.messages);
    return meguminStripThink(text);
}

/**
 * MESSAGE_RECEIVED hook. Runs AFTER index.js's own tag-finding handler: a
 * reply the main model already tagged is left entirely alone.
 */
export async function meguminHandleInlineWriter() {
    const ig = localProfile?.imageGen;
    if (!ig || !ig.enabled || ig.inlineWriter !== "side") return;
    if (!meguminTaskBackend("imageInline")) return; // side mode needs a direct backend

    const chat = getContext().chat;
    if (!chat || !chat.length) return;
    const lastMsg = chat[chat.length - 1];
    if (lastMsg.is_user || lastMsg.is_system) return;

    // 1. Main model wrote a real tag → existing handling, no double generation.
    const lastThinkEnd = (lastMsg.mes || "").lastIndexOf("</think>");
    const matches = [...(lastMsg.mes || "").matchAll(new RegExp(FULL_TAG_RE.source, "gi"))]
        .filter(m => m.index > lastThinkEnd);
    if (matches.length > 0) return;

    // 2. Trigger gate.
    if (!meguminInlineShouldTrigger(lastMsg, chat)) return;

    // 3. Stamp BEFORE the await; the write below is refused if the chat moved.
    const identity = meguminActiveDataIdentity();

    let promptText;
    try {
        promptText = await meguminWriteInlinePrompt();
    } catch (e) {
        console.error("[Megumin-Suite] Inline image prompt generation failed:", e);
        toastr.error("Inline image prompt failed on the utility backend.");
        return;
    }
    if (!promptText || promptText.length < 5) return;

    // Chat switched while the fast model was writing → discard, never inject
    // into a message that now belongs to another chat's view.
    if (meguminActiveDataIdentity() !== identity) {
        console.debug(`[Megumin-Suite] Inline image prompt discarded: requested in "${identity}" but "${meguminActiveDataIdentity()}" is active now.`);
        return;
    }

    // 4. Inject the placeholder the way the main handler does: replace a bare
    //    <img> marker if the trigger was "marker", else append at the end.
    const msgIndex = chat.length - 1;
    const injectMode = ig.injectMode || "new_msg";
    const batchId = Date.now();
    const placeholderId = `kazuma-img-${batchId}-0`;
    const placeholder = `<div id="${placeholderId}" class="kazuma-img-placeholder" style="color:var(--gold); font-style: italic; margin: 10px 0;">[Generating Image...]</div>`;

    let modifiedMes = lastMsg.mes || "";
    const bareMarker = /<img(?![^>]*prompt=)[^>]*>/i.exec(modifiedMes);
    if (bareMarker) {
        modifiedMes = modifiedMes.substring(0, bareMarker.index) + placeholder + modifiedMes.substring(bareMarker.index + bareMarker[0].length);
    } else if (injectMode === "inline") {
        modifiedMes = modifiedMes + "\n" + placeholder;
    } else {
        // gallery/new_msg mode: the tag is consumed out of the message; ComfyUI
        // attaches the finished image to the message itself. Keep the message
        // text untouched and just render.
        lastMsg.mes = lastMsg.mes; // unchanged
    }

    if (modifiedMes !== lastMsg.mes) {
        lastMsg.mes = modifiedMes.trim();
        try { await saveChat(); } catch (e) { console.warn("[Megumin-Suite] inline saveChat failed:", e); }
        setTimeout(() => {
            if (typeof SillyTavern !== "undefined" && SillyTavern.getContext && typeof SillyTavern.getContext().updateMessageBlock === "function") {
                SillyTavern.getContext().updateMessageBlock(msgIndex, lastMsg);
            } else if (typeof updateMessageBlock === "function") {
                updateMessageBlock(msgIndex, lastMsg);
            } else {
                reloadCurrentChat();
            }
        }, 100);
    }

    // 5. Hand to ComfyUI with the same shape the main handler uses.
    toastr.info("Side model wrote the image prompt. Sending to ComfyUI...");
    igGenerateWithComfy(promptText, {
        message: lastMsg,
        index: msgIndex,
        mode: injectMode,
        isInlineAuto: true,
        placeholderId: bareMarker || injectMode === "inline" ? placeholderId : undefined
    });
}
