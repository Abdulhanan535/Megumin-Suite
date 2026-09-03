# Megumin Suite - Complete Repository Analysis

## 1. Project Description and Purpose

Megumin Suite is a comprehensive extension for SillyTavern (an AI chat interface, version 1.12+), created by "KazumaONIISAN" (Arif Salah). It is a full-stack overhaul that replaces the preset system, memory system, NPC management, and image generation capabilities of SillyTavern -- all in a single extension.

Core philosophy (V10): "There are no villains and there are no good guys. Every action of every character is based on their morals and they believe they are the ones who are right."

Key features:
- Two AI writing engines (Ukiyo and Shura) with different storytelling styles
- Chain-of-Thought (CoT) reasoning frameworks
- Automated NPC Bank with persistent character tracking
- Memory Core (3-tier context: working, short-term, long-term vault with TF-IDF/semantic search)
- Block-based tracker system (World State, CYOA, Bonds, Character Sheet, Dice, etc.)
- ComfyUI image generation integration
- Dynamic Ban List (AI "slop" detector)
- Story Director (narrative evolution system)
- True random dice rolling
- Immersive HTML rendering
- Custom block system with user-definable fields

Version: V10 (manifest.json says "10.0")
License: CC BY-NC-ND 4.0 (non-commercial)
Homepage: https://github.com/Arif-salah/Megumin-Suite

## 2. Complete Directory Structure

```
Megumin-Suite/
├── index.js                    # Main extension entry point (905 lines)
├── style.css                   # Global UI styles (4815+ lines)
├── manifest.json               # SillyTavern extension manifest
├── example.html                # HTML template for the modal UI
├── License                     # CC BY-NC-ND 4.0
├── README.md                   # Comprehensive documentation
├── AGENTS.md                   # This file
├── Presets/                    # Importable preset JSON files
│   ├── Megumin Suite V10 Universal.json
│   ├── Megumin Suite V10 Universal Cache Friendly.json
│   ├── Megumin Image.json
│   └── Megumin Engine.json
├── Screenshots/                # Documentation images
│   ├── banner.png
│   ├── Screenshot1-4.png
│   └── donators/              # Donor avatars
│       ├── antivash.png, hibiki.png, illogical.png, kritblade.png
│       ├── larlya.png, luka.png, rokubi.png
├── img/                        # Extension assets
│   ├── Cat.png, default.png, default1-3.png, group.png
├── data/                       # Content library (templates, modes, prompts)
│   ├── database.js             # Aggregator that imports all data sections
│   ├── modes/                  # Engine definitions by generation
│   │   ├── index.js            # Combines all modes
│   │   ├── v10.js              # V10 Ukiyo/Shura engines
│   │   ├── v9.js, v8.js, v7.js, legacy.js
│   ├── cot/                    # Chain-of-thought frameworks
│   │   ├── index.js            # Combines all CoT models
│   │   ├── v10.js, v9.js, v8.js, v7.js, legacy.js
│   ├── personalities.js        # AI personality definitions
│   ├── toggles.js              # OOC, Control, and other toggle definitions
│   ├── addons.js               # Add-on system definitions (death, combat, dice, etc.)
│   ├── blocks.js               # Block template definitions (World State, CYOA, etc.)
│   ├── styles.js               # Writing style library
│   ├── styleTemplates.js       # Style template generators
│   ├── directStyles.js         # Direct style entries
│   ├── slots.js                # MEGUMIN_SLOT_REGISTRY (placeholder system)
│   ├── skeleton.js             # Base skeleton for profiles
│   └── image_data.js           # Image generation data (resolutions, Booru tags)
├── src/                        # Core source code
│   ├── st.js                   # SillyTavern import shim (re-exports ST modules)
│   ├── core/                   # Core state and infrastructure
│   │   ├── constants.js        # Extension name, folder path
│   │   ├── state.js            # Cross-cutting mutable state (localProfile, currentTab)
│   │   ├── activeRequests.js   # Background generation request markers
│   │   ├── keys.js             # Profile identity (character/chat/group key resolution)
│   │   ├── profile.js          # Loading, saving, pruning profiles (955 lines)
│   │   ├── sync.js             # Global tab sync (copy settings across profiles)
│   │   ├── migrations.js       # One-time data repairs
│   │   ├── refreshHooks.js     # UI refresh hook registry (avoids import cycles)
│   │   ├── engines.js          # Engine predicates (isV7, isV8, isModern, etc.)
│   │   ├── tokens.js           # Live token counter
│   │   └── sharedFragments.js  # Global text fragments (engine -> shared -> builtin)
│   ├── engine/                 # Prompt building and injection
│   │   ├── buildBaseDict.js    # Assembles the placeholder dictionary (737 lines)
│   │   ├── injection.js        # Prompt interceptor (434 lines)
│   │   ├── chatText.js         # Chat-to-text converter for background tasks
│   │   └── tasks.js            # One-off generation runner
│   ├── blocks/                 # Block card renderer
│   │   ├── render.js           # Master block renderer (747 lines)
│   │   ├── text.js             # Markdown/stat-line primitives
│   │   └── treatments.js       # Per-block treatments (World State, Chatter, Sheet)
│   ├── features/               # Feature modules
│   │   ├── blocks/
│   │   │   ├── registry.js     # Block definitions, envelope builder
│   │   │   ├── chat.js         # Chat-side block rendering
│   │   │   └── ui.js           # BLOCKS tab UI
│   │   ├── npc/
│   │   │   ├── fields.js       # NPC field definitions (442 lines)
│   │   │   ├── data.js         # NPC dossier parsing and text building
│   │   │   ├── updates.js      # NPC update block parsing and application
│   │   │   ├── updateCard.js   # NPC Update card decoration
│   │   │   ├── ui.js           # NPC Bank tab UI
│   │   │   └── pfp.js          # NPC portrait generation
│   │   ├── memory/
│   │   │   ├── index.js        # Memory Core (3-tier context system)
│   │   │   ├── keywords.js     # TF-IDF keyword caching
│   │   │   └── vectordb.js     # Semantic embedding integration
│   │   ├── storyplan/
│   │   │   └── ui.js           # Story Director UI and logic
│   │   ├── storyconfig/
│   │   │   ├── config.js       # Story Config normalization
│   │   │   └── ui.js           # Story Config tab UI
│   │   ├── banlist/
│   │   │   └── ui.js           # Dynamic Ban List UI
│   │   └── imagegen/
│   │       ├── index.js        # ComfyUI image generation
│   │       └── comfyProgress.js # WebSocket progress tracking
│   ├── prompts/                # Prompt system
│   │   ├── index.js            # DEFAULT_PROMPTS aggregator
│   │   ├── defaults.js         # Default prompt text
│   │   ├── storage.js          # Prompt diff/sparse storage (saves tokens)
│   │   ├── memoryCore.js       # Memory Core prompts
│   │   ├── npcBank.js          # NPC Bank prompts
│   │   ├── storyPlan.js        # Story Director prompts
│   │   ├── imageGen.js         # Image generation prompts
│   │   └── banList.js          # Ban list analysis prompts
│   ├── ui/                     # UI components
│   │   ├── launcher.js         # Draggable floating button
│   │   ├── tabs.js             # Tab navigation system
│   │   ├── devmode.js          # Dev Mode visual engine builder
│   │   ├── progress.js         # Image generation progress bar
│   │   ├── promptEditor.js     # Prompt editing panels
│   │   └── tabs/
│   │       ├── coreAndCot.js   # Presets & CoT tab
│   │       ├── personality.js  # Persona tab
│   │       ├── globalAndBlocks.js # Global Toggles & Add Ons tab
│   │       ├── globalSettings.js  # Global Settings tab
│   │       └── sidePanelTab.js    # Side Panel tab
│   ├── sidepanel/              # Side panel (discontinued but functional)
│   │   ├── panel.js            # Panel initialization and management
│   │   ├── sections.js         # Panel sections
│   │   ├── presentBar.js       # Present bar functionality
│   │   ├── parsers.js          # Block parsers for the panel
│   │   ├── dom.js              # DOM manipulation
│   │   ├── chrome.js           # Chrome compatibility
│   │   └── styles.css          # Side panel styles
│   ├── utils/                  # Utility functions
│   │   ├── html.js             # HTML escaping
│   │   ├── download.js         # JSON file download
│   │   ├── dice.js             # True random dice rolling
│   │   └── regex.js            # Regex escape utility
```

