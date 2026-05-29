import type { Core } from '@strapi/strapi';

const FRONTEND_PERMISSION_ACTIONS = [
  'api::power-bi-dashboard.power-bi-dashboard.find',
  'api::power-bi-dashboard.power-bi-dashboard.findOne',
  'api::dashboard-pin.dashboard-pin.me',
  'api::dashboard-pin.dashboard-pin.toggle',
];

async function ensureFrontendPermissions(strapi: Core.Strapi) {
  const authenticatedRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' }, populate: ['permissions'] });

  if (!authenticatedRole) return;

  const existingActions = new Set(
    (authenticatedRole.permissions || []).map((permission) => permission.action)
  );

  await Promise.all(
    FRONTEND_PERMISSION_ACTIONS
      .filter((action) => !existingActions.has(action))
      .map((action) =>
        strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: authenticatedRole.id,
          },
        })
      )
  );
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureFrontendPermissions(strapi);
  },
};
