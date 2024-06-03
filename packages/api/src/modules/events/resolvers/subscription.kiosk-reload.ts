import { builder, subscriptionName } from '#lib';

builder.queryField('kioskReload', (t) =>
  t.boolean({
    smartSubscription: true,
    async subscribe(subs, _, {}, { user }) {
      if (!user) return;
      if (!user.major) return;
      subs.register(subscriptionName('KioskReload', 'updated', user.major.uid));
    },
    resolve: () => true,
  }),
);
