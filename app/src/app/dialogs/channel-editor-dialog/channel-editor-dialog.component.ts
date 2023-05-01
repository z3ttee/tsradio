import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NGSButtonModule } from "src/app/components/button";
import { NGSButtonEvent } from "src/app/components/button/types";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from "@angular/common";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { Observable, Subject, takeUntil } from "rxjs";
import { isNull } from "@soundcore/common";
import { Future } from "src/app/utils/future";
import { Channel, TSRChannelModule, TSRChannelService } from "src/app/sdk/channel";

@Component({
    standalone: true,
    templateUrl: "./channel-editor-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatDialogModule,
        NGSButtonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSlideToggleModule,
        NgxMatColorPickerModule,
        TSRChannelModule
    ],
    providers: [
        { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
    ],
})
export class ChannelEditorDialogComponent implements OnDestroy {

    private readonly $destroy = new Subject<void>();

    public errorMessage: string = null;

    constructor(
        private readonly service: TSRChannelService,
        private readonly builder: FormBuilder,
        private readonly cdr: ChangeDetectorRef,
        private readonly dialogRef: MatDialogRef<ChannelEditorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly data?: Channel
    ) {}

    public readonly form = this.builder.group({
        name: [this.data?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]],
        description: [this.data?.description ?? '', [Validators.maxLength(254)]],
        enabled: [this.data?.enabled ?? true],
        featured: [this.data?.featured ?? false],
    })

    public saveChannel(event: NGSButtonEvent) {
        this.setError(null);

        if(!this.form.valid) {
            event.done();
            return;
        }

        let request: Observable<Future<Channel>> = null;

        if(isNull(this.data)) {
            request = this.service.createIfNotExists({
                name: this.form.get("name").value,
                description: this.form.get("description").value,
                enabled: this.form.get("enabled").value,
                featured: this.form.get("featured").value,
            });
        } else {
            request = this.service.updateById(this.data?.id, {
                name: this.form.get("name").value,
                description: this.form.get("description").value,
                enabled: this.form.get("enabled").value,
                featured: this.form.get("featured").value,
            })
        }

        request.pipe(takeUntil(this.$destroy)).subscribe((channel) => {
            if(channel.loading) return;
            if(channel.error) {
                this.setError(channel.error.message);
            } else {
                this.dialogRef.close(channel);
            }
            event.done();
        });
    }

    private setError(message: string | null) {
        this.errorMessage = message;
        this.cdr.detectChanges();
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

}