## 3. Tech Stack and Dependencies

**Platform:** SillyTavern browser extension (vanilla JavaScript, ES modules)

**Runtime dependencies** (all from SillyTavern):
- jQuery (DOM manipulation, event handling)
- SillyTavern's `extensions.js` API (`extension_settings`, `getContext`)
- SillyTavern's `script.js` API (`saveSettingsDebounced`, `generateQuietPrompt`, `eventSource`, `event_types`, `substituteParams`, `saveChat`, `reloadCurrentChat`, etc.)
- SillyTavern's `popup.js` (`Popup`, `POPUP_TYPE`)
- SillyTavern's `utils.js` (`saveBase64AsFile`, `debounce`, `cancelDebounce`)
- SillyTavern's `RossAscends-mods.js` (`humanizedDateTime`)
- Font Awesome icons (for UI)
- Google Fonts: Inter (400-800 weights)

No `package.json`, no build system, no bundler -- pure ES modules loaded directly by SillyTavern.

**External services supported:**
- ComfyUI (via WebSocket at configurable URL, default `http://127.0.0.1:8188`)
- SillyTavern's vector DB for semantic embeddings (Jina v2 or all-MiniLM-L6-v2)

## 4. All Source Files and What They Do

### Entry Point

**`index.js`** (905 lines): Main extension initialization. Loads HTML, initializes the draggable button, registers all event listeners (`CHAT_CHANGED`, `MESSAGE_RECEIVED`, `IMAGE_SWIPED`, etc.), handles profile lifecycle, image gen auto-trigger, NPC auto-extraction, Story Director auto-evolve, memory auto-trigger, mobile drawer system, and the modal UI. The orchestrator that wires everything together.

### Core Layer (`src/core/`)

- **`constants.js`**: Extension identity constants (`extensionName = "Megumin-Suite"`)
- **`state.js`**: Cross-cutting mutable state with ES module live bindings: `localProfile`, `_loadedProfileKey`, `currentTab`, `isDevEngineDirty`. Uses setter functions because ES module imports cannot be reassigned.
- **`activeRequests.js`**: In-flight background request markers for Story Director, Ban List, Image Gen, NPC Scan/Portrait/Update, Memory Summarization. Each feature parks a payload here and clears it in `finally`.
- **`keys.js`**: Profile identity resolution -- determines the storage key based on chat-level, group-level, or character-level context. Handles ghost profile cleanup.
- **`profile.js`** (955 lines): The largest core file. Handles loading, saving, patching, and pruning profiles. Runs migration logic, applies defaults, handles chat-level vs character-level profiles, and manages the chat-metadata bridge for memory/plan/NPC data.
- **`sync.js`**: Global tab sync -- copies one tab's settings into every stored profile. Uses `TAB_SYNC_KEYS` map to define which keys each tab owns.
- **`migrations.js`**: One-time settings repairs (cleaning legacy data, renaming tabs, migrating flags).
- **`refreshHooks.js`**: A hook registry that prevents import cycles between core and features. Features register callbacks by name; core fires them without knowing who listens.
- **`engines.js`**: Pure predicates over engine objects (`isV7Engine`, `isV8Engine`, `isModernEngine`, `isCoWriterEngine`, etc.). Identifies engine generation and behavior.
- **`tokens.js`**: Live token counter in the UI footer. Builds the full prompt dict, categorizes by section (Engine Core, CoT/Logic, Style & Config, Add-ons/Blocks), estimates tokens at ~4.8 chars/token.
- **`sharedFragments.js`**: Global text fragments with resolution order: engine override -> shared fragment -> built-in default. Stored in `extension_settings`, not per-profile.

### Engine Layer (`src/engine/`)

- **`buildBaseDict.js`** (737 lines): The core prompt assembly function. Reads from every feature and builds a dictionary of placeholder -> replacement text. Handles engine overrides, CoT wrapping, dice rolls, NPC injection, memory injection, block envelope building, and early token resolution.
- **`injection.js`** (434 lines): The prompt interceptor registered on `CHAT_COMPLETION_PROMPT_READY`. Decides which prompt shape to emit: roleplay, story planner, ban list, image gen, NPC scan, NPC portrait, memory summary, or manual generation order. Also handles prompt preview popup and NPC multimodal image injection.
- **`chatText.js`**: Converts the chat log into clean text for background tasks. Strips Megumin blocks, think tags, HTML, and metadata from messages.
- **`tasks.js`**: Runs one-off generations through SillyTavern. Swaps to the "Megumin Engine" preset for the duration and restores it after.

### Blocks System (`src/blocks/` and `src/features/blocks/`)

- **`render.js`** (747 lines): The master block renderer. Extracts blocks from raw message text, hides DOM remnants, builds a tabbed card (one tab per block). Handles lead blocks (Dice at top), truncated blocks, and the fallback to plain markdown.
- **`text.js`**: Shared text primitives -- HTML escape, basic markdown renderer (bold, italic, bullets, paragraphs), stat line parser for meters and numeric fields.
- **`treatments.js`** (1986+ lines): Per-block structural parsers and renderers. World State -> scene board, NPC Inner Chatter -> whisper thread, Character Sheet -> chips and pack list, Dice -> validated roll display. Each parser returns `null` to fall back to prose.
- **`registry.js`** (494 lines): Block definitions (`MEGUMIN_BLOCK_REGISTRY`), envelope builder, stat field management, visibility controls, field packs, custom block validation.
- **`chat.js`**: Chat-side block rendering -- applies blocks to messages, handles choice buttons, manages block refresh scheduling, plays dice arrival animations.

### Features (`src/features/`)

- **NPC System** (`npc/`): `fields.js` defines 14 default fields (Name, Age, Sex, Orientation, Role, Where to Find, Appearance, Image Tags, Voice, Background, Inner Circle, Personality, Read on PC, Agenda, Secrets, Canon Lock). `data.js` handles dossier parsing and text building. `updates.js` handles `NPC_Update` blocks. `ui.js` renders the NPC Bank tab. `pfp.js` handles portrait generation.
- **Memory Core** (`memory/`): `index.js` implements 3-tier context (working memory, short-term chunks, long-term vault). `keywords.js` provides TF-IDF keyword caching. `vectordb.js` integrates with SillyTavern's semantic embeddings.
- **Story Director** (`storyplan/`): `ui.js` renders the Director's Console with content rating, pacing, genre, flavor tags, and auto-evolve logic.
- **Story Config** (`storyconfig/`): `config.js` normalizes and defaults story configuration (genre, culture, era, POV, focus, tone, etc.). `ui.js` renders the configuration UI.
- **Ban List** (`banlist/`): `ui.js` renders the AI slop detector with chat analysis and automatic ban generation.
- **Image Generation** (`imagegen/`): `index.js` handles ComfyUI integration (workflow management, LoRA configuration, multi-image creation). `comfyProgress.js` tracks rendering progress via WebSocket.

### Prompts (`src/prompts/`)

- **`defaults.js`** and **`index.js`**: `DEFAULT_PROMPTS` object containing all system prompts, user prompts, thinking prompts, templates for Story Director, Ban List, Image Gen, Memory Core, NPC Bank.
- **`storage.js`**: Prompt diff/sparse storage -- only stores prompts that differ from defaults, reducing `settings.json` size.

### Data (`data/`)

- **`database.js`**: Aggregator that imports all data sections into `hardcodedLogic`.
- **`modes/`**: Engine definitions by generation (V10, V9, V8, V7, Legacy). Each engine has `id`, `name`, `description`, `p1-p6` prompts, `cot`, `prefill`, `A1/A2` acknowledgements.
- **`cot/`**: Chain-of-thought frameworks by generation. Each has `content` and `prefill` text.
- **`slots.js`** (350 lines): `MEGUMIN_SLOT_REGISTRY` -- defines every placeholder the engine knows about with scopes, gates, hints, and fallbacks. Drives the Dev Mode editor, leak guard, and override system.
- **`blocks.js`**: Built-in block templates (World State, CYOA, MVU, NPC Inner Chatter).
- **`personalities.js`**, **`toggles.js`**, **`addons.js`**: Content library sections.

### UI (`src/ui/`)

