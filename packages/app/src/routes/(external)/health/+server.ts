import { graphql } from '$houdini';
import { CURRENT_VERSION } from '$lib/buildinfo.js';
import { json } from '@sveltejs/kit';

export async function GET(event) {
  const backendChecks = await graphql(`
    query PageHealthCheck {
      healthcheck {
        database {
          prisma
        }
        ldap {
          internal
          school
        }
        mail {
          smtp
        }
        redis {
          publish
          subscribe
        }
      }
    }
  `)
    .fetch({ event })
    .then(({ data }) => {
      if (!data)
        {return {
          database: { prisma: false },
          ldap: { internal: false, school: false },
          mail: { smtp: false },
          redis: { publish: false, subscribe: false },
        };}
      return data.healthcheck;
    });

  const checks = {
    app: true,
    websocket: true, // deprecated, TODO: remove
    // critical checks only for the api health
    api: backendChecks.database.prisma,
    backend: backendChecks,
  };

  return json({ version: CURRENT_VERSION, checks }, { status: checks.api ? 200 : 500 });
}
