import { AppModule } from "./app.module";
import { Logger, VersioningType } from "@nestjs/common";
import { createBootstrap } from "@soundcore/bootstrap";

const logger = new Logger("Bootstrap");
createBootstrap("TSRadio @NEXT", AppModule)
  .useOptions({ cors: true, abortOnError: false })
  .enableCors()
  .enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })
  .useHost("0.0.0.0")
  .usePort(3002)
  .withBuildInfo()
  .bootstrap().then((app) => {
    app.getUrl().then((url) => {
      logger.log(`TSRadio Api now listening for requests on url '${url}'.`);      
    });
  });
