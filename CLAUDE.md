# FIGMA SOURCE OF TRUTH

Primary design file:

https://www.figma.com/design/K43I2D7c3xgt1ZiF6lY1Yq/Skinstric?node-id=0-1&m=dev&t=UO3q6jaWalsXzliK-1

This Figma file is the primary source of truth.

Before implementing any new page or feature:

1. Inspect the Figma file.
2. Read dimensions, spacing, typography, and hierarchy.
3. Inspect existing project files.
4. Inspect live references.
5. Then implement.

Never guess sizes if they are available in Figma.

---

# LIVE REFERENCES

Landing

https://skinstric-wandag.vercel.app/

Testing

https://skinstric-wandag.vercel.app/testing

Camera

https://skinstric-wandag.vercel.app/camera

Camera Capture

https://skinstric-wandag.vercel.app/camera/capture

Result

https://skinstric-wandag.vercel.app/result

Select

https://skinstric-wandag.vercel.app/select

Summary

https://skinstric-wandag.vercel.app/summary

These pages are the secondary source of truth.

---

# IMPLEMENTATION ORDER

Always follow this order:

1. Existing codebase
2. Figma
3. Live reference
4. Build feature

Never redesign pages.

---

# BUTTONS

## ABSOLUTE RULE

Buttons are finished.

Buttons are approved.

Buttons are considered locked.

DO NOT:

* modify button components
* modify button icons
* modify button SVGs
* modify button PNGs
* modify button colors
* modify button borders
* modify button spacing
* modify button typography
* modify button size
* modify button alignment
* modify button hover states
* modify button animations
* refactor button code

Always reuse existing button components.

Only change click handlers when navigation requires it.

Before every commit:

Verify the diff contains no unintended button changes.

---

# PAGE CONSTRUCTION

Before creating a new page:

* Read existing page files.
* Reuse shared components.
* Match the established design system.
* Match Figma dimensions whenever available.
* Match live reference proportions.

---

# SCALE RULES

If something appears too small:

Do not assume.

Check Figma first.

Examples:

* icons
* diamonds
* rectangles
* spacing
* typography
* labels

Prefer Figma dimensions over guesses.

---

# PRIORITIES

1. Functionality must work.
2. Existing buttons must remain untouched.
3. Figma dimensions override assumptions.
4. Live references should feel nearly identical.
5. Modern refinements are allowed if they preserve the Skinstric aesthetic.
6. Avoid unnecessary redesigns.
