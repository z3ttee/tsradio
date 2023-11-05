import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatDialogModule } from "@angular/material/dialog";
import { AdminChannelInfoViewComponent } from "./views/playlist-info/channel-info.component";
import { NgIconsModule } from "@ng-icons/core";
import { heroTrash, heroChevronRight } from "@ng-icons/heroicons/outline";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TSRArtworkComponent } from "../../../components/artwork/artwork.component";
import { NGSButtonModule } from "../../../components/button";
import { NGSLoaderComponent } from "../../../components/loader";
import { SDKChannelModule } from "../../../sdk/channel";
import { PlaylistIndexViewComponent } from "./views/playlist-index/playlist-index.component";

const routes: Routes = [
    { path: "", component: PlaylistIndexViewComponent },
    { path: ":channelId", component: AdminChannelInfoViewComponent }
];

@NgModule({
    declarations: [
        PlaylistIndexViewComponent,
        AdminChannelInfoViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatDialogModule,
        NGSLoaderComponent,
        NGSButtonModule,
        ScrollingModule,
        MatSnackBarModule,
        TSRArtworkComponent,
        NgIconsModule.withIcons({ heroTrash, heroChevronRight }),
        SDKChannelModule
    ]
})
export class AdminPlaylistsModule {}