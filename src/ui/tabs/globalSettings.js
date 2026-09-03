// ────────────────────────────────────────────────────────────────────────────
// Global Settings — extension preferences, community links and about.
// ────────────────────────────────────────────────────────────────────────────

import { extension_settings, saveSettingsDebounced, Popup, POPUP_TYPE } from "../../st.js";
import { extensionName } from "../../core/constants.js";
import { localProfile } from "../../core/state.js";
import { initProfile, saveProfileToMemory } from "../../core/profile.js";
import { flushProfileSettingsToLoadedKey, _saveProfileDebouncedInner } from "../../core/profile.js";
import { cancelDebounce } from "../../st.js";
import { escapeHtmlAttr } from "../../utils/html.js";
import {
    UTILITY_TASKS_ACTIVE, meguminUtilityBackends, meguminUtilityTaskMap,
    meguminAddUtilityBackend, meguminUpdateUtilityBackend, meguminDeleteUtilityBackend,
    meguminSetTaskBackend,
} from "../../engine/utility.js";

// The version on the about card. One place, so it cannot fall out of step with
// itself the way "v9" did once V10 shipped.
const SUITE_VERSION = "V10";

// Where the "send Kazuma something" button points. Tally rather than Google Forms
// for one reason: Google makes anyone uploading a file sign in and records their
// address, which would quietly undo the word "anonymous" two lines down in the card.
//
// Blank it to remove the whole section -- it is skipped rather than drawn dead.
const SUBMIT_FORM_URL = "https://tally.so/r/D46yNq";

// The dot on the gear in the dock. Named rather than a bare boolean so a future
// notice is one string change here: bump the id and every install shows the dot
// again, without a migration and without a second flag to remember.
//
// Spent the moment the tab is drawn -- nobody should have to hunt for what the
// dot meant, and a dot that outlives its errand is just noise on the icon.
const SETTINGS_NOTICE_ID = "submit-card-v10";

export function hasUnseenSettingsNotice() {
    if (!SUBMIT_FORM_URL) return false;
    const gs = extension_settings[extensionName] && extension_settings[extensionName].globalSettings;
    return Boolean(gs) && gs.settingsNoticeSeen !== SETTINGS_NOTICE_ID;
}

