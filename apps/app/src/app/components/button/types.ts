import { Subject } from "rxjs";

export type NGSButtonSize = "sm" | "base" | "lg";
export class NGSButtonEvent {    
    private readonly timeout: ReturnType<typeof setTimeout>;

    constructor(
        private readonly spinnerSubject?: Subject<void>
    ) {
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