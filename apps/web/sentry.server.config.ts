import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://990629cd3a8077ce1fb1fd462660541a@o4510609652318208.ingest.us.sentry.io/4510609654218752",
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