- **`launcher.js`**: Draggable floating wand button with snap-to-viewport and persistence.
- **`tabs.js`**: Tab navigation, global sync button, tab switching.
- **`devmode.js`**: Visual engine builder -- lets users edit engine prompts, shared fragments, and add-ons visually.
- **`progress.js`**: Image generation progress bar UI.
- **`promptEditor.js`**: Prompt editing panels for all subsystems.
- **`tabs/`**: Individual tab renderers (Presets & CoT, Persona, Writing Style, Global Toggles, Blocks, Global Settings, Side Panel).

### Side Panel (`src/sidepanel/`)

- **`panel.js`**, **`sections.js`**, **`presentBar.js`**, **`parsers.js`**, **`dom.js`**, **`chrome.js`**: A fixed side panel that shows tracker blocks (World State, NPC Inner Chatter, NPC Dossiers, Story Plan). Discontinued but functional for blocks it already knew.

### Utils (`src/utils/`)

- **`html.js`**: HTML escaping.
- **`download.js`**: JSON file download.
- **`dice.js`**: True random dice rolling.
- **`regex.js`**: Regex escape utility.

## 5. Configuration Details

**`manifest.json`**: Declares the extension for SillyTavern:
- `js`: `"index.js"` -- single entry point
- `css`: `"style.css"` -- single stylesheet
- `generate_interceptor`: `"megumin_memory_intercept"` -- memory interception hook
- `loading_order`: `100` -- loads after most extensions

**Profile structure** (stored in `extension_settings["Megumin-Suite"].profiles`):
```json
{
    "mode": "v10-ukiyo",
    "personality": "engine",
    "cotEnabled": true,
    "model": "cot-v1-english",
    "activeStyleId": "dir_v10_ukiyo",
    "aiRule": "...",
    "storyConfig": { "genre": "", "tone": "", "pov": "", ... },
    "blockStack": { "order": [...], "custom": [...], "overrides": {...} },
    "statBlocks": { "bonds": { "fields": [...] }, "sheet": { "fields": [...] } },
    "addons": [...],
    "blocks": [...],
    "banList": [...],
    "storyPlan": { "enabled": false, "currentPlan": "", ... },
    "imageGen": { "enabled": false, "comfyUrl": "http://127.0.0.1:8188", ... },
    "memoryCore": { "enabled": false, "chunkSize": 10, ... },
    "npcBank": { "fields": [...], "npcs": [...] }
}
```

**Storage modes**: `chat` (per-chat profiles) or `character` (per-character profiles). Group chats use group-level profiles.

**Two preset files**: Universal (standard) and Cache Friendly (reordered for API caching on Claude/Gemini/DeepSeek).

## 6. Tests and Documentation

**Tests:** No test files found. This is a browser extension without automated testing.

**Documentation:** The `README.md` is extensive (299 lines) with feature descriptions for every subsystem, installation instructions with video link, Quick Start Guide, troubleshooting tips, credits and acknowledgements, and legacy version links (V4 through V9.1).

## 7. Code Patterns and Conventions

### Architecture

- **ES modules with live bindings**: State is exported as `let` + setter functions. Importers read the live binding; reassignment goes through setters. Property mutation is direct.
- **Hook registry pattern**: Features register callbacks by name; core fires them without importing features. Prevents import cycles.
- **Registry pattern**: `MEGUMIN_BLOCK_REGISTRY`, `MEGUMIN_SLOT_REGISTRY`, `NPC_DEFAULT_FIELDS` -- single source of truth that drives parsers, renderers, editors, and leak guards.
- **Fail-safe rendering**: Every parser returns `null` when uncertain, falling back to plain prose. "A block that renders as prose has lost a nicety; a block that renders as a confident incomplete card has lost the reader's data."
- **Diff-based storage**: Prompts are stored as diffs against defaults (`meguminSparsifyProfilePrompts`/`meguminRehydrateProfilePrompts`), keeping `settings.json` small.
- **Chat metadata bridge**: Large per-chat data (memory vault, NPC bank, story plan) is stored in `chat_metadata`, not `settings.json`, and migrated on load.

### Code Style

- No semicolons in most files (consistent ASI style)
- JSDoc-style comments for important functions
- Section headers using comment blocks (`// ─── SECTION ───`)
- jQuery for DOM manipulation (SillyTavern convention)
- `toastr` for user notifications
- `extensionName` constant for all settings lookups
- `substituteParams()` for SillyTavern macro expansion in prompts
- `escapeRegex()` used consistently for regex construction from user input
- No build/bundling -- raw ES modules loaded directly

### Naming Conventions

- **Files:** camelCase (`buildBaseDict.js`, `chatText.js`)
- **Functions:** camelCase (`buildBaseDict`, `extractBlocks`, `parseWorldState`)
- **Constants:** UPPER_SNAKE_CASE (`MEGUMIN_BLOCK_REGISTRY`, `TAB_SYNC_KEYS`, `REFRESH`)
- **CSS classes:** `meg-` prefix for block card, `ps-` prefix for settings UI, `wstyle-` for writing style tab, `mtab-` for shared tab components
- **Extension prefix:** `megumin_` for chat metadata keys, `Megumin-Suite` for settings key

### Error Handling

- Graceful degradation throughout -- failed parsers fall back to prose
- Console debug logging for silent failures
- User-facing toasts for important state changes
- Profile save guards against chat-switch races
- Background generation identity stamping to prevent stale data writes

### Mobile Support

- Responsive CSS with `@media (max-width: 768px)`
- Bottom swipeable dock navigation
- Hamburger menu with drawer overlay
- `touch-action: none` on draggable elements

## 8. Complete Feature Inventory

### A. Engine System (Presets)

**Official Engines** (shipped in `data/modes/`):
- **V10 Ukiyo** (`v10-core`): The loose, atmospheric storyteller. Follows whatever in the scene is most alive.
- **V10 Shura** (`v10-shura`): The strict, book-like writer. No slop, no AI tells, every character a protagonist.
- **V10 Ukiyo Co-Writer** (`v10-core-cw`): Ukiyo with shared authorship -- narrator writes {{user}} in your voice.
- **V10 Shura Co-Writer** (`v10-shura-cw`): Shura with shared authorship.
- **V9 Mirage** (`v9-core`): Hyper-realistic psychology, visceral atmospheric grounding.
- **V9 Lite/Cui** (`v9-lite`): Streamlined V9 with lower token footprint.
- **V9 Mirage Air** (`v9-director`): Hybrid of V8 Fusion mechanics with V9 depth.
- **V9 Mirage Max** (`v9-immersion`): Heavy-duty maximum-thinking variant.
- **V9 Kuromaku** (`v9-hybrid`): Multi-agent reasoning engine.
- **V8 Obsidian** (`v8-m`): Complex human psychology, flawed dialogue, autonomous plotting.
- **V8 Lite** (`v8-lite`): Streamlined Obsidian.
- **V8 Fusion** (`v8-fusion`): Hybrid of V8 psychology + V6 Dream Team specialist room.
- **V7 Core** (`v7-core`): Cinematic pacing, realistic friction, world progression.
- **V7 Reality** (`v7-reality`): Grounded, unrelenting simulation.
- **V7 Gentle** (`v7-gentle`): Softer, intimate storytelling.
- **V7.5 Kismet** (`v7.5`): Inescapable narrative momentum, unseen author of fate.
- **V6 Anime Director** (`v6-anime-director`): Cinematic framing and pacing (locked/coming soon).
- **V6 Dream Team** (`v6-dream-team`): 6-specialist writer room (locked).
- **V6 Dream Team Lite** (`v6-dream-team-lite`): Streamlined Dream Team (locked).
- **V4/V5 Legacy**: Balance, Balance Test, Cinematic, Dark.

**Custom Engine Support**:
- Clone any engine via Dev Mode and edit p1-p6, CoT, prefill, acknowledgements.
- Custom engines stored in `extension_settings[extensionName].customModes`.
- Quick-edit button on custom engine cards in the PRESETS & COT tab.
- Engine import/export as JSON.

**Enhanced Dialogue** (V10 only):
- Per-engine toggle that swaps the `<dialogue>` section for a stricter, prescriptive set with named categories, orthographic emotion cues, and an explicit ban list.

### B. Chain-of-Thought (CoT) / Reasoning System

