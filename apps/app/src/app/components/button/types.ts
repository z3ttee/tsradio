import { Subject } from "rxjs";

export type TSAButtonSize = "sm" | "default" | "lg";
export type TSAButtonColor = "info" | "warn" | "error" | "accent" | "primary" | "primary_inverted" | "success";
export class TSAButtonEvent {
  private readonly timeout: ReturnType<typeof setTimeout>;

  constructor(private readonly spinnerSubject?: Subject<void>) {
    this.timeout = setTimeout(() => {
      this.done();
    }, 8000);
  }

  public done(): void {
    this.spinnerSubject?.next();
    this.spinnerSubject?.complete();
    clearTimeout(this.timeout);
  }
}
