import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { AdminLayoutComponent } from "./admin-layout.component";
import { heroSignalSolid } from "@ng-icons/heroicons/solid";
import { heroRectangleGroup } from "@ng-icons/heroicons/outline";
import { NavListItemComponent } from "../../components/nav-list-item/nav-list-item.component";
import { TSRHeaderComponent } from "../../components/header";

@NgModule({
    declarations: [
        AdminLayoutComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        NgIconsModule.withIcons({ heroSignalSolid, heroRectangleGroup }),
        NavListItemComponent,
        TSRHeaderComponent
    ],
    exports: [
        AdminLayoutComponent
    ]
})
export class AdminLayoutModule {}