**CoT Frameworks** (shipped in `data/cot/`):
- V10 Ukiyo CoT, V10 Ukiyo Thinking Cap, V10 Shura CoT, V10 Shura Thinking Cap
- V1 (Classic 8-step), V2 (Stricter reality checks)
- V6 (Dream Team 4-phase), V6 Lite (3-phase)
- V7 (5-phase ground truth), V7 Lite, V7.5 Kismet
- V8, V8 Fusion
- V9 Mirage, V9 Mirage Air, V9 Mirage Max, V9 Kuromaku, V9 Cui (Lite)

**CoT Features**:
- Enable/disable entire CoT system.
- Thinking effort control: 100, 250, 450, custom word count, or unspecified.
- Gemini Thinking Override toggle (XML tag injection for Gemini models).
- Reasoning language selection: English, Arabic, Spanish, French, Mandarin, Russian, Japanese, Portuguese.
- Engine-CoT compatibility warnings in the UI.
- Thinking tags wrapped in `<think>...</think>` with customizable `[[THINK]]` slot.

### C. Persona System

**Narrator Personas** (4 shipped):
- Megumin (rebellious, dominant, condescending)
- Nora
- Director (professional, authoritative)
- Engine (no overlay -- recommended, default)

**Persona Locking**:
- Modern engines (V8, V9, V10) lock the Persona tab -- they manage their own internal persona.
- V6 Dream Team and V7 also lock persona to prevent logic conflicts.

**Global Toggles** (on Persona tab):
- OOC Commentary (`[[OOC]]`) -- out-of-character directives.
- Stop AI from Controlling User (`[[control]]`) -- recommended off.

### D. Writing Style System

**Style Tag Library** (`data/styles.js`):
- 27 Genre & Tone tags (Dark, Gritty, Horror, Cinematic, Fantasy, Comedy, etc.)
- 12 Narration tags (Purple Prose, Descriptive, Sensory-Rich, Introspective, etc.)
- 9 Pacing tags (Slow-Burn, Fast-Paced, Dynamic, Time-Skips, etc.)
- 4 POV tags (First-Person, Second-Person, Third-Person Limited/Omniscient)

**Direct Style Instructions** (`data/directStyles.js`):
- 14 built-in direct styles (V10 Ukiyo/Shura, V9, V8, V7 Core/Reality/Gentle, V7.5 Kismet, Simple, Descriptive, Dialogue-Centric, Clinical, Sensory-Rich).

**Style Templates** (`data/styleTemplates.js`):
- 9 prebuilt style presets (Opinionated Storyteller, Deep Introspection, Snarky Observer, Grimdark Epic, Psychological Horror, Sweet Like Sugar, Action Thriller, Unreliable Memoirist, Southern Gothic Teller).

**Custom Styles**:
- User can create custom writing styles.
- Custom styles stored in profile.

**Dialogue/Narration Ratio** (`[[DNRATIO]]`):
- Configurable ratio of speech vs. description.

**Engine-Style Locking**:
- V7+ and modern engines require a narrative style; "No Style (Off)" is refused.
- Locked style ID per engine (e.g., V10 Ukiyo -> `dir_v10_ukiyo`).

### E. Story Config System

**Configurable Fields** (compiled into `[[config]]` block):
- Genre, Culture, Era, POV, Focus, Tone, Length, Pacing, and more.
- Active config field count shown in the sidebar.

### F. Blocks / Tracker System

**Built-in Blocks** (`data/blocks.js` + `src/features/blocks/registry.js`):
- **World State** (`[[infoblock]]`): Scene board with date/time, location, weather, PC state, NPCs Present, Off-Screen, Unresolved Threads, Planted Seeds, Consequence Timers, Arc/Scene Phase.
- **CYOA / Choice Block** (`[[cyoa]]`): Numbered interactive choices rendered as clickable buttons (click to fill input, shift-click to send).
- **MVU Compatibility** (`[[MVU]]`): Contract with MVU Game Maker extension.
- **NPC Inner Chatter** (`[[npc_inner_chatter]]`): Private NPC thoughts rendered as whisper threads.
- **Story Tracker** (`[[storytracker]]`): Arc, chapter, episode, secrets for the Story Director.

**Custom Blocks**:
- User-definable blocks with custom fields, tags, triggers, and templates.
- Custom block validation.
- Stat field management (Bonds, Character Sheet, etc.).

**Block Rendering** (`src/blocks/render.js` + `treatments.js`):
- Tabbed card UI with emoji tabs, one panel per block.
- Lead blocks (Dice at top of reply) handled separately.
- Truncated blocks detected and flagged.
- CYOA choices rendered as interactive buttons.
- Per-block treatments: World State -> scene board, NPC Inner Chatter -> whisper thread, Character Sheet -> chips and pack list, Dice -> validated roll display.
- Fail-safe: any parser returning null falls back to plain prose.
- DOM remnant hiding (hides sanitizer leftovers).
- Arrival animations.
- Block visibility controls (open/closed/hidden).
- Stat blocks (Bonds, Character Sheet with custom fields and packs).

### G. Add-on System

**Shipped Add-ons** (`data/addons.js`):
- **Dice** (`[[dice]]`): d20 system, 3 rolls per turn (player only).
- **Dice: Everyone** (`[[dice_all]]`): d20 system, 6 rolls per turn (all characters).
- **Immersive HTML** (`[[html]]`): AI draws screens/letters/signs as real HTML.
- **Death System** (`[[death]]`): Permanent character death with narrative survival or character transfer.
- **Combat System** (`[[combat]]`): Tactical, turn-based combat with realistic consequences.
- **Direct Language** (`[[Direct]]`): Blunt anatomical wording (not needed on V10).
- **Dialogue Colors** (`[[COLOR]]`): Per-character hex color-coding for dialogue.
- **Organic NPCs & Events** (`[[npc_events]]`): No random drama; events must emerge from context (V6 only).
- **Dialogue & Narration Format** (`[[DN]]`): XML tag wrapping for speech/narration.
- **Cinematic Sounds / Onomatopoeia** (`[[onomato]]`): Phonetic sound words instead of descriptions, with optional HTML animation sub-toggle.

**Exclusive Add-on Groups**:
- Dice and Dice: Everyone are mutually exclusive (share `[[dice]]` anchor).

**Add-on Cards**:
- Recommended badges, custom-edited badges, V6 lock badges.
- Warning: "Pick 3-4, not all" -- too many add-ons thin the prose.

### H. NPC Bank System

**NPC Fields** (`src/features/npc/fields.js`):
- 14+ default fields: Name, Age, Sex, Orientation, Role, Where to Find, Appearance, Image Tags, Voice, Background, Inner Circle, Personality, Read on PC, Agenda, Secrets, Canon Lock.
- Custom fields supported.

**NPC Features**:
- Automatic NPC extraction from chat (background generation).
- NPC dossier parsing and text building.
- NPC Update block parsing and application (`NPC_Update`).
- NPC portrait generation via ComfyUI.
- NPC Update card decoration.
- NPC Bank tab UI with browse, edit, upload, generate portraits.
- NPC search and filtering.
- NPC export/import as JSON.
- NPC reference images for current generation (multimodal).
- Ghost profile cleanup for stale NPC data.

**NPC Injection into Prompts**:
- `[[npc list]]` -- relevant NPCs for current scene.
- `[[npc_dossier]]` -- dossier rules/instructions.
- `[[npc_dossier2]]` -- secondary dossier injection.
- `[[npc_events]]` -- organic NPC introduction rules.

### I. Memory Core System

**3-Tier Context Architecture** (`src/features/memory/`):
1. **Working Memory**: Recent chat messages kept verbatim (`[[Short-memory]]`).
2. **Short-Term Chunks**: Summarized chunks of older conversation.
3. **Long-Term Vault**: Archived summaries (`[[long-Memory]]`).

**Memory Features**:
- Automatic memory summarization (background generation).
- TF-IDF keyword caching (`keywords.js`).
- Semantic embedding integration via SillyTavern's vector DB (`vectordb.js`).
- Chunk size configuration.
- Vault retrieval with cache invalidation.
- Overlap scrubbing on chat rewind.
- Memory visual dashboard, accordion, and vault views.
- Memory export/import.

### J. Story Director System

**Story Plan Features** (`src/features/storyplan/`):
- Auto-evolve logic (triggers after configurable message intervals).
- Genre vocabulary system.
- Narrative blueprint generation.
- Content rating, pacing, genre, flavor tags.
- Story Tracker block integration (`[[storytracker]]`).
- Plan stored in `chat_metadata` (not `settings.json`).
- Director's Console UI.

### K. Dynamic Ban List System

