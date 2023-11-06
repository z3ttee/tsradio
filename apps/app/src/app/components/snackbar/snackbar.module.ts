import { OverlayModule } from "@angular/cdk/overlay";
import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TSASnackbarContainerComponent } from "./components/snackbar-container/snackbar-container.component";
import { TSASnackbarComponent } from "./components/snackbar/snackbar.component";
import { NGSButtonModule } from "../button";

@NgModule({
  declarations: [TSASnackbarContainerComponent, TSASnackbarComponent],
  imports: [OverlayModule, PortalModule, CommonModule, NGSButtonModule]
})
export class TSASnackbarModule {}
