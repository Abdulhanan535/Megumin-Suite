// ────────────────────────────────────────────────────────────────────────────
// The prompt interceptor — the last thing to touch the messages before they go.
//
// Reads the in-flight request markers to decide which prompt shape to emit: the
// roleplay one, or one of the background tasks (planner, ban list, image prompt,
// NPC scan, memory summary). Everything it needs is already a module.
// ────────────────────────────────────────────────────────────────────────────

import { extension_settings, substituteParams, Popup, POPUP_TYPE } from "../st.js";
import { getContext } from "../st.js";
import { extensionName } from "../core/constants.js";
import { localProfile } from "../core/state.js";
import {
    activeStoryPlanRequest, activeBanListChat, activeImageGenRequest,
    activeNpcScanRequest, activeNpcPfpRequest, activeNpcUpdateRequest,
    activeMemorySummarizationRequest,
    activeGenerationOrder, isBackgroundGenerationActive,
    activeNpcImages, clearActiveNpcImages,
} from "../core/activeRequests.js";
import { DEFAULT_PROMPTS } from "../prompts/index.js";
import { memEnsureSemanticQueryFresh } from "../features/memory/vectordb.js";
import { escapeRegex } from "../utils/regex.js";
import { buildBaseDict } from "./buildBaseDict.js";
import { meguminAllSlotTriggers } from "../../data/slots.js";
import {
    buildStoryPlanMessages, buildNpcScanMessages, buildNpcUpdateMessages,
    buildBanListMessages, buildImageGenMessages, buildNpcPortraitMessages,
    buildMemorySummarizeMessages, meguminUtilityPrefillEnabled,
} from "./taskPrompts.js";

// Throttles the prompt-preview popup so token counting and rapid ST background
// triggers can't stack popups. Read and written only by the injection handler.
export let lastPromptPreviewTime = 0;