**Ban List Features** (`src/features/banlist/`):
- AI slop detector -- analyzes chat for repeated phrases and AI tells.
- Automatic ban phrase generation from chat analysis.
- Custom ban phrases.
- Custom prompts for ban list generation.
- Ban list injected into prompt via `[[banlist]]`.
- Built-in ban list in the preset (negative framing, thought-verbs, on-the-nose, cliches, metaphor tics, echo detection).

### L. Image Generation System

**ComfyUI Integration** (`src/features/imagegen/`):
- WebSocket connection to ComfyUI (configurable URL, default `http://127.0.0.1:8188`).
- Scene prompt generation from chat context.
- Resolution presets (SDXL and SD 1.5 variants).
- LoRA configuration (up to 4 LoRAs with weights).
- Custom workflow JSON upload.
- Seed, steps, CFG scale, denoise strength, CLIP skip, sampler settings.
- Multi-image creation.
- Image rules injection (`[[img1]]`).
- NPC portrait generation.
- Progress tracking via WebSocket (`comfyProgress.js`).
- Progress bar UI (indeterminate stripe or determinate percentage).

**Workflow Placeholders** (`data/image_data.js`):
- 20 placeholders: `%prompt%`, `%negative_prompt%`, `%seed%`, `%steps%`, `%scale%`, `%denoise%`, `%clip_skip%`, `%model%`, `%sampler%`, `%width%`, `%height%`, `%lora1-4%`, `%lorawt1-4%`.

### M. Prompt Building & Injection Engine

**Dictionary Assembly** (`src/engine/buildBaseDict.js`, 737 lines):
- Builds complete placeholder dictionary from every feature.
- Handles engine overrides, CoT wrapping, dice rolls, NPC injection, memory injection, block envelope building.
- Early token resolution.

**Prompt Interception** (`src/engine/injection.js`, 434 lines):
- Registered on `CHAT_COMPLETION_PROMPT_READY`.
- Routes to different prompt shapes: roleplay, story planner, ban list, image gen, NPC scan, NPC portrait, memory summary, manual generation order.
- Prompt preview popup.
- NPC multimodal image injection.
- Leak guard: strips all unfilled `[[trigger]]` tags from final prompt.

**Active Request Markers** (`src/core/activeRequests.js`):
- 8 background generation types: Story Plan, Ban List, Image Gen, NPC Scan, NPC Portrait, NPC Update, Memory Summarization, Manual Generation Order.
- `isBackgroundGenerationActive()` predicate.

### N. Shared Fragments System

**Shared Fragments** (`src/core/sharedFragments.js`):
- One value for the entire install, not per-engine.
- Resolution order: engine override -> shared fragment -> built-in default.
- Stored in `extension_settings`, not per-profile.
- Covers: death, combat, html, dice, userControl, direct, dn, dialogueColor, onomato, dnratio, banlist, info, cyoa, mvu, npc_inner_chatter, storytracker.

### O. Slot Registry System

**MEGUMIN_SLOT_REGISTRY** (`data/slots.js`, 350 lines):
- Every `[[placeholder]]` the engine knows about (40+ slots).
- Scopes: engine, shared, auto.
- Gates: conditions for slot to reach the prompt (CoT enabled, block toggled on, add-on active, etc.).
- Derived views: `meguminAllSlotTriggers()`, `meguminOverridableSlots()`, `meguminAddonSlots()`, `meguminEngineSlots()`.
- Drives Dev Mode editor, leak guard, override system.
- Adding a placeholder = adding ONE entry here.

### P. Dev Mode (Visual Engine Builder)

**Dev Mode Features** (`src/ui/devmode.js`):
- Edit engine prompts (p1-p6) visually.
- Edit shared fragments.
- Edit add-on text.
- Document view showing prompt skeleton with slot positions.
- Clone engine from any official engine.
- Import/export engine as JSON.
- Unsaved-changes guard (prompts before closing with pending edits).

### Q. Side Panel (Discontinued but Functional)

**Side Panel Features** (`src/sidepanel/`):
- Dockable (left/right edge) or floating (draggable, resizable) panel.
- UI scale control.
- Section registry with reorderable sections.
- Sections: World State, NPC Inner Chatter, New NPC Dossiers, Story Planner, NPC Bank, Ban List.
- Auto-hide empty sections.
- Hide inline tracker blocks in chat.
- Present Characters Bar (Doom-style horizontal portrait strip above/below input).
- Section visibility toggles.
- Reset section layout.
- Force refresh.

### R. Global Tab Sync

**Tab Sync System** (`src/core/sync.js`):
- Per-tab global sync toggle.
- Maps each tab to its owned profile keys.
- Copies one tab's settings into every stored profile.
- Special handling: Story Config opt-out, Story Plan content preservation, NPC Bank NPC preservation, Memory Core vault preservation.
- Prompt diff-based global sync (only stores diffs against defaults).
- Story Config syncs independently from its host tab.

### S. Profile System

**Profile Features** (`src/core/profile.js`, 955 lines):
- Per-chat, per-character, or per-group profile storage.
- Profile loading, saving, patching, pruning.
- Migration logic for legacy data.
- Default profile creation.
- Chat-metadata bridge for memory vault, NPC bank, story plan.
- Profile save debounce.
- Ghost profile cleanup.

**Profile Identity** (`src/core/keys.js`):
- Key resolution: group > chat-level > character-level > global.
- Branch detection (parent chat key).
- Profile level detection.
- Debug profile state function.

### T. Global Settings

**Settings Tab** (`src/ui/tabs/globalSettings.js`):
- Prompt Payload Preview toggle (shows finished prompt before sending).
- Utility Prefills toggle (for background jobs).
- Profile Save Mode: Per Character or Per Chat.
- Community links (GitHub, PayPal, Litecoin).
- About card with version.

### U. Token Counter

**Live Token Counter** (`src/core/tokens.js`):
- Estimates tokens at ~4.8 chars/token.
- Categorizes by section: Engine Core, CoT/Logic, Style & Config, Add-ons/Blocks.
- Hover breakdown with per-category token counts.
- Excludes dynamic blocks (memory, NPC, image, story plan, ban list, blocks envelope).
- Updates on profile changes via refresh hook.

### V. UI Components

**Launcher** (`src/ui/launcher.js`):
- Draggable floating wand button.
- Snap-to-viewport.
- Persistence of position.

**Tab Navigation** (`src/ui/tabs.js`):
- Tab system: Presets & CoT, Persona, Writing Style, Global Toggles & Add Ons, BLOCKS, Story Director, Dynamic Ban List, Image Generation, NPCs Bank, Memory Core, Side Panel, Global Settings.
- Global sync button per tab.
- Tab switching with refresh hooks.

**Prompt Editor** (`src/ui/promptEditor.js`):
- Reusable accordion card for editing prompts.
- Per-field reset, reset all defaults.
- Enable/disable toggle per module.
- Used by: Story Director, Ban List, Image Gen, NPC Bank, Memory Core.

**Progress Bar** (`src/ui/progress.js`):
- Bottom-right progress toast.
- Two modes: indeterminate (barber-pole stripe) or determinate (real percentage).
- Used by image gen, memory sync, NPC portrait generation.

### W. Engine Predicates

**Engine Identification** (`src/core/engines.js`):
- `isV7Engine`, `isV8Engine`, `isV9Engine`, `isV10Engine`.
- `isCoWriterEngine` (V10 Co-Writer variants).
- `isModernEngine` (V8+ -- carries own persona, locks persona tab).
- `engineLocksStyle` (V7+ -- requires narrative style).
- `engineUsesRenderLimits` (V9 only -- Lean/Full word count split).
- `lockedStyleIdFor` (built-in style per engine).

### X. Data / Content Library

**Engine Definitions** (`data/modes/`): 5 generation files (v10.js, v9.js, v8.js, v7.js, legacy.js).

**CoT Definitions** (`data/cot/`): 5 generation files with reasoning scripts in multiple languages.

**Skeleton** (`data/skeleton.js`): The actual prompt structure showing where every `[[slot]]` lands in the outgoing prompt. Used by Dev Mode's Document view.

### Y. Utility Functions

- **Dice** (`src/utils/dice.js`): True random d20 rolling with rejection sampling, cryptographic randomness via `crypto.getRandomValues()`.
- **Download** (`src/utils/download.js`): JSON file download helper.
- **HTML** (`src/utils/html.js`): HTML attribute escaping, field placeholder helper.
- **Regex** (`src/utils/regex.js`): Regex escape utility.

