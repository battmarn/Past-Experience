import React, { type FC, useContext } from 'react';

import { BagIcon } from 'app/components/BagIcon/BagIcon';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { useSiteWideText } from 'app/hooks/useRegionalData';
import { DrawerContext, DrawerKey } from 'app/providers/drawer/drawerProvider';

export const Basket: FC = () => {
  const gtmSiteInteraction = useGtmSiteInteraction();
  const snowplowSiteInteraction = useSnowplowSiteInteraction();
  const { toggleDrawer } = useContext(DrawerContext);
  const viewBagText = useSiteWideText('view-bag', { defaultValue: 'View your bag' });

  const onBagClick = () => {
    gtmSiteInteraction('Clicked - My Bag', 'icon click');
    snowplowSiteInteraction('Clicked bag icon');
    toggleDrawer(DrawerKey.Bag);
  };

  return (
    <button aria-label={viewBagText} onClick={onBagClick} data-test-id="navigation-cart">
      <BagIcon />
    </button>
  );
};