export async function handlePromptInjection(data, type) {
    const messages = data?.messages || data?.chat || (Array.isArray(data) ? data : null);
    if (!messages || !Array.isArray(messages)) return;
    // Opt IN, not opt out. The prefill breaks utility generations on Claude and
    // several other APIs, and the people it breaks for are the least likely to go
    // looking for a switch, so the safe state is the default. `!== true` also means
    // an install that has never seen the setting is off rather than on.
    // Read through the shared helper so the direct utility path (taskPrompts.js)
    // and this path can never disagree about the policy.
    const disablePrefill = !meguminUtilityPrefillEnabled();

    // --- INJECT STORY PLANNER PROMPT ---
    if (activeStoryPlanRequest) {
        messages.length = 0;
        // Message array built by the shared builder (taskPrompts.js) — the same
        // one the direct utility-backend path uses, so the two prompt shapes
        // cannot drift. Prefill appended per the Utility Prefills toggle.
        const built = buildStoryPlanMessages(activeStoryPlanRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }

        console.log(`[${extensionName}] 🎯 Injected Story Director array in memory.`);
        return;
    }

    // --- INJECT NPC SCAN PROMPT ---
    if (activeNpcScanRequest) {
        messages.length = 0;
        const built = buildNpcScanMessages(activeNpcScanRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        console.log(`[${extensionName}] 🎯 Injected NPC Scan array in memory.`);
        return;
    }

    // --- INJECT FORCED NPC UPDATE PROMPT ---
    // The refresh button on an NPC card. Unlike the in-story update, this asks
    // about ONE named NPC and hands over their whole record, so the model is
    // comparing against what is actually on file rather than recalling it.
    if (activeNpcUpdateRequest) {
        messages.length = 0;
        const built = buildNpcUpdateMessages(activeNpcUpdateRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        console.log(`[${extensionName}] 🎯 Injected forced NPC Update array in memory.`);
        return;
    }

    if (activeBanListChat) {
        messages.length = 0;
        const built = buildBanListMessages(activeBanListChat);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        return;
    }

    // --- INJECT IMAGE GEN PROMPT ---
    if (activeImageGenRequest) {
        messages.length = 0;
        const built = buildImageGenMessages(activeImageGenRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        console.log(`[${extensionName}] 🎯 Injected Image Gen array in memory.`);
        return;
    }

    // --- INJECT NPC PORTRAIT PROMPT ---
    if (activeNpcPfpRequest) {
        messages.length = 0;
        const built = buildNpcPortraitMessages(activeNpcPfpRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        console.log(`[${extensionName}] 🎯 Injected NPC Portrait Prompt array in memory.`);
        return;
    }

    // --- INJECT MEMORY SUMMARIZATION PROMPT ---
    if (activeMemorySummarizationRequest) {
        messages.length = 0;
        const built = buildMemorySummarizeMessages(activeMemorySummarizationRequest);
        messages.push(...built.messages);
        if (!disablePrefill) {
            messages.push({ "role": "assistant", "content": built.prefill });
        }
        console.log(`[${extensionName}] 🎯 Injected Memory Summarization array in memory.`);
        return;
    }

    if (activeGenerationOrder) {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].content && typeof messages[i].content === 'string') {
                if (messages[i].content.includes("___PS_DUMMY___")) { messages.splice(i, 1); continue; }
                if (messages[i].content.includes("[[order]]")) messages[i].content = messages[i].content.replace(/\[\[order\]\]/g, activeGenerationOrder);
            }
        }
    }

    if (!localProfile) return;

    // Semantic memory retrieval is a network call fired on a debounce, so without
    // waiting here the prompt can be assembled from the previous turn's matches.
    // No-ops unless the search text actually changed, so swipes and regenerations
    // do not pay for it. Only on the real generation path — the token counter and
    // the prompt preview call buildBaseDict(true) and never reach this line.
    try { await memEnsureSemanticQueryFresh(); } catch (e) {
        console.warn("[Megumin Suite] Semantic refresh before prompt build failed; using what is in hand.", e);
    }

    const dict = buildBaseDict();

    if (localProfile.devOverrides) {
        Object.keys(localProfile.devOverrides).forEach(key => { if (dict[key] !== undefined) dict[key] = localProfile.devOverrides[key]; });
    }

    // --- THE ENVELOPE IS THE ONLY WAY IN ---
    // [[blocks]] carries every tracker block now. The per-block anchors are
    // blanked unconditionally: leaving them populated would emit each block
    // twice, once loose and once wrapped. A preset that has not been given a
    // [[blocks]] anchor emits no blocks at all, which is the intended, visible
    // failure rather than a silent fallback to a format nothing renders.
    //
    // [[npc_dossier]] is deliberately NOT blanked: it is the dossier RULES, not
    // the block, and the envelope's slot line refers back to them.
    ["[[infoblock]]", "[[infoblock2]]", "[[npc_inner_chatter]]", "[[npc_inner_chatter2]]",
        "[[storytracker]]", "[[storytracker2]]", "[[npc_dossier2]]",
        "[[sceneInfo]]", "[[sceneInfo2]]", "[[roster]]", "[[roster2]]",
        "[[checks]]", "[[checks2]]", "[[quests]]", "[[quests2]]",
        "[[morale]]", "[[morale2]]", "[[worldEvent]]", "[[worldEvent2]]",
        "[[seeds]]", "[[seeds2]]", "[[gmNotebook]]", "[[gmNotebook2]]",
        "[[charState]]", "[[charState2]]", "[[npcMind]]", "[[npcMind2]]"].forEach(t => { dict[t] = ""; });

    let replacementsMade = 0;
    for (const msg of messages) {
        if (msg.content && typeof msg.content === 'string') {
            Object.entries(dict).forEach(([trigger, replacement]) => {
                if (msg.content.includes(trigger)) {
                    const processed = typeof substituteParams === 'function' ? substituteParams(replacement) : replacement;

                    // If the replacement is empty, remove the tag AND the empty line it sits on
                    if (processed.trim() === "") {
                        msg.content = msg.content.replace(new RegExp(`^[ \\t]*${escapeRegex(trigger)}[ \\t]*\\r?\\n?`, 'gm'), "");
                    }

                    // Standard replacement for everything else
                    msg.content = msg.content.replace(new RegExp(escapeRegex(trigger), 'g'), processed);
                    replacementsMade++;
                }
            });

            // Cleanup unused tags (removes the tag AND the line break it sits on).
            //
            // This was a 60-string array written out by hand, and it was the third
            // copy of the placeholder list. It is the one whose failure is worst:
            // a tag missing from here does not blank, it leaks a literal
            // "[[whatever]]" straight into the model's context. Derived from
            // MEGUMIN_SLOT_REGISTRY now, so a new slot cannot be forgotten here.
            meguminAllSlotTriggers().forEach(tr => {
                    if (msg.content.includes(tr)) {
                    msg.content = msg.content.replace(new RegExp(`^[ \\t]*${escapeRegex(tr)}[ \\t]*\\r?\\n?`, 'gm'), "");
                    msg.content = msg.content.replace(new RegExp(escapeRegex(tr), 'g'), ""); // Catch-all for inline tags
                }
            });

            // Cleanup Inline Image Artifacts so the AI doesn't see raw HTML
            msg.content = msg.content.replace(/<img[^>]*?alt=["']KazumaInline["'][^>]*?>/gi, "");
            msg.content = msg.content.replace(/<div[^>]*?title=["']KazumaFail\|[^>]*?>.*?<\/div>/gi, "");
            
            // Comprehensive Image Block Cleanup
            msg.content = msg.content.replace(/<img\s+[^>]*\/>|<div class="kazuma-img-placeholder"[^>]*>[\s\S]*?<\/div>|<!-- kazuma-inline-start:[^>]*-->[\s\S]*?<!-- kazuma-inline-end:[^>]*-->/gi, "");

            // Final Sweep: Collapse 3 or more blank lines into a standard double line break
            msg.content = msg.content.replace(/(?:\r?\n[ \t]*){3,}/g, '\n\n');
        }
    }

    // --- INJECT NPC PORTRAITS AS MULTIMODAL IMAGES ---
    if (activeNpcImages && activeNpcImages.length > 0) {
        // Find the message that contains the NPC list text and convert to multimodal
        for (const msg of messages) {
            if (msg.content && typeof msg.content === 'string' && msg.content.includes('[RELEVANT NPCs]')) {
                const parts = [{ type: "text", text: msg.content }];
                activeNpcImages.forEach(img => {
                    parts.push({ type: "text", text: `[Portrait of ${img.name}]` });
                    parts.push({ type: "image_url", image_url: { url: img.base64, detail: "low" } });
                });
                msg.content = parts;
                break;
            }
        }
        clearActiveNpcImages();
    }

    if (replacementsMade > 0 && !activeGenerationOrder) {
        console.log(`[${extensionName}] ✅ Executed ${replacementsMade} block replacements.`);
    }

    // --- PROMPT PREVIEW ---
    const isBackgroundGen = isBackgroundGenerationActive();

    // Prevent double-popups from Token Counting or rapid ST background triggers
    const now = Date.now();
    const isSpam = (now - lastPromptPreviewTime) < 2000;
    
    // FIX: ST executes "Dry Runs" whenever you change a chat or tweak a setting to recalculate token limits.
    // We must ignore these so the preview doesn't pop up randomly!
    const isSilentOrDry = type === "count" || type === "quiet" || type === "dry" || type === "dryRun" || data?.dryRun === true || data?.dry === true;

    if (extension_settings[extensionName]?.globalSettings?.promptPreview && !isBackgroundGen && !isSilentOrDry && !isSpam) {
        lastPromptPreviewTime = now; // Lock it immediately

        let promptString = "";
        messages.forEach(m => {
            let contentStr = "";
            if (typeof m.content === "string") contentStr = m.content;
            else if (Array.isArray(m.content)) {
                // Handle multimodal image data safely
                contentStr = m.content.map(c => c.type === "text" ? c.text : "[BASE64 IMAGE DATA]").join("\n");
            }
            promptString += `========== [ ${m.role.toUpperCase()} ] ==========\n${contentStr}\n\n`;
        });

        const $content = $(`
            <div style="display:flex; flex-direction:column; gap:10px; font-family: 'Inter', sans-serif;">
                <div style="font-size: 0.85rem; color: var(--text-muted);">This is the exact payload being sent to the AI API.</div>
                <textarea class="ps-modern-input" readonly style="height: 450px; resize: vertical; font-family: monospace; font-size: 0.75rem; padding: 10px; white-space: pre-wrap; background: rgba(0,0,0,0.5);"></textarea>
            </div>
        `);
        $content.find("textarea").val(promptString);

        const { Popup, POPUP_TYPE } = typeof getContext === "function" ? getContext() : window;
        const popup = new Popup($content, POPUP_TYPE.CONFIRM, "Prompt Payload Preview", { okButton: "Send to AI", cancelButton: "Cancel", wide: true, large: true });

        const confirmed = await popup.show();

        if (!confirmed) {
            messages.length = 0; // Empty the payload
            toastr.info("Generation cancelled by user.");
            
            // FIX: Explicitly tell SillyTavern to abort to prevent Auto-Retry loops
            if (typeof window.stopGeneration === 'function') {
                window.stopGeneration();
            }
            // Fallback: visually click the stop buttons just in case
            setTimeout(() => {
                $("#mes_stop").trigger("click");
                $("#send_but_sheld").trigger("click");
            }, 10);
            
            return;
        }
    }
}