### Z. Architecture Patterns

- **ES Module Live Bindings**: State exported as `let` + setter functions; importers observe current value.
- **Hook Registry**: Features register callbacks by name; core fires them without importing features (prevents import cycles).
- **Registry Pattern**: `MEGUMIN_BLOCK_REGISTRY`, `MEGUMIN_SLOT_REGISTRY`, `NPC_DEFAULT_FIELDS` -- single source of truth.
- **Fail-safe Rendering**: Every parser returns `null` when uncertain, falling back to prose.
- **Diff-based Storage**: Prompts stored as diffs against defaults to minimize `settings.json` size.
- **Chat Metadata Bridge**: Large per-chat data (memory vault, NPC bank, story plan) stored in `chat_metadata`.
- **Background Generation Identity Stamping**: Prevents stale data writes on chat switch.

### AA. Mobile Support

- Responsive CSS with `@media (max-width: 768px)`.
- Bottom swipeable dock navigation.
- Hamburger menu with drawer overlay.
- `touch-action: none` on draggable elements.
- Side panel clamps to 94% viewport on mobile.

## 9. Planned Remake: Utility Backend (Fast Model for Background Tasks)

### Problem (verified in code)

All 8 background task types run through `generateQuietPrompt()` and therefore the MAIN API connection. There is no second connection anywhere in the codebase. On a slow main API (e.g. 8 t/s), background work (memory summarization, NPC extraction, story director) crawls even when the user has a fast model available (e.g. 80 t/s).

| Task | Current call site |
|---|---|
| Ban List analysis | `tasks.js:14` (`analyzeSlopDirectly`) |
| Manual generation order | `tasks.js:61` (`runMeguminTask`) |
| Memory summarization | `src/features/memory/index.js` |
| Story Director evolve | `src/features/storyplan/ui.js` (`generateStoryPlanLogic`) |
| Image prompt generation | `src/features/imagegen/index.js` |
| NPC scan | `src/engine/injection.js:93` |
| NPC portrait prompt | `src/engine/injection.js:212` |
| Forced NPC update | `src/engine/injection.js:127` |

The only existing "switching" is `useMeguminEngine()` (`tasks.js:36`) which swaps the OpenAI **preset** (prompt content), never the model — and blocks for 3 seconds per background task (`tasks.js:45`). The per-profile `backend: "direct"` fields select **prompt source**, not model; both paths still hit the main API.

### Chosen design (user decision)

**Direct API calls** (bypass SillyTavern for background tasks) with **per-task backend selection**:

1. **Utility Backends** (Global Settings): user-defined list of OpenAI-compatible endpoints — `{ name, endpointUrl, apiKey, model, temperature, maxTokens }`. Stored in `extension_settings[extensionName].utilityBackends` (global, NOT per-profile — API keys must never ride tab sync).
2. **Per-task selection**: each of the 8 task types gets its own backend choice — "main" (current behavior) or a configured backend id.
3. **New module** `src/engine/utility.js` — `runUtilityGeneration(taskType, messages, opts)`: routes to direct `fetch` (OpenAI-compatible `/chat/completions`) or to `generateQuietPrompt` depending on the task's setting. Strips `think` tags on the direct path, same as `analyzeSlopDirectly` does today.
4. **Prompt builders extracted**: the inline message-array construction in `injection.js` moves to shared pure builders (`src/engine/taskPrompts.js`) used by BOTH paths — direct fetch no longer needs the interceptor, but the "main" path keeps the activeRequests marker flow intact.
5. **Parallel-safe**: memory + NPC scan can run simultaneously on the fast backend (no preset-swap races). When every task is on direct backends, the 3-second `useMeguminEngine` wait disappears entirely.
6. **ComfyUI precedent**: direct-fetch pattern already exists in the codebase (`src/features/imagegen/`), so this follows an established convention.

Identity stamping (`meguminActiveDataIdentity`) and chat-switch race guards continue to apply to writes made from direct-path responses.

### Extension: Side-Model Inline Images (user-confirmed addition)

**Problem:** in the current inline flow the MAIN model writes `<img prompt="...">` inside its roleplay reply (guided by `[[img1]]` preset rules). On a slow main API that is hundreds of extra tokens per visual turn, and the main model may be weak at Booru tags.

**Design:** a new Image Generation mode — **Inline Prompt Writer**:
- `Main model` (default, current behavior): unchanged — reply carries the tag, ComfyUI renders.
- `Side model`: main model writes NO image tags (the `[[img1]]` rules are swapped for a lighter variant that omits the tag-writing instruction, saving tokens); on each qualifying AI reply the UTILITY BACKEND writes the image prompt and the extension injects + renders it.

**Flow when Side model is on:**
1. AI reply lands (`MESSAGE_RECEIVED`).
2. If the reply already contains a full `<img prompt="...">` tag → main model wrote it → existing handling, no double generation.
3. Else if the trigger matches (every AI reply / every N replies / only when a bare `<img>` marker is present) → build the same payload `generateImagePromptText` builds (last 5 AI messages cleaned, template rules + examples, NPC Booru tags, direct-language block) → `runUtilityGeneration("imageInline", messages)` via the fast backend → strip `think` tags → inject the inline placeholder into the message → ComfyUI renders.
4. Retry buttons, progress tracking, and inline/gallery modes work identically.

**Task type #9** `imageInline` joins the per-task backend selection, so inline auto-writes and manual quick-gen can use different backends. Requires the Utility Backend system from this section.

### Build status (§9-ext imageInline)

**STATUS: BUILT.**

- `src/engine/imageInline.js` — NEW: the side-model inline writer. `meguminHandleInlineWriter()` runs on the MESSAGE_RECEIVED fall-through in index.js (a reply the main model already tagged is left alone — no double generation); trigger modes every/bare-marker/every-N; identity stamping guards the injection; `meguminInlineLighterImg1()` is the lighter `[[img1]]` variant that omits the tag-writing instruction.
- `src/engine/buildBaseDict.js` — `[[img1]]` swap: when `imageGen.inlineWriter === "side"` and task #9 has a configured backend, the dict carries the lighter variant and blanks `[[img2]]`.
- `src/features/imagegen/index.js` — new tab controls: "Inline Prompt Writer" (Main Model / Side Model) + "Side Trigger" select; defaults + patch-up in profile.js (`inlineWriter`, `inlineTriggerMode`).

### Build status (§9 core)

