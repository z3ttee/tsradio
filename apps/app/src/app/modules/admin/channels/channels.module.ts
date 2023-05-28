import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminChannelIndexViewComponent } from "./views/channel-index/channel.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatDialogModule } from "@angular/material/dialog";
import { AdminChannelInfoViewComponent } from "./views/channel-info/channel-info.component";
import { NgIconsModule } from "@ng-icons/core";
import { heroTrash, heroChevronRight } from "@ng-icons/heroicons/outline";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChannelEditorDialogComponent } from "../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { TSRArtworkComponent } from "../../../components/artwork/artwork.component";
import { NGSButtonModule } from "../../../components/button";
import { NGSLoaderComponent } from "../../../components/loader";
import { TSRChannelModule } from "../../../sdk/channel";

const routes: Routes = [
    { path: "", component: AdminChannelIndexViewComponent },
    { path: ":channelId", component: AdminChannelInfoViewComponent }
];

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
        TSRArtworkComponent,
        NgIconsModule.withIcons({ heroTrash, heroChevronRight }),
        TSRChannelModule
    ]
})
export class AdminChannelsModule {}