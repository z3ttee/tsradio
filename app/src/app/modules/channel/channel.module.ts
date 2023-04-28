import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChannelIndexViewComponent } from "./views/channel-index/channel.component";

const routes: Routes = [
    { path: "", component: ChannelIndexViewComponent }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class ChannelModule {

}