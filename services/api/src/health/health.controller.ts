import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  @Inject()
  private readonly health: HealthCheckService;

  @Inject()
  private readonly typeormHealth: TypeOrmHealthIndicator;

  @Get('liveness')
  public async getLivenessCheck() {
    const result = await this.health.check([]);
    return {
      status: result.status,
    };
  }

  @Get('readiness')
  public async getReadinessCheck() {
    return this.health.check([
      async () => this.typeormHealth.pingCheck('database'),
    ]);
  }
}
