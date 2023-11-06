import { AnimationTriggerMetadata, animate, state, style, transition, trigger } from "@angular/animations";

export const tsaSnackbarAnimation: {
  readonly snackbarState: AnimationTriggerMetadata;
} = {
  /** Animation that shows and hides a snack bar. */
  snackbarState: trigger("state", [
    state(
      "void, hidden",
      style({
        transform: "translateY(20px)",
        opacity: 0
      })
    ),
    state(
      "visible",
      style({
        transform: "translateY(0px)",
        opacity: 1
      })
    ),
    transition("* => visible", animate("150ms cubic-bezier(0, 0, 0.2, 1)")),
    transition(
      "* => void, * => hidden",
      animate(
        "75ms cubic-bezier(0.4, 0.0, 1, 1)",
        style({
          transform: "translateY(20px)",
          opacity: 0
        })
      )
    )
  ])
};
