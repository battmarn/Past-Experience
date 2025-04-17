import cx from 'classnames';
import React, { type FC } from 'react';

import gs from 'app/assets/css/global/globalStyles';
import textLogo from 'app/assets/trinnylondon-01.svg';
import textLogoXS from 'app/assets/trinnylondon-xs.svg';
import { Link } from 'app/bit-migration/react-components/link/link';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { useIsLastPath } from 'app/hooks/useIsLastPath';

import s from './styles.module.css';

interface HeaderLogoProps {
  isProcessingPayment: boolean;
}

const LogoImage: FC = () => {
  return (
    <picture>
      <source media="(max-width: 519px)" srcSet={textLogoXS} />
      <img src={textLogo} alt="Trinny London" className={s.logo} />
    </picture>
  );
};

export const HeaderLogo: FC<HeaderLogoProps> = ({ isProcessingPayment }: HeaderLogoProps) => {
  const isHomePage = useIsLastPath();
  const gtmSiteInteraction = useGtmSiteInteraction();
  const snowplowSiteInteraction = useSnowplowSiteInteraction();

  return (
    <div className={s.logoContainer}>
      {!isProcessingPayment ? (
        <Link
          data-test-id="non-checkout-logo"
          href="/"
          className={cx(s.logoLink, gs.accessibleFocus)}
          onClick={() => {
            gtmSiteInteraction('Clicked - Logo', 'image click');
            snowplowSiteInteraction('Clicked logo');
          }}
        >
          {isHomePage ? (
            <h1 className={s.homePageLogoH1}>
              <LogoImage />
              <span className={s.visuallyHidden}>Trinny London</span>
            </h1>
          ) : (
            <LogoImage />
          )}
        </Link>
      ) : (
        <span data-test-id="checkout-logo" className={s.logoLink}>
          <LogoImage />
        </span>
      )}
    </div>
  );
};
