import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeViewComponent } from "./views/home-view/home.component";
import { TSRChannelModule } from "../../sdk/channel";
import { TSRArtworkComponent } from "../../components/artwork/artwork.component";

const routes: Routes = [
    { path: "", component: HomeViewComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TSRChannelModule,
        TSRArtworkComponent
    ]
})
export class HomeModule {

}