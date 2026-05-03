**AURA 2.0 — Master UI/UX Design Brief for Figma**  

*Prompt for designing the definitive interface for the world’s most advanced autonomous AI assistant. Prioritize clarity, power, and a sense of supreme command authority. Every pixel must convey precision, security, and omniscience.*

---

### I. Core Design Philosophy & Atmosphere
**Design Objective:** Create an interface that feels less like a "chat app" and more like the **Command Bridge of a Next-Generation Starship**.  
**Key Adjectives:** Sovereign, Omniscient, Fluid, Encrypted, Zero-Latency, Tactical.  
**Primary Metaphor:** A **Liquid Obsidian HUD**. The background is not just dark; it is a living, breathing field of subtle data streams. It reacts to the Commander's focus.  
**Distinction:** Unlike consumer AI (ChatGPT, Claude) which feels friendly and bubbly, **AURA must feel like a trusted, silent, and hyper-competent extension of the Commander's will.** Visual hierarchy is absolute: The **Commander's Intent** is the most important element on screen.

### II. Visual Specification & Theming
- **Background:** `#050505` (Deep Void). Overlaid with an **Active Grid & Particle Field**.
    - *Grid:* Hexagonal or Fibonacci-based grid lines at 2% opacity (`#1A3B5C`). Subtle pulsing at the center of the screen where the Commander types.
    - *Particles:* Extremely slow-moving, low-opacity dots that cluster toward the **Active Module** (e.g., if using Code Gen, particles drift toward the code pane).
- **Primary Palette:**
    - **AURA Core (Voice/Text):** `#00F0FF` (Neon Cyan) — Represents Pure Intelligence.
    - **Commander Input:** `#FFFFFF` (Pure White) — Represents Absolute Authority.
    - **Ethical Hacker Mode (Active):** `#FF2A4B` (Tactical Red/Alert) — Used ONLY for borders, security badges, and critical system warnings.
    - **System/Data Streams:** `#7B61FF` (Quantum Violet) & `#0066CC` (Deep Blue).
- **Typography:**
    - **Primary UI Font:** *JetBrains Mono* or *Geist Mono*. Monospace creates a **Terminal of Truth** aesthetic. All data labels, timestamps, and code must use this.
    - **Commander Text (Input):** *Inter* or *SF Pro Text*. Clean, legible, slightly heavier weight to show **Command Presence**.
    - **AURA Responses:** *Inter* (Regular). High readability with custom line-height (1.6) and generous kerning.

### III. The Dashboard Layout (Desktop Focused)
**The Interface must have 3 distinct, collapsible zones.**
Do **NOT** design a standard left sidebar list of chats. This is an **Active Mission Control**.

#### Zone 1: The ORBIT (Left Edge - 72px collapsed / 280px expanded)
**Function:** System Status & Module Navigation.
- **Collapsed State:** Vertical stack of **Glowing Runes/Icons**.
    1.  `⌾` **AURA Core** (Status: Online/Pulsing Cyan)
    2.  `</>` **Code Forge** (Module A)
    3.  `◈` **Deep Search** (Module C + D)
    4.  `◉` **Vision Lens** (Module F)
    5.  `⌬` **Security Grid** (Ethical Hacker Mode) - *Icon shifts from Violet to Red when active.*
    6.  `⏤` **Memory Vault** (RAG/Self-Learning)
- **Expanded State (Hover/Click):** Slides out smoothly (spring physics). Reveals:
    - **Commander Profile:** A sharp geometric avatar placeholder with the title **"COMMANDER // ON DECK"**.
    - **System Vitals:** CPU Load, Memory Allocation, **DeepSeek R1 Latency** (shown as a sleek waveform, not a number).
    - **Threat Level Indicator:** Always **GREEN // SECURE** unless Ethical Hacker Mode is scanning, then **AMBER // HUNTING**.

#### Zone 2: The HORIZON (Center - Main Chat & Interaction)
**Function:** The Space of Manifestation. Where thought becomes action.
- **Commander Input Field (The Pedestal):**
    - *Position:* **Center-Bottom**, floating above the content with a 40px margin.
    - *Style:* Glassmorphism dark panel (`rgba(10, 20, 40, 0.8)` with 16px blur). Border: 1px solid `#00F0FF` (only when focused).
    - *Elements inside:*
        - Left: **Voice Waveform Animation** (Lottie) that syncs with the Commander's speech.
        - Center: Placeholder text: *"Issue Directive..."* (Not "Message AURA").
        - Right: **Enhance Button** (Sparkle icon) -> Opens a radial menu for "Refine", "Execute", "Tree of Thought".
