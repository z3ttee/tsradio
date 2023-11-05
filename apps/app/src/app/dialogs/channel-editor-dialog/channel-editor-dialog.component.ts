import { ChangeDetectionStrategy, Component, DestroyRef, Inject, inject, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from "@angular/common";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { Observable } from "rxjs";
import { NGSButtonModule } from "../../components/button";
import { Channel, SDKChannelModule, SDKChannelService } from "../../sdk/channel";
import { NGSButtonEvent } from "../../components/button/types";
import { Future } from "../../utils/future";
import { TSRError } from "../../components";
import { ApiError } from "../../utils/error/api-error";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isNull } from "@tsa/utilities";

@Component({
    standalone: true,
    templateUrl: "./channel-editor-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TSRError,
        MatDialogModule,
        NGSButtonModule,
        MatInputModule,
        MatSlideToggleModule,
        SDKChannelModule,
    ]
})
export class ChannelEditorDialogComponent {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _fb = inject(FormBuilder);
    protected readonly _latestError = signal<ApiError | null>(null);

    constructor(
        private readonly service: SDKChannelService,
        private readonly builder: FormBuilder,
        private readonly dialogRef: MatDialogRef<ChannelEditorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public readonly data?: Channel
    ) {}

    protected readonly _channelForm = this.builder.group({
        name: this._fb.control<string | null>(this.data?.name ?? null, [Validators.required, Validators.minLength(3), Validators.maxLength(64)]),
        description: this._fb.control<string | null>(this.data?.description ?? null, [Validators.minLength(3), Validators.maxLength(254)]),
        enabled: this._fb.control<boolean>(this.data?.enabled ?? true),
        featured: this._fb.control<boolean>(this.data?.featured ?? false),
    });

    public saveChannel(event: NGSButtonEvent) {
        this._latestError.set(null);

        if(!this._channelForm.valid) {
            event.done();
            return;
        }

        let request: Observable<Future<Channel>> = null;

        if(isNull(this.data)) {
            request = this.service.createIfNotExists({
                name: this._channelForm.get("name").value,
                description: this._channelForm.get("description").value,
                enabled: this._channelForm.get("enabled").value,
                featured: this._channelForm.get("featured").value,
            });
        } else {
            request = this.service.updateById(this.data?.id, {
                name: this._channelForm.get("name").value,
                description: this._channelForm.get("description").value,
                enabled: this._channelForm.get("enabled").value,
                featured: this._channelForm.get("featured").value,
            });
        }

        request.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((channel) => {
            if(channel.loading) return;
            if(channel.error) {
                this._latestError.set(channel.error ?? null);
            } else {
                this.dialogRef.close(channel);
            }
            event.done();
        });
    }
}