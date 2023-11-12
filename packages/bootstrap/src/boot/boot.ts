import fs from "node:fs";
import { NestFactory } from "@nestjs/core";
import { PipeTransform, ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { readServiceInfo } from "../utils/readServiceInfo";
import logger from "../utils/logger";
import { isNull } from "@tsa/utilities";
import { DefaultServiceInfo } from "../entities/service-info.entity";
import { FILE_SERVICE_INFO } from "../constants";
import { Environment } from "../environment";
import { MissingServiceInfoFileException } from "../exceptions/missingServiceInfo";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { printLogo } from "../utils/printLogo";
import { HttpExceptionFilter } from "../exceptions/exceptionFilter";

type ModuleSchema = { new (): unknown };

export interface RpcOptions {
  packageName: string;
  protoFile: string;
  port: number;
  loader?: {
    includeDirs?: string[];
  };
}

export class TSABootstrapper {
  private _allowedOrigins?: Set<string>;
  private _globalPipes: Set<PipeTransform> = new Set();
  private _port!: number;
  private _swaggerPath?: string;
  private _microserviceOptions?: RpcOptions;

  private constructor(private readonly module: ModuleSchema) {}

  /**
   * Create a new instance of the bootstrapper
   * @param module Root module of the NestJS application
   * @returns Instance of the bootstrapper for further configuration
   */
  public static create(module: ModuleSchema): TSABootstrapper {
    return new TSABootstrapper(module);
  }

  /**
   * Allow a set of origins (CORS). If no set
   * is provided, cors will be set to allow all origins
   * @param origins Set of origins
   * @returns Instance of the current bootstrapper
   */
  public allowOrigins(origins: Set<string>): TSABootstrapper {
    this._allowedOrigins = origins;
    return this;
  }

  /**
   * Register a new global pipe
   * @param pipe Global pipe implementation to register
   * @returns Instance of the current bootstrapper
   */
  public registerGlobalPipe(pipe: PipeTransform): TSABootstrapper {
    this._globalPipes.add(pipe);
    return this;
  }

  /**
   * Register the swagger module provided by nestjs
   * for automatic docs generation
   * @param path Path on the url where the docs will be available
   * @returns Instance of the current bootstrapper
   */
  public registerSwagger(path: string): TSABootstrapper {
    this._swaggerPath = path;
    return this;
  }

  /**
   * Register a new microservice
   * @param packageName Name of the package in the .proto file
   * @param protoFile Path to the .proto file
   * @returns Instance of the current bootstrapper
   */
  public registerMicroservice(options: RpcOptions): TSABootstrapper {
    this._microserviceOptions = options;
    return this;
  }

  /**
   * Start the application by binding to a port
   * @param port Port that the application should bind to
   */
  public listen(port: number): void {
    this._port = port;
    this.bootstrapApplication();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async bootstrapApplication() {
    // Print logo to the console
    printLogo();

    // Reading service info
    const service_info = await readServiceInfo().catch((error: Error) => {
      logger.error(`Cannot bootstrap service: ${error.message}`);

      // When the error is because of the missing service info file
      // Print how this file can be generated
      if (error instanceof MissingServiceInfoFileException) {
        logger.error(
          `Please check if you have a '${FILE_SERVICE_INFO}'-file in your root directory of the application.`
        );
        logger.error(`If not, generate a new file with the following contents: `);
        console.log(JSON.stringify(DefaultServiceInfo, null, 2));
      }

      // Shutdown the application when service info
      // collection failed
      process.exit(1);
    });

    logger.log(`Starting service '${service_info.client_id}' with version '${service_info.client_version}'`);

    // Create app instance using the root module
    const app = await NestFactory.create(this.module, {
      cors: {
        origin: isNull(this._allowedOrigins) ? true : Array.from(this._allowedOrigins.values())
      }
    });

    // Register global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Connect microservices to the app
    if (!isNull(this._microserviceOptions)) {
      const packageName = this._microserviceOptions.packageName;
      const protoFile = this._microserviceOptions.protoFile;
      const port = this._microserviceOptions.port;
      const loaderOptions = this._microserviceOptions.loader;

      if (fs.existsSync(protoFile)) {
        app.connectMicroservice<MicroserviceOptions>(
          {
            transport: Transport.GRPC,
            options: {
              package: packageName,
              protoPath: protoFile,
              url: `0.0.0.0:${port}`,
              loader: loaderOptions
            }
          },
          {
            inheritAppConfig: true
          }
        );
      } else {
        logger.warn(`File '${protoFile}' not found. Skipping init for microservice package '${packageName}'`);
      }
    }

    // Set versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: "1"
    });

    // Add global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true
      }),
      ...this._globalPipes.values()
    );

    // Enable swagger docs when path is set
    // and the environment is set to development
    if (!isNull(this._swaggerPath) && Environment.isDev) {
      const config = new DocumentBuilder()
        .setTitle(service_info.client_name)
        .setVersion(service_info.client_version)
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(this._swaggerPath, app, document);
    }

    // Start microservices
    await app.startAllMicroservices();
    // Bind to the provided port
    await app.listen(this._port);
    return app;
  }
}