export function renderGlobalSettings(c) {
    c.empty();
    const gs = extension_settings[extensionName].globalSettings;

    // Opening the tab is what spends the notice. Cleared off the dock here rather
    // than waiting for the next switchTab, which would leave the dot lit while the
    // reader is already looking at the thing it was pointing to.
    if (hasUnseenSettingsNotice()) {
        gs.settingsNoticeSeen = SETTINGS_NOTICE_ID;
        saveSettingsDebounced();
        $(".dock-icon.has-notice").removeClass("has-notice");
    }

    c.append(`
        <div class="mtab-header">
            <div class="mtab-header-left">
                <div class="mtab-header-icon" style="background: linear-gradient(135deg, #64748b, #475569);">
                    <i class="fa-solid fa-gear"></i>
                </div>
                <div>
                    <h2>Global Settings</h2>
                    <p>Preferences that apply to every character and every chat.</p>
                </div>
            </div>
            <div class="mtab-header-badge" style="background: rgba(168,85,247,0.12); color: #a855f7; border: 1px solid rgba(168,85,247,0.25);">
                <i class="fa-solid fa-earth-americas" style="font-size:0.6rem;"></i> Saved globally
            </div>
        </div>
    `);

    const $content = $(`<div style="display:flex; flex-direction:column; gap:10px;"></div>`);

    // ── BEHAVIOUR ───────────────────────────────────────────────────────────
    $content.append(`<div class="wstyle-section-head blue"><i class="fa-solid fa-sliders"></i> Behaviour</div>`);
    $content.append(`
        <div class="mtab-toggle-row ${gs.promptPreview ? 'active' : ''}" id="gs_toggle_prompt_preview" style="cursor: pointer;">
            <div class="toggle-info">
                <div class="toggle-label"><i class="fa-solid fa-magnifying-glass" style="color: var(--gold);"></i> Prompt Payload Preview</div>
                <div class="toggle-desc">Shows the finished prompt in a popup before it is sent, so you can read exactly what the AI receives. Cancelling the popup stops the generation.</div>
            </div>
            <div class="ps-switch" style="${gs.promptPreview ? 'background: var(--gold);' : ''}"></div>
        </div>
    `);
    $content.append(`
        <div class="mtab-toggle-row ${gs.enableUtilityPrefill ? 'active' : ''}" id="gs_toggle_utility_prefill" style="cursor: pointer;">
            <div class="toggle-info">
                <div class="toggle-label"><i class="fa-solid fa-wand-sparkles" style="color: #10b981;"></i> Utility Prefills</div>
                <div class="toggle-desc">Puts an opening &lt;think&gt; into the AI's mouth for background jobs — Image Gen, the Ban List, the Story Director, NPC scans. <b>Off by default:</b> Claude and several other APIs reject a prefill outright. Turn it on only if yours accepts one.</div>
            </div>
            <div class="ps-switch" style="${gs.enableUtilityPrefill ? 'background: #10b981;' : ''}"></div>
        </div>
    `);

    // ── DATA ────────────────────────────────────────────────────────────────
    $content.append(`<div class="wstyle-section-head gold" style="margin-top:8px;"><i class="fa-solid fa-floppy-disk"></i> Data</div>`);
    $content.append(`
        <div class="mtab-panel" style="margin: 0; padding: 12px 16px;">
            <div class="mtab-setting-row" style="padding: 0; border: none;">
                <div class="set-info">
                    <div class="set-label"><i class="fa-solid fa-floppy-disk" style="color: var(--gold);"></i> Profile Save Mode</div>
                    <div class="set-desc"><b>Per Character</b> shares your settings across every chat with that character. <b>Per Chat</b> keeps each chat and each branch on its own settings.</div>
                </div>
                <select id="gs_save_mode" class="ps-modern-input" style="width: 180px; cursor: pointer;">
                    <option value="character" ${gs.saveMode === 'character' ? 'selected' : ''}>Per Character (Default)</option>
                    <option value="chat" ${gs.saveMode === 'chat' ? 'selected' : ''}>Per Chat</option>
                </select>
            </div>
        </div>
    `);

    // ── SEND KAZUMA A CARD ──────────────────────────────────────────────────
    // Skipped entirely while the URL is blank. A button that goes nowhere is
    // worse than no button at all.
    if (SUBMIT_FORM_URL) {
        $content.append(`<div class="wstyle-section-head purple" style="margin-top:8px;"><i class="fa-solid fa-paper-plane"></i> Send me a card</div>`);
        $content.append(`
            <div class="mtab-panel gs-submit" style="margin: 0;">
                <div class="gs-submit-body">
                    <div class="gs-submit-icon"><i class="fa-solid fa-inbox"></i></div>
                    <div>
                        <div class="gs-submit-title">Got a card or a scenario worth playing?</div>
                        <div class="gs-submit-text">I have been running out of things to roleplay, so I am collecting recommendations. Attach a character card, describe a scenario, or just drop a link to something you enjoyed. <b>Completely anonymous</b> — no sign-in, no name, nothing tying it back to you. I cannot reply, so say everything you want to say in the form.</div>
                    </div>
                </div>
                <a class="gs-submit-btn" href="${SUBMIT_FORM_URL}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open the form
                </a>
                <div class="gs-submit-note">Opens tally.so in your browser, outside SillyTavern.</div>
            </div>
        `);
    }

    // ── ABOUT ───────────────────────────────────────────────────────────────
    $content.append(`<div class="wstyle-section-head green" style="margin-top:8px;"><i class="fa-solid fa-circle-info"></i> About</div>`);
    $content.append(`
        <div class="mtab-panel gs-about" style="margin: 0;">
            <div class="gs-about-title">Megumin Suite ${SUITE_VERSION}</div>
            <div class="gs-about-by">Made by KazumaONIISAN</div>

            <div class="gs-link-grid">
                <a class="gs-link" href="https://github.com/Arif-salah/Megumin-Suite" target="_blank" rel="noopener noreferrer">
                    <i class="fa-brands fa-github"></i>
                    <span><b>GitHub</b><small>Source, issues and releases</small></span>
                </a>
                <div class="gs-link gs-link-static">
                    <i class="fa-brands fa-paypal" style="color:#3b82f6;"></i>
                    <span><b>PayPal</b><small>arifsalah10@gmail.com</small></span>
                </div>
                <div class="gs-link gs-link-static">
                    <i class="fa-solid fa-coins" style="color:#a1a1aa;"></i>
                    <span><b>Litecoin</b><small>LSjf1DczHxs3GEbkoMmi1UWH2GikmXDtis</small></span>
                </div>
            </div>
        </div>
    `);

    // ── UTILITY BACKENDS ────────────────────────────────────────────────────
    // Direct API endpoints background tasks can use instead of the main
    // connection. Global on purpose: API keys must never ride tab sync or
    // chat-level profiles. Each of the suite's background tasks picks its own
    // backend below — "Main API" is the default and changes nothing.
    const backends = meguminUtilityBackends();
    const taskMap = meguminUtilityTaskMap();

    $content.append(`<div class="wstyle-section-head gold" style="margin-top:8px;"><i class="fa-solid fa-bolt"></i> Utility Backends</div>`);
    $content.append(`
        <div class="mtab-callout" style="margin-bottom:10px;">
            <i class="fa-solid fa-circle-info"></i>
            <span>Fast/cheap OpenAI-compatible endpoints for <b>background work</b> (memory, NPC bank, Story Director, Ban List, image prompts). The main roleplay connection is never touched. Any OpenAI-compatible URL works — OpenRouter, a local LLM server, etc.</span>
        </div>
    `);

    const $backendList = $(`<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;" id="gs_ub_list"></div>`);
    const renderBackendRow = (b) => `
        <div class="mtab-panel" style="margin:0; padding:10px 14px;" data-ubid="${b.id}">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);"><i class="fa-solid fa-server" style="color:var(--gold); margin-right:6px;"></i>${escapeHtmlAttr(b.name)}</div>
                <div style="display:flex; gap:6px;">
                    <button class="ps-modern-btn secondary gs_ub_edit" data-ubid="${b.id}" style="padding:4px 10px; font-size:0.7rem;"><i class="fa-solid fa-pen"></i></button>
                    <button class="ps-modern-btn secondary gs_ub_del" data-ubid="${b.id}" style="padding:4px 10px; font-size:0.7rem; color:#ef4444; border-color:rgba(239,68,68,0.3);"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted); word-break:break-all;">
                <i class="fa-solid fa-link" style="opacity:0.6;"></i> ${escapeHtmlAttr(b.endpointUrl || "no url")}<br>
                <i class="fa-solid fa-microchip" style="opacity:0.6;"></i> ${escapeHtmlAttr(b.model || "no model")} · temp ${b.temperature} · max ${b.maxTokens}
            </div>
        </div>`;
    const redrawBackendList = () => {
        $backendList.empty();
        const list = meguminUtilityBackends();
        if (!list.length) {
            $backendList.append(`<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">No backends configured — every task runs on the Main API.</div>`);
        } else {
            list.forEach(b => $backendList.append(renderBackendRow(b)));
        }
        redrawTaskPickers();
    };

    // The per-task backend pickers. One select per task; "main" = current behavior.
    const $taskPickers = $(`<div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;" id="gs_ub_tasks"></div>`);
    const redrawTaskPickers = () => {
        $taskPickers.empty();
        const list = meguminUtilityBackends();
        UTILITY_TASKS_ACTIVE.forEach(t => {
            const current = meguminUtilityTaskMap()[t.id] || "main";
            const options = [`<option value="main" ${current === "main" ? "selected" : ""}>Main API (default)</option>`]
                .concat(list.map(b => `<option value="${b.id}" ${current === b.id ? "selected" : ""}>${escapeHtmlAttr(b.name)}</option>`));
            $taskPickers.append(`
                <div class="mtab-setting-row" style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
                    <div class="set-info"><div class="set-label" style="font-size:0.78rem;">${t.label}</div></div>
                    <select class="ps-modern-input gs_ub_task" data-task="${t.id}" style="width:170px; padding:6px 10px; font-size:0.75rem; cursor:pointer;">${options.join("")}</select>
                </div>`);
        });
    };

    $content.append($backendList);
    $content.append(`
        <div class="mtab-btn-row" style="margin-bottom:12px;">
            <button id="gs_ub_add" class="ps-modern-btn secondary" style="font-size:0.72rem;"><i class="fa-solid fa-plus"></i> Add Backend</button>
        </div>
    `);
    $content.append(`<div class="ps-rule-title" style="margin:4px 0 8px;">Which task uses which backend</div>`);
    $content.append($taskPickers);

    const backendEditorPopup = (existing) => new Promise(resolve => {
        const isEdit = Boolean(existing);
        const $popup = $(`
            <div style="display:flex; flex-direction:column; gap:10px; font-family:'Inter',sans-serif; text-align:left;">
                <label style="font-size:0.75rem; font-weight:700;">Name<br><input id="ub_name" class="ps-modern-input" value="${isEdit ? escapeHtmlAttr(existing.name) : ""}" placeholder="e.g. Fast 80t/s"></label>
                <label style="font-size:0.75rem; font-weight:700;">Endpoint URL (OpenAI-compatible, no /v1 needed)<br><input id="ub_url" class="ps-modern-input" value="${isEdit ? escapeHtmlAttr(existing.endpointUrl) : ""}" placeholder="https://openrouter.ai/api/v1"></label>
                <label style="font-size:0.75rem; font-weight:700;">API Key<br><input id="ub_key" class="ps-modern-input" type="password" value="${isEdit ? escapeHtmlAttr(existing.apiKey) : ""}" placeholder="sk-..."></label>
                <label style="font-size:0.75rem; font-weight:700;">Model<br><input id="ub_model" class="ps-modern-input" value="${isEdit ? escapeHtmlAttr(existing.model) : ""}" placeholder="e.g. meta-llama/llama-3.1-8b-instruct"></label>
                <div style="display:flex; gap:10px;">
                    <label style="flex:1; font-size:0.75rem; font-weight:700;">Temperature<br><input id="ub_temp" class="ps-modern-input" type="number" step="0.1" min="0" max="2" value="${isEdit ? existing.temperature : 0.8}"></label>
                    <label style="flex:1; font-size:0.75rem; font-weight:700;">Max Tokens<br><input id="ub_maxtok" class="ps-modern-input" type="number" step="128" min="64" max="32768" value="${isEdit ? existing.maxTokens : 1024}"></label>
                </div>
                <div style="font-size:0.7rem; color:var(--text-muted);">Stored globally in this browser's SillyTavern settings. Never synced, never exported with profiles.</div>
            </div>`);
        const popup = new Popup($popup, POPUP_TYPE.CONFIRM, isEdit ? "Edit Utility Backend" : "Add Utility Backend", { okButton: "Save", cancelButton: "Cancel", wide: true });
        popup.show().then(confirmed => {
            if (!confirmed) return resolve(null);
            resolve({
                name: $popup.find("#ub_name").val(),
                endpointUrl: $popup.find("#ub_url").val(),
                apiKey: $popup.find("#ub_key").val(),
                model: $popup.find("#ub_model").val(),
                temperature: $popup.find("#ub_temp").val(),
                maxTokens: $popup.find("#ub_maxtok").val(),
            });
        });
    });

    $content.find("#gs_ub_add").on("click", async () => {
        const data = await backendEditorPopup(null);
        if (!data) return;
        meguminAddUtilityBackend(data);
        redrawBackendList();
        toastr.success("Utility backend added.");
    });
    $content.on("click", ".gs_ub_edit", async function () {
        const id = $(this).attr("data-ubid");
        const b = meguminUtilityBackends().find(x => x.id === id);
        if (!b) return;
        const data = await backendEditorPopup(b);
        if (!data) return;
        meguminUpdateUtilityBackend(id, data);
        redrawBackendList();
    });
    $content.on("click", ".gs_ub_del", function () {
        const id = $(this).attr("data-ubid");
        const b = meguminUtilityBackends().find(x => x.id === id);
        if (!b) return;
        if (!confirm(`Delete backend "${b.name}"? Tasks using it fall back to the Main API.`)) return;
        meguminDeleteUtilityBackend(id);
        redrawBackendList();
        toastr.info("Backend deleted.");
    });
    $content.on("change", ".gs_ub_task", function () {
        meguminSetTaskBackend($(this).attr("data-task"), $(this).val());
    });

    redrawBackendList();

    // ── WIRING ──────────────────────────────────────────────────────────────
    //
    // One helper for both toggles. Each used to carry its own block re-applying
    // the same three styles by hand, which is how they came to use different
    // colours for the same state.
    const wireToggle = (id, key, colour) => {
        $content.find(id).on("click", function () {
            gs[key] = !gs[key];
            saveSettingsDebounced();
            $(this).toggleClass("active", gs[key]);
            $(this).css("border-color", gs[key] ? colour : "var(--border-color)");
            $(this).find(".ps-switch").css("background", gs[key] ? colour : "");
        });
    };
    wireToggle("#gs_toggle_prompt_preview", "promptPreview", "var(--gold)");
    wireToggle("#gs_toggle_utility_prefill", "enableUtilityPrefill", "#10b981");

    $content.find("#gs_save_mode").on("change", function () {
        // getCharacterKey() reads saveMode, so changing it moves where a save lands. Get any
        // pending edit written under the key it was made on before the switch, otherwise
        // initProfile() below replaces localProfile and that edit either dies or, worse,
        // gets saved under the new mode's key later.
        cancelDebounce(_saveProfileDebouncedInner);
        flushProfileSettingsToLoadedKey();
        gs.saveMode = $(this).val();
        saveSettingsDebounced();
        initProfile(); // Immediately reloads the correct profile
        toastr.success(`Save mode changed to Per ${gs.saveMode === 'chat' ? 'Chat' : 'Character'}.`);
    });

    c.append($content);
}
