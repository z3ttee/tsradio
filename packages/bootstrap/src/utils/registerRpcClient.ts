import { DynamicModule, Inject } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RpcOptions } from "../boot/boot";

export const InjectRpcClient = (packageName: string): ReturnType<typeof Inject> =>
  Inject(getClientInjectionToken(packageName));

export function getClientInjectionToken(packageName: string): string {
  return `__NGS_PACKAGE_${packageName}__`;
}

export function registerRpcClients(clients: RpcOptions[]): DynamicModule {
  return ClientsModule.register(
    clients.map((opts) => ({
      name: getClientInjectionToken(opts.packageName),
      transport: Transport.GRPC,
      options: {
        package: opts.packageName,
        protoPath: opts.protoFile,
        url: `127.0.0.1:${opts.port}`,
        loader: opts.loader
      }
    }))
  );
}
