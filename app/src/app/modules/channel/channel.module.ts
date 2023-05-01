import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChannelIndexViewComponent } from "./views/channel-index/channel.component";
import { TSRChannelModule } from "src/app/sdk/channel";
import { TSRArtworkComponent } from "src/app/components/artwork/artwork.component";

const routes: Routes = [
    { path: "", component: ChannelIndexViewComponent }
]

@NgModule({
    declarations: [
        ChannelIndexViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TSRChannelModule,
        TSRArtworkComponent
    ]
})
export class ChannelModule {

}