# NGS Snackbar

## Usage

To use snackbars in your components, you must import the `NGSSnackbarModule` (`import { NGSSnackbarModule } from '@cockroaches/ui';`). Please see the following examples:
`my-module.module.ts`

```typescript
import { NGSSnackbarModule } from '@cockroaches/ui';

@NgModule({
    imports: [
        NGSSnackbarModule
        // ...
    ],
    // ...
})
export class MyModule { }
```

This will expose the `NGSSnackbars` provider which is used to create snackbars. Follow the below example to see how it is used in your
components:

`my-component.component.ts`

```typescript
import { NGSSnackbars } from '../../../../components/snackbar';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'my-component',
    templateUrl: 'my-component.component.html',
    styleUrls: ['./my-component.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyIndexViewComponent {

    constructor(
        // Import the snackbar builder
        private readonly snackbar: NGSSnackbars,
        // ...
    ) {}

}
```

Now you can create new snackbars like this:

```typescript
import { NGSSnackbars } from '../../../../components/snackbar';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'my-component',
    templateUrl: 'my-component.component.html',
    styleUrls: ['./my-component.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyIndexViewComponent {

    constructor(
        // Import the snackbar builder
        private readonly snackbar: NGSSnackbars,
        // ...
    ) {}

    public createSnackbar(): void {
        // Show a snackbar with content "Test"
        this.snackbar.message("Test").open();

        // Show a snackbar with content "Test" for 5000 milliseconds (this 
        // is also the default for every snackbar)
        this.snackbar.message("Test").duration(5000).open();

        // Show a snackbar with content "Test" and register an action button that resolves
        // after 5 seconds
        this.snackbar.message("Test").action("Action", async () => new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 5000);
        })).open();
    }

}
```
