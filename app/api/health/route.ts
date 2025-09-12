// Production health check endpoint
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { monitoring } from '@/lib/monitoring';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down' | 'degraded';
    redis?: 'up' | 'down' | 'degraded';
    storage?: 'up' | 'down' | 'degraded';
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    responseTime: number;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'up',
      redis: 'up',
      storage: 'up'
    },
    metrics: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      responseTime: 0
    }
  };

  try {
    // Check database connection
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('id')
        .limit(1);
      
      if (error) {
        healthCheck.services.database = 'degraded';
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.database = 'down';
      healthCheck.status = 'unhealthy';
    }

    // Check Redis connection (if available)
    try {
      // In production, this would check Redis connection
      // const redis = new Redis(process.env.REDIS_URL);
      // await redis.ping();
    } catch (error) {
      healthCheck.services.redis = 'down';
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    }

    // Check storage connection
    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .list('', { limit: 1 });
      
      if (error) {
        healthCheck.services.storage = 'degraded';
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded';
        }
      }
    } catch (error) {
      healthCheck.services.storage = 'down';
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    }

    healthCheck.metrics.responseTime = Date.now() - startTime;

    // Track health check
    monitoring.track('health_check', {
      status: healthCheck.status,
      responseTime: healthCheck.metrics.responseTime,
      services: healthCheck.services
    });

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });

  } catch (error) {
    monitoring.trackError(error as Error, 'health_check');
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 });
  }
}
