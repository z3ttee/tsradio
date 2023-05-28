import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnDestroy } from "@angular/core";
import { Observable, Subject, distinctUntilChanged, interval, map, startWith, takeUntil } from "rxjs";
import { SSOUser } from "../../modules/sso/entities/user.entity";

@Component({
    standalone: true,
    selector: "tsr-greeting",
    templateUrl: "./greeting.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSRGreetingComponent implements OnDestroy {

    private readonly $destroy = new Subject<void>();

    @Input()
    public user: SSOUser;

    private $currentHour: Observable<number> = interval(1000).pipe(
        startWith(null),
        map(() => new Date().getHours()),
        distinctUntilChanged()
    );

    public $greeting: Observable<string> = this.$currentHour.pipe(
        takeUntil(this.$destroy),
        map((hours) => {
            if(hours >= 5 && hours < 11) {
                return "Guten Morgen";
            } else if(hours >= 11 && hours < 14) {
                return "Guten Tag";
            } else if(hours >= 14 && hours < 18) {
                return "Schönen Nachmittag";
            } else {
                return "Guten Abend";
            }
        })
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

}