**STATUS: BUILT (core).** Direct-call router, shared prompt builders, and all 7 in-code call sites rewired; Global Settings UI complete. `imageInline` (task #9) and `castGenerator` (task #11) are registered in `UTILITY_TASKS` but have no feature wiring yet — see their own sections.

- `src/engine/utility.js` — NEW: backend CRUD (`meguminAddUtilityBackend`/`Update`/`Delete`), per-task mapping (`meguminTaskBackend`/`SetTaskBackend`), `meguminDirectChat` (OpenAI-compatible `/chat/completions` fetch), `meguminStripThink`, `runUtilityGeneration(taskType, messages, {quietPrompt})` router. Storage: `extension_settings[extensionName].utilityBackends` + `.utilityTaskBackends` (global, never per-profile).
- `src/engine/taskPrompts.js` — NEW: the 7 shared builders (`buildStoryPlanMessages`, `buildNpcScanMessages`, `buildNpcUpdateMessages`, `buildBanListMessages`, `buildImageGenMessages`, `buildNpcPortraitMessages`, `buildMemorySummarizeMessages`) returning `{ messages, prefill }`, plus `meguminUtilityPrefillEnabled()`. Deterministic output; chat history last (Section 11 cache rules).
- `src/engine/injection.js` — rebuilt on the shared builders; main-path prompt bytes unchanged. Prefill policy read via the shared helper.
- `src/engine/tasks.js` — `analyzeSlopDirectly` routes through `runUtilityGeneration("banList", ...)`.
- `src/features/memory/index.js` — summarization: direct backend when configured, else the old direct/engine paths.
- `src/features/storyplan/ui.js` — `generateStoryPlanLogic`: direct backend bypasses the marker entirely.
- `src/features/npc/ui.js` — scan + forced update: per-task routing, marker only parked on the main path.
- `src/features/npc/pfp.js` — portrait prompt: per-task routing.
- `src/features/imagegen/index.js` — `generateImagePromptText`: per-task routing.
- `src/ui/tabs/globalSettings.js` — Utility Backends section: backend list (add/edit/delete via Popup), 11 per-task selects, "Main API" default; deletion falls tasks back to main.
- `generationOrder` has no direct path by design (its prompt lives in the preset's `[[order]]` tag); the picker shows it but selecting a backend leaves it on main — documented in `taskPrompts.js`.

## 10. Planned Remake: Megumin Memory Books (Native Lorebook System)

### Goal (user decision)

Merge World Info / lorebook ("memory book") functionality INTO the suite as a Megumin-native system — not a wrapper around SillyTavern's `world_info` module. ST lorebooks port over via import. The system behaves like standard World Info ("as it is"): keyword activation with configurable intervals (scan depth), budgets, ordering — **no LLM anywhere in activation** (pure local keyword scanning, zero API calls, works on any backend).

### Storage (follows the suite's registry/chat-metadata patterns)

- **Library** (per-install): `extension_settings[extensionName].lorebookLibrary` — array of books `{ id, name, entries: [] }`. Books are reusable across characters/chats, like ST's global lorebook list.
- **Bindings** (per-profile): `localProfile.memoryBooks: { activeIds: [], scanDepth, tokenBudget, recursion }` — which books ride along for this character/chat and the scan knobs. Bridges into chat_metadata the same way NPC bank does if books grow large.
- **Import/Export**: ST-compatible JSON — accepts Character Book / World Info JSON exports (converts ST entry fields to Megumin entry shape), exports back in ST-compatible form. Existing lorebooks port over; users keep ST WI running alongside or drop it.

### Entry shape (ST-compatible for import/export)

```json
{
    "id": "ent_123",
    "enabled": true,
    "comment": "The Ravenhold Inn",
    "keys": ["Ravenhold", "the inn"],
    "secondaryKeys": [],
    "logic": "AND_ANY",
    "constant": false,
    "content": "The Ravenhold Inn is ...",
    "position": "before_char",
    "depth": 4,
    "order": 100,
    "caseSensitive": false,
    "matchWholeWords": true,
    "group": "",
    "groupWeight": 50
}
```

### Book settings (the "interval and stuff" — per active book on the profile)

- **Scan depth**: how many recent messages are keyword-scanned (default 4, like ST's interval)
- **Token budget**: max tokens of injected lore per turn; lowest-order entries drop first when over budget
- **Recursion**: whether injected content may trigger other entries (default off)
- **Positions**: `before_char`, `after_char`, `at_depth` (with per-entry depth) — honored by the dict/injection stage

### Injection (into the existing pipeline)

- New slot `[[memorybook]]` registered in `MEGUMIN_SLOT_REGISTRY` (one entry = editor, leak guard, token counter all learn it)
- `buildBaseDict` fills it from local activation scanning: regex keyword match over the last N messages, apply budget, sort by order, concatenate by position
- `at_depth` positions are applied in `injection.js` where the message array is in hand
- Activation is pure JS regex (`escapeRegex` per key, whole-word option) — instant, offline, works regardless of which utility backend is configured

### UI (on the Memory Core tab, per user request "options of memory books on the memory block settings")

- **Memory Books section** on the MEMORY CORE tab:
  - Active books list (on/off toggle per book), scan depth + token budget + recursion controls
  - New Book / Import (ST lorebook JSON) / Export buttons
- **Book editor** (accordion per book):
  - Entries table: keys, content preview, order, constant toggle, position, comment/title
  - Add / edit / delete entries, drag to reorder
- New module `src/features/lorebook/` — `index.js` (storage + activation scanning), `ui.js` (Memory tab section + editor)

### Explicitly out (for now)

- No auto-extraction of entries from chat (the user wants the system "as it is"). The Utility Backend architecture reserves task type #10 for a future fast-model "propose lore entries from recent chat" button — not part of this build.
- No recursion chains, inclusion groups beyond a simple `group`/`groupWeight` pair, or timed effects in v1 — plain ST-style activation.

## 11. Cache-Friendliness Requirements (applies to all planned systems)

The suite ships a Cache Friendly preset (static content first, volatile last) so Claude/Gemini/DeepSeek can bill cached input. The remake must not regress that, and the direct backend calls get their own caching story. Rules below are requirements, not suggestions.

### A. Direct utility-backend calls (task types #1-#9)

Background prompts are built by `taskPrompts.js`, not the interceptor — so byte ordering is fully in our control:

1. **Static-first ordering, every task type**: system prompt (task rules) → template rules → template examples → semi-static blocks (NPC Booru tags, direct-language reference) → **chat history LAST** (the only volatile part).
2. **One task type = one byte-identical system prompt** across calls. The rules prefix is then a guaranteed cache hit on the fast backend; only the history tail re-processes.
3. **Deterministic builders**: no timestamps, no `Date.now()`, no random ordering, no console-only state leaking into message content. Same inputs → same bytes.
4. **Same backend, same headers**: `temperature`/`maxTokens` are stored per backend and sent consistently; request shape (roles, separators) fixed per task type.

### B. Side-model inline images (`imageInline`)

- Same static-first shape as A: template rules + examples (static per template) before chat context.
- The lighter `[[img1]]` variant sent to the main model is static text — main prompt caching unaffected.

### C. Memory Books (lorebook injection)

Activated entry sets change with keywords, so position is the whole game:

1. **Default recommendation `at_depth` (late insertion)**: volatile lore goes as near the end of the prompt as possible, so a changed activation set only re-processes the lore block + history tail, not the engine/rules prefix.
2. **`constant` entries are stable**: identical bytes every turn; `before_char`/`after_char` positions are acceptable for them.
3. **Budget drops happen at the END of the lore block**: when over budget, drop the lowest-`order` entries whose content sits closest to the end of the injected block, never splice from the middle.
4. **Entry content is stored text, injected verbatim** — never rewrapped, re-prefixed, or macro-expanded differently between turns.
5. Document the guidance in the UI: volatile lore → `at_depth`; permanent world facts → `constant`.

### D. General (main prompt path)

1. Never move dynamic slots (memory, NPC list, lore, ban list) earlier in the prompt than the Cache Friendly preset already puts them.
2. The dice roll result is volatile by nature — it lives in the `[[dice]]` lead position inside the end-of-prompt envelope, already the cache-safe spot.
3. Removing the 3-second `useMeguminEngine` preset-swap wait (when all tasks are on direct backends) does not change prompt bytes — but a preset swap DOES change the effective prompt, so the "main" backend path keeps swapping only when a task actually needs the engine preset.
4. The token counter, identity stamping, and race guards operate outside prompt content — no cache impact.

## 12. Planned Remake: Dynamic Characters (Cast Generator, merged from a standalone extension)

### Source (read in full from the user's device: `~/Ai/Sillytavern/public/scripts/extensions/third-party/dynamic-characters/`)

A one-shot cast generator (author "gojo", v1.0.0): from a scene opening, an LLM produces a JSON cast (strict format rules, one repair-retry), and the original writes all members into a single "Narrator" ST character card via `/api/characters/create|edit`, then opens a chat with the scene opening as the first user message. Notes from the read:

- Prompt: "character archivist, JSON only" + sheet layout (`Character / Details / Personality / Appearance / Hates / Desires`) + 250-token cap per character + **pre-rolled random appearances** (19 eye colors, ~120 hairstyles, 23 hair colors, weighted breast sizes 45/45/10) assigned to characters in order — appearance comes from RNG, not the model.
- It called `context.ConnectionManagerRequestService.sendRequest(profileId, ...)` — proof that ST exposes per-request profile selection; the remake routes this task through the suite's own Utility Backend system instead.
- Roster was stored in `chat_metadata.dynamicCharactersCast`.
- Slash command `/dynchar [guidance=...]`; settings: profile picker, guidance, temperature (stored but never sent in the original), max tokens (capped 1800).

### Chosen design (user decisions)

- **Cast destination: NPC Bank (native Megumin)** — NOT the original Narrator card. Generated cast becomes regular NPC Bank records: Name, Role, Personality, Appearance fields mapped to the bank's native field list; the random appearance lists also produce Booru tags so Image Gen works immediately. Per-chat storage, field-editor, undo, and dossier updates all apply automatically.
- **Trigger: one-shot Start Scene, faithful to the original** — no mid-chat auto-casting (NPC Bank auto-extract already covers in-story additions).

### Integration into the suite

**STATUS: BUILT (§12).**

1. **Task type #11 `castGenerator`** registered in `UTILITY_TASKS`; routed via `runUtilityGeneration` — per-task maxTokens/temperature ride through `runUtilityGeneration` opts to `meguminDirectChat` (added), falling back to the backend's stored values.
2. **Module** `src/features/castgen/index.js` — BUILT: appearance lists ported verbatim (19 eye colors, ~120 hairstyles, 23 hair colors, weighted sizes 45/45/10), `buildCastGeneratorMessages` in `taskPrompts.js` (strict-JSON rules + sheet layout + assigned appearance lines static; scene + recent chat last per §11), `parseCharacterJson` with fence-strip/endpoint-slice/repair + one retry, `sheetToFieldMap` (Details→background, Personality(+Hates/Desires lines)→personality, Appearance→appearance), `meguminCastGenerate()` flow with identity stamping.
3. **Flow**: Start Scene button (NPCs Bank tab, "Dynamic Characters" panel) and `/dynchar` slash command (`registerCastGenCommand` called from index.js init) → popup asks scene opening (prefilled with guidance) → 10 pre-rolled appearances → utility backend → parse/repair → **each cast member written as an NPC Bank record** with Booru tags built from the SAME position in the assigned-appearance list → roster toast.
4. **No Narrator card creation** — the suite never creates character cards; NPC Bank is the cast store.
5. Settings live on the NPCs Bank tab: guidance box, temperature, max tokens; the backend pick is task #11 in Global Settings.
6. Dedupe: a cast member already in the bank (name match, case-insensitive) is skipped, matching NPC Bank auto-extract behavior.

## 13. Planned Remake: zTracker Blocks (10 new built-in trackers, ported from zTracker)

### Source (user-extracted zTracker content, read in full)

The user extracted the zTracker extension's scene-tracking system and will NOT use zTracker itself — the suite already covers most of it. The extract contains two JSON schemas (`SceneTracker` and `SceneTrackerSurvivalRomanceFullRPG`), a "Scene Tracker Assistant" instruction prompt, and two Handlebars UI templates. The port maps every tracking ITEM onto the suite's single-block architecture (registry entry + template + optional treatment), so each one is pickable/orderable/hideable in the BLOCKS tab like every other block.

### Overlap check (why 10 and not 14)

| zTracker field | Already covered by | Decision |
|---|---|---|
| `bondWithUser` (NPC-only) | **Bonds** block (meters + reasons) | skip — Bonds is richer |
| `internalThoughts` alone | **NPC Inner Chatter** | skip |
| `vitals`, `abilitiesAndSkills`, `equipmentAndTools` | **Character Sheet** (user-definable fields) | skip — add as UI fields, no code |
| time/location alone | **World State** | kept only inside Scene Info (adds topics + precision) |
| per-character Outfit/State/Pose/Hair/Makeup | World State (Outfit/Position only) | NEW as one merged block — splitting re-lists every character name per field (5-person scene = roster ×5 tokens) |
| thoughts + agenda | Chatter (thoughts) / World State (agenda) | NEW as one merged block (same per-name redundancy reason) |

### The 10 new blocks

Independent items (8 single blocks):
1. **Scene Info** — id `sceneInfo`, tag `<Scene_Info>`, trigger `[[sceneInfo]]` — time (HH:MM:SS; MM/DD/YYYY Day), location (specific, no reuse of prior examples), weather (conditions/temp/hazards), topics (primaryTopic 1-2 words | emotionalTone | interactionTheme)
2. **Roster** — id `roster`, tag `<Roster>`, trigger `[[roster]]` — charactersPresent list, one line per name
3. **Checks** — id `checks`, tag `<Checks>`, trigger `[[checks]]` — dndSim port: lock DC (Easy 1-5 / Moderate 6-10 / Hard 11-15 / Extreme 16-20) BEFORE the roll, Delta = Roll-DC, tiers (Crit Success ≥+8 / Success 0..+7 / Near Miss -1..-3 / Failure -4..-7 / Crit Fail ≤-8), format `[Actor] attempts [Action] | DC: X | Roll: Y | Delta: Z | Outcome: Tier — summary`, mechanical terms never leak into prose. Coexists with Dice (true-random); exclusive with nothing
4. **Quests** — id `quests`, tag `<Quests>`, trigger `[[quests]]` — main objective with step n/m, side quests
5. **Morale** — id `morale`, tag `<Morale>`, trigger `[[morale]]` — party resilience (High/Steady/Low/Critical) + unlocked shared secrets
6. **World Event** — id `worldEvent`, tag `<World_Event>`, trigger `[[worldEvent]]` — environmental shifts, off-screen NPC actions
7. **Seeds** — id `seeds`, tag `<Seeds>`, trigger `[[seeds]]` — Chekhov's gun: pending narrative debt, survival hazards, emotional callbacks
8. **GM Notebook** — id `gmNotebook`, tag `<GM_Notebook>`, trigger `[[gmNotebook]]` — persistent notes prefixed `[R]` rules / `[T]` threads / `[D]` debug, max 20 entries

Per-character items (2 merged blocks):
9. **Character State** — id `charState`, tag `<Character_State>`, trigger `[[charState]]` — per character: outfit (complete, underwear always included; explicit "No bra"/"No panties" when missing; undressed = list entire outfit), stateOfDress (put-together → disheveled; where discarded items are), postureAndInteraction, optional hair + makeup. Strict player agency: {{user}}'s card carries only what a camera would catch — never thoughts, agendas, or internal state
10. **NPC Mind** — id `npcMind`, tag `<NPC_Mind>`, trigger `[[npcMind]]` — per NPC ONLY: internalThoughts (first-person unmasked monologue reacting to the scene) + internalAgenda (immediate goal/tactic, e.g. "Defuse tension", "Gain leverage", "Hide vulnerability"). {{user}} never appears in this block

### Shared rules baked into every template

- Default assumptions for missing info (reasonable defaults from prior entries/context; never plain zeros for vitals-style fields)
- Incremental time progression (seconds/minutes per update, no jumps unless the story states one)
- Time context-appropriate (public venues inside operating hours)
- Topics are 1-2 word keywords, never phrases
- Full block every turn, even for minor changes
- N/A convention for anything the player's agency forbids

### Implementation map (follows the existing block pipeline exactly)

**STATUS: BUILT.** All 8 touchpoints implemented and verified (syntax + full pipeline checks pass).

1. **Templates** → `data/blocks.js`: 10 new entries `{ id, label, trigger, content }` — DONE (scene_info, roster, checks, quests, morale, world_event, seeds, gm_notebook, char_state, npc_mind)
2. **Registry** → `src/features/blocks/registry.js`: 10 new `MEGUMIN_BLOCK_REGISTRY` entries with `{ id, tag, label, desc, emoji, icon, color, visibility: "open", builtin: true, source: "[[...]]", legacyIds }` — no `system: true` (user-arrangeable) — DONE
3. **Slot registry** → `data/slots.js`: 10 new `[[trigger]]` entries (scope shared, carrier blocks, `GATE.block(id)` gates, `blockText()` fallbacks) + 10 `[[trigger2]]` twins added to `meguminAllSlotTriggers()` — DONE
4. **Dict fill** → `src/engine/buildBaseDict.js`: Stage 5 loop fills `dict[trigger] = content` from `hardcodedLogic.blocks` automatically; the 10 `[[trigger2]]` alias fills added alongside `[[infoblock2]]` etc. — DONE
5. **Injection blanking** → `src/engine/injection.js:311`: all 20 tags (10 triggers + 10 twins) added to the envelope blanking list — DONE
6. **Treatments** — not built (v1 ships prose fallback by design; parsers can come later in `src/blocks/treatments.js`, every parser returns `null` on doubt)
7. **Token counter** → static templates count like `[[infoblock]]` (correct: they cost tokens every turn); no exclusion added — verified decision
8. **Chat cleaner** → not needed (envelope strips block tags from history)

### Out of scope for this port

- The Handlebars/CSS UI templates (the suite renders its own card UI via treatments — no HTML comes back from the model)
- The JSON schemas themselves (the suite's envelope is tag-based, not JSON; the schemas only informed field semantics)
- The zTracker survival-flavor extras already covered by Sheet fields (vitals labels), Bonds (bond math), Dice (rolls)
