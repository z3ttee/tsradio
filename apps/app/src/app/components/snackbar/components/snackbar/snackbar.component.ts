import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { TSASnackbarRef } from "../../entities/snackbar";
import { TSA_SNACKBAR_CONFIG } from "../../constants";
import { TSASnackbarConfig } from "../../config";

@Component({
  templateUrl: "./snackbar.component.html",
  styleUrls: ["./snackbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TSASnackbarComponent {
  constructor(
    public readonly snackbarRef: TSASnackbarRef<TSASnackbarComponent>,
    @Inject(TSA_SNACKBAR_CONFIG) public readonly config: TSASnackbarConfig
  ) {}
}
