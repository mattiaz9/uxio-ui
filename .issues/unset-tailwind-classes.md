---
title: Unset Tailwind Classes
---

2 options:

- don't use \*-uxio.css to merge base classes, but replace them all together (simpler) - required to
  copy all classes from the parent stylesheet to the new one
- create a custom directive @uset to remove classes from parent stylesheet (more complex)

Right now:

- classes from `style-<name>.css` are merged with classes from `style-<name>-uxio.css`
- parent classes might conflict with base classes
- we don't won't to edit directly the parent stylesheet, which must be identical to the shadcn one
