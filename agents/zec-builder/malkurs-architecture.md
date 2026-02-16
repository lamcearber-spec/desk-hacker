# MalKurs Technical Architecture

## 1. Tech Stack Recommendation: Flutter

**Reasoning:**
For a drawing application heavily reliant on custom UI, graphics rendering, and potentially real-time interaction, Flutter is the superior choice over React Native. Its use of the Skia rendering engine allows for excellent performance and pixel-perfect custom UIs across both iOS and Android from a single codebase. This is crucial for delivering a smooth and responsive drawing experience. While React Native has a larger developer community, Flutter's technical advantages for graphic-intensive applications make it more suitable for MalKurs's core features.

## 2. MVP Scope Definition

### v1.0 (Essential)

The focus of v1.0 is to deliver the core drawing lesson experience and fundamental AI personalization.

**Core Drawing Lessons:**
*   **Age 5-6: Foundation** curriculum (Lines, Basic shapes, Combining shapes, Simple animals, Primary colors, Basic mixing, Tracing, Connect-the-dots).
*   **Age 7-8: Building Skills** curriculum (Proportions basics, Animals with more detail, Secondary colors, Warm vs cool, Basic shading, Texture adding).
*   **Step-by-step instructions:** Clear visual and German voice guidance for each drawing step.
*   **Basic drawing tools:** Pen, eraser, basic color palette.

**AI Personalization (Minimum Viable):**
*   **Skill assessment:** Simple initial test (e.g., drawing basic shapes) to place the kid in the right starting level.
*   **Interest tracking:** Basic mechanism to track preferred drawing themes (e.g., dinosaurs, animals) to surface relevant lessons.
*   **Adaptive difficulty (basic):** If a child struggles on a specific lesson after multiple attempts, recommend a simpler related lesson.
*   **German TTS voice instructions:** For all lesson steps.

**Parent-Friendly Features:**
*   **Basic profile management:** Create/manage child profiles.
*   **Progress tracking:** Simple overview of completed lessons per child.
*   **No ads, no surprises.**

**Technical Foundation:**
*   User authentication (e.g., email/password or simple parent PIN).
*   Backend for storing user data, curriculum progress, and AI recommendations.

**Platform:**
*   Tablet-optimized for both iOS and Android.

### v1.1 (Next Iteration / Enhanced Features)

v1.1 will build upon the v1.0 foundation, adding more curriculum, advanced AI, and key differentiators.

**Expanded Curriculum:**
*   **Age 9-10: Advanced** curriculum (Realistic animals, Human figures, Facial expressions, Perspective basics, Scene composition, Complementary colors, Gradients).
*   **Special Modules:** Seasonal/Holiday and Theme Packs (e.g., Dinosaurs, Ocean animals).

**Enhanced AI Personalization:**
*   **Improved Adaptive Difficulty:** More granular tracking of strengths/weaknesses and tailored lesson suggestions.
*   **Basic Drawing Analysis:** AI attempts to check if a simple drawing matches the lesson outlines (e.g., counts shapes, checks for major discrepancies).
*   **Weakness targeting:** Specifically recommend exercises for identified areas of struggle (e.g., if AI detects difficulty with circles, suggest circle-focused lessons).

**Key Differentiators:**
*   **PDF Export:** Export completed lessons and blank practice sheets as PDFs (printable worksheets).
*   **Color Mixing Lessons:** Dedicated interactive modules for color theory (color wheel, warm/cool).
*   **Technique Modules:** Initial modules for Shading & Shadows, Basic Perspective, Textures.

**Social/Engagement:**
*   Daily drawing prompts.

## 3. Development Timeline Estimate (Weeks)

This estimate assumes a dedicated team (e.g., 1-2 Flutter developers, 0.5 backend/AI specialist, 0.5 UI/UX designer). It does not include market research, curriculum design (which is drafted), or App Store submission processes.

*   **Phase 1: Foundation (v1.0 Core)**
    *   **Setup & Infrastructure:** 1 week (Flutter project setup, backend boilerplate, CI/CD).
    *   **Core Drawing Canvas & Tools:** 3 weeks (implementing responsive drawing canvas, pen, eraser, color picker).
    *   **Curriculum Integration (Age 5-8):** 4 weeks (implementing lessons, step-by-step UI, voice instructions).
    *   **Basic AI Personalization (Skill Assessment, Interest, Basic Adaptive):** 3 weeks.
    *   **Parent Features & User Management:** 2 weeks.
    *   **Testing & Bug Fixing:** 3 weeks.
    *   **Total v1.0:** **16 weeks**

*   **Phase 2: Enhancements (v1.1)**
    *   **Advanced Curriculum Integration (Age 9-10, Special Modules):** 4 weeks.
    *   **PDF Export Feature:** 3 weeks (researching/implementing robust PDF generation).
    *   **Color Mixing & Technique Modules:** 4 weeks (interactive UI, lesson content).
    *   **Enhanced AI (Drawing Analysis, Weakness Targeting):** 5 weeks (significant R&D and implementation).
    *   **Daily Prompts:** 1 week.
    *   **Integration Testing & Refinement:** 3 weeks.
    *   **Total v1.1:** **20 weeks**

**Overall Estimated Development Time (v1.0 + v1.1): ~36 weeks (approx. 9 months)**

**Note:** The AI drawing analysis and advanced technique modules are the most complex and could significantly impact the timeline depending on the desired level of sophistication and underlying AI model availability/integration.
