// import { AppModule } from "./app.module";
// import { Logger, VersioningType } from "@nestjs/common";
// import { createBootstrap } from "@soundcore/bootstrap";

// const logger = new Logger("Bootstrap");
// createBootstrap("TSRadio @NEXT", AppModule)
//   .useOptions({ cors: true, abortOnError: false })
//   .enableCors()
//   .enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })
//   .useHost("0.0.0.0")
//   .usePort(3000)
//   .withBuildInfo()
//   .bootstrap().then((app) => {
//     app.getUrl().then((url) => {
//       logger.log(`TSRadio Api now listening for requests on url '${url}'.`);      
//     });
//   });

// import path from "node:path";
// import { AUTH_NS } from "@ngs/proto";
import { AppModule } from "./app.module";
import { TSABootstrapper } from "@tsa/bootstrap";

// Create new bootstrapper using root module
const bootstrapper = TSABootstrapper.create(AppModule as any);

// Set allowed origins
bootstrapper.allowOrigins(new Set(["*", "http://localhost:8888", "http://localhost:4200", "http://localhost:3000"]));

// Start the application by binding to port
bootstrapper.listen(3000);
