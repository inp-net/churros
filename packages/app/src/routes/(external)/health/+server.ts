import { graphql } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo.js';

const BackendHealthcheck = graphql(`
  query BackendHealthcheck {
    healthcheck {
      database {
        prisma
      }
      ldap {
        internal
        school
      }
      database {
        prisma
      }
      mail {
        smtp
      }
      redis {
        publish
        subscribe
      }
      notella {
        churrosDatabase
        firebase
        gateway
        nats
        redis
      }
      features {
        appleWallet
        gitlab
        googleAPIs
        googleWallet
        notifications
        oauth
        prometheus
      }
    }
  }
`);

export async function GET(event) {
  const backendChecks = await BackendHealthcheck.fetch({ event }).then(({ data }) => {
    return data?.healthcheck
      ? {
          gateway: true,
          ...data.healthcheck,
        }
      : {
          gateway: false,
          database: { prisma: false },
          ldap: { internal: false, school: false },
          mail: { smtp: false },
          redis: { publish: false, subscribe: false },
          notella: {
            churrosDatabase: false,
            firebase: false,
            gateway: false,
            nats: false,
            redis: false,
          },
          features: {
            appleWallet: false,
            gitlab: false,
            googleAPIs: false,
            googleWallet: false,
            mailman: false,
            notifications: false,
            oauth: false,
            prometheus: false,
          },
        };
  });

  const checks = {
    app: true,
    // api=true means api is reachable, nothing more
    api: backendChecks.gateway,
    backend: backendChecks,
  };

  return new Response(
    JSON.stringify({
      version: CURRENT_VERSION,
      checks,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      // consider frontend ready as soon as the database is ready on the backend
      status: checks.backend.database.prisma ? 200 : 500,
    },
  );
}
