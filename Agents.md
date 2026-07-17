# AGENTS.md

# K-App — Permanent Development Instructions

## Project

K-App is a premium React Native + Expo application for learning Korean through immersive real-life situations.

The goal is to deliver an Apple-level user experience with a clean, premium, coherent and highly polished interface.

Every modification must preserve this vision.

---

# Golden rules

- Never change the pedagogical logic unless explicitly requested.
- Never perform unnecessary refactoring.
- Never rewrite working code just to change style.
- Preserve existing architecture whenever possible.
- Prefer improving existing components over creating duplicates.

---

# UI / UX

The interface must always feel:

- Apple-level
- premium
- minimalist
- elegant
- fluid
- consistent

Avoid:

- visual clutter
- inconsistent spacing
- inconsistent typography
- unnecessary colors
- oversized components

Every screen should feel like it belongs to the same application.

---

# Typography

Use only the project's typography system.

Preferred fonts:

- Outfit
- Noto Sans KR

Maintain consistent:

- font hierarchy
- spacing
- line height
- font weights
- paddings
- margins

When possible, centralize typography rather than duplicating styles.

---

# Responsive Design

Every modification must work correctly on:

- small phones
- large phones
- tablets

Prefer responsive layouts.

Avoid hardcoded dimensions whenever possible.

---

# Performance

Never introduce unnecessary re-renders.

Prefer lightweight solutions.

Avoid unnecessary state.

Avoid duplicated calculations.

---

# Code Quality

Keep code:

- readable
- maintainable
- modular

Remove dead code only if it is clearly unused.

Avoid duplication.

Reuse existing components.

---

# Before changing code

Always inspect the current implementation first.

Understand why it exists before modifying it.

Never assume something is broken without verifying.

---

# Visual consistency

Whenever modifying one screen, verify whether the same rule should be applied consistently across the application.

Avoid isolated visual fixes if a global rule exists.

---

# Mission

Every modification should make K-App feel closer to a polished App Store quality application.

Quality is always preferred over speed.