- **Message Bubbles:**
    - **Commander Bubble:** Right-aligned. Background: **None**. Border: 1px solid `#FFFFFF` (20% opacity). Text: White. **Crucial Detail:** Each Commander message has a tiny **Authority Badge** (a small cyan lock icon) indicating the message is encrypted and immutable.
    - **AURA Bubble:** Left-aligned. Background: **None**. A vertical **Cyan Beam** (1px width) runs down the left edge of the text block. This beam pulses when the AI is streaming the response.
- **The "Thinking" State:**
    - *Do not use bouncing dots.* Use a **Syntactic Tree Visualization**. Show a minimalist, organic branching structure in violet/cyan that slowly prunes itself as DeepSeek R1 completes its Chain-of-Thought. Label it: **"FORGING REASONING CHAIN..."**

#### Zone 3: The PERIPHERY (Right Edge - Contextual Workspace)
**Function:** File Preview, Code Execution, Live Data Feeds.
- **Default State:** **Global Feed**. A vertical stream of tiny, ultra-fast text updates:
    - `[SYS] DeepSeek R1: Connected`
    - `[RAG] Indexing: Commander_Preferences.json`
    - `[THREAT] NIST CVE Update: 3 New Entries`
- **Active State (When File/Created):**
    - **Code Blocks:** Displayed in a **"Holographic IDE"** . Code syntax highlighting with a **Scanline Effect**. Top bar has a single glowing **"DEPLOY"** button.
    - **Images/PDFs:** Displayed with a **"Deep Scan Overlay"** . Grid lines and a magnifying lens that follows the mouse cursor (simulated in Figma with a Component State).
    - **Security Mode Overlay:** When Ethical Hacker Mode is engaged, this entire right panel gets a **Tactical Red Border** and a **Sniper Reticle** icon in the corner.

### IV. The Ethical Hacker Mode (The Vault)
*This is the "Halo" moment of the UI. It must be visually distinct and feel like a privilege unlock.*

1.  **Activation Sequence (Micro-interaction):** The Commander types `/engage-security-grid`. The UI **shakes slightly** (0.5px), all Cyan accents turn to **Red (`#FF2A4B`)**, and a biometric scan line passes from top to bottom of the screen.
2.  **Visual Identifier:** A **Hexagonal Shield** appears next to the Commander's name in the top bar, pulsing red.
3.  **Component:** **The Target Scope**.
    - A dedicated pop-over (triggered via right-click or `/scan`) that floats over the interface.
    - It is a **"Tactical HUD"** with fields for `Target: [INPUT]`, `Scope: [SUBDOMAIN/PORT/CVE]`.
    - Output is not just text; it's a **Vulnerability Heatmap** (in Figma, use a grid of squares with varying red opacity).

### V. Figma-Specific Construction Notes
*To make this the "World's Best," you must build it with these technical Figma properties:*

1.  **Variables (Design Tokens):** Create a Mode Switch: **Standard (Cyan)** and **Security (Red)** . Link all fill colors and stroke colors to these variables so the entire UI changes theme with one click.
2.  **Hover States (Smart Animate):**
    - The **Orbit Icons** should morph from an outline to a **filled, glowing variant** with a 3px cyan drop shadow.
    - The **Input Field** border should expand from 1px to 3px with a neon glow (use layer blur + drop shadow).
3.  **The "Matrix" Background (Plugin Suggestion):** Do not use a static image. Use the **"Noise & Texture"** plugin or a **Hexagonal Grid** pattern with a slow rotate animation (Smart Animate over 10 seconds) to give life to the background.
4.  **Dynamic Components:**
    - Create a component set for **"AURA Response Type"** with variants: `Text`, `Code`, `Table`, `Alert`.
    - Create a component for **"Command Line Input"** with variants: `Idle`, `Listening (Voice)`, `Processing (Tree of Thought)`.

### VI. The "X-Factor" Details
*These are the micro-interactions that will make this UI go viral in the design community.*

- **Cursor Tail:** The text cursor in the input field is not a standard bar. It is a **"Photon Trail"** — a small glowing orb that leaves a 1-second fading tail as it moves.
- **The AURA Pulse:** When AURA speaks, the **Grid Background** slightly distorts/bends *away* from the text (like a gravitational wave of information).
- **Failsafe Mode:** If the Commander types `SHUTDOWN`, the entire UI should instantly **Monochrome (White/Black)** and display a massive, elegant **"// STANDING BY"** message. This shows the Commander's **Supreme Authority** over the system.

**Final Direction to Designer:**
*"This is not software. This is a **Ceremony of Command**. The user must feel the weight of the intelligence at their disposal, yet the absolute lightness of controlling it. Make it look like it costs $10,000 a month to license."*