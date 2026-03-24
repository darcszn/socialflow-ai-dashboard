/**
 * OpenTelemetry distributed tracing initialization.
 * Import this module at the very top of your application entry point:
 *   require('./tracing') or import './tracing'
 *
 * Exports traces to Jaeger (default) or Honeycomb via OTLP HTTP.
 * Configure via environment variables (see .env.example).
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable diagnostic logging in development
if (process.env.OTEL_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

/**
 * Resolve which exporter to use based on OTEL_EXPORTER env var.
 * - 'honeycomb' → OTLP HTTP exporter (Honeycomb endpoint)
 * - 'otlp'      → Generic OTLP HTTP exporter
 * - default     → Jaeger exporter
 */
function buildExporter() {
  const exporterType = process.env.OTEL_EXPORTER ?? 'jaeger';

  if (exporterType === 'honeycomb') {
    return new OTLPTraceExporter({
      url: 'https://api.honeycomb.io/v1/traces',
      headers: {
        'x-honeycomb-team': process.env.HONEYCOMB_API_KEY ?? '',
        'x-honeycomb-dataset': process.env.HONEYCOMB_DATASET ?? 'socialflow-ai-dashboard',
      },
    });
  }

  if (exporterType === 'otlp') {
    return new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
    });
  }

  // Default: Jaeger
  return new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT ?? 'http://localhost:14268/api/traces',
  });
}

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME ?? 'socialflow-ai-dashboard',
    [SemanticResourceAttributes.SERVICE_VERSION]:
      process.env.npm_package_version ?? '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV ?? 'development',
  }),

  // Batch processor for production-grade throughput
  spanProcessor: new BatchSpanProcessor(buildExporter()),

  // Auto-instrument HTTP, Express, DB clients, gRPC, etc.
  instrumentations: [
    getNodeAutoInstrumentations({
      // Instrument all incoming/outgoing HTTP calls
      '@opentelemetry/instrumentation-http': { enabled: true },
      // Instrument Express routes
      '@opentelemetry/instrumentation-express': { enabled: true },
      // Instrument pg / postgres queries
      '@opentelemetry/instrumentation-pg': { enabled: true },
      // Instrument MongoDB queries
      '@opentelemetry/instrumentation-mongodb': { enabled: true },
      // Instrument Redis calls
      '@opentelemetry/instrumentation-redis': { enabled: true },
      // Instrument fetch / undici (AI API calls)
      '@opentelemetry/instrumentation-undici': { enabled: true },
    }),
  ],
});

// Start the SDK — must happen before any other imports that use instrumented libs
sdk.start();

// Graceful shutdown on process exit
process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

export { sdk };
