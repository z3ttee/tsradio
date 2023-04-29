import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminChannelIndexViewComponent } from "./views/channel-index/channel.component";
import { NGSLoaderComponent } from "src/app/components/loader";
import { NGSButtonModule } from "src/app/components/button";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { ChannelEditorDialogComponent } from "src/app/dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { AdminChannelInfoViewComponent } from "./views/channel-info/channel-info.component";
import { NgIconsModule } from "@ng-icons/core";
import { heroTrash } from "@ng-icons/heroicons/outline";
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ArtworkComponent } from "src/app/components/artwork/artwork.component";

const routes: Routes = [
    { path: "", component: AdminChannelIndexViewComponent },
    { path: ":channelId", component: AdminChannelInfoViewComponent }
]

@NgModule({
    declarations: [
        AdminChannelIndexViewComponent,
        AdminChannelInfoViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatDialogModule,
        ChannelEditorDialogComponent,
        NGSLoaderComponent,
        NGSButtonModule,
        ScrollingModule,
        MatSnackBarModule,
        ArtworkComponent,
        NgIconsModule.withIcons({ heroTrash })
    ]
})
export class AdminChannelsModule {}