import type { User } from '@trinnylondon/global.types.auth';
import type { SiteString } from '@trinnylondon/global.types.config';
import cx from 'classnames';
import React, { type FC } from 'react';

import gs from 'app/assets/css/global/globalStyles';
import AcccountIcon from 'app/assets/icons/my-account.icon.svg';
import { IconChevron } from 'app/bit-migration/react-components/atomics/atoms/icon-chevron/icon-chevron';
import { Link } from 'app/bit-migration/react-components/link/link';
import { useNavigation } from 'app/bit-migration/react-contexts/navigation';
import { Icon } from 'app/components/Icon/icon';
import { useSignOut } from 'app/hooks/auth/signOut';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { useSiteWideText } from 'app/hooks/useRegionalData';
import { useScrollLock } from 'app/hooks/useScrollLocker/useScrollLocker';
import { useSiteId } from 'app/hooks/useSiteId';

import { useNavigationContext } from '../../Context/Context';

import s from './styles.module.css';

export interface AccountProps {
  currentUser?: User;
}

const shouldShowDropdown = () => {
  return (
    window &&
    window.navigator &&
    !/android|webos|iphone|ipod|ipad|blackberry|iemobile|opera mini/i.test(window.navigator.userAgent)
  );
};

const accountDropdownSymbol = Symbol('ACCOUNT_DROPDOWN');

export const Account: FC<AccountProps> = ({ currentUser }) => {
  const {
    menu: { active: activeMenuItem, hideMenu, showMenu },
  } = useNavigationContext();

  const { signOut } = useSignOut();
  const { push } = useNavigation();
  const gtmSiteInteraction = useGtmSiteInteraction();
  const snowplowSiteInteraction = useSnowplowSiteInteraction();

  const hasCurrentUser = Boolean(currentUser && currentUser.id);

  const isAccountDropdownOpen = activeMenuItem === accountDropdownSymbol && hasCurrentUser;

  useScrollLock(accountDropdownSymbol, isAccountDropdownOpen);

  // The SiteString type is case sensitive...
  const currentSiteId = useSiteId().toLocaleUpperCase() as SiteString;
  const helpLinkSuffix = currentSiteId === 'DE' ? 'de' : `en-${currentSiteId.toLocaleLowerCase()}`;

  const showAccountDropdown = () => {
    if (hasCurrentUser && shouldShowDropdown()) {
      showMenu(accountDropdownSymbol);
      if (!isAccountDropdownOpen) {
        gtmSiteInteraction('Opened Account Dropdown', 'icon click');
        snowplowSiteInteraction('Opened account dropdown');
      }
    }
  };

  const hideAccountDropdown = (immediate: boolean = true) => {
    hideMenu(accountDropdownSymbol, immediate);
  };

  const onAccountClick = () => {
    if (!hasCurrentUser) {
      push('/sign-in');
      gtmSiteInteraction('Clicked - Sign In', 'icon click');
      snowplowSiteInteraction('Clicked - Sign in');
    } else {
      showAccountDropdown();
    }
  };

  const onLinkClick = (linkName: string) => {
    gtmSiteInteraction(`Clicked - ${linkName}`, 'click', 'Account Dropdown');
    snowplowSiteInteraction(`Clicked - ${linkName}`, 'Account dropdown');
  };

  const handleSignOut = () => {
    gtmSiteInteraction('Clicked - Sign Out', 'click', 'Account Dropdown');
    snowplowSiteInteraction('Clicked - Sign out', 'Account dropdown');
    void signOut();
    hideAccountDropdown(true);
  };

  return (
    <div className={s.account}>
      <button
        className={gs.accessibleFocus}
        aria-expanded={isAccountDropdownOpen}
        onMouseEnter={() => showAccountDropdown()}
        onMouseLeave={() => hideAccountDropdown(false)}
        onClick={onAccountClick}
        data-test-id="navigation-account"
      >
        <Icon className={s.accountIcon} aria-label="My Account">
          <AcccountIcon />
        </Icon>
      </button>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- We should look to fix this site wide for more than a11y but ensuring we don't have multiple menus open at once */}
      <div
        role="menu"
        hidden={!isAccountDropdownOpen}
        data-test-id="navigation-account-dropdown"
        className={cx(s.accountHoverDropdown, {
          [s.isInvisible]: !isAccountDropdownOpen,
        })}
        onMouseEnter={() => showAccountDropdown()}
        onMouseLeave={() => hideAccountDropdown()}
      >
        <span data-test-id="navigation-account-dropdown-name" className={s.accountName}>
          {}
          {`${useSiteWideText('hello', { defaultValue: 'hello' })}, ${currentUser?.firstName}`}
        </span>
        <ul className={s.accountLinksList} data-test-id="account-dropdown-links">
          <li className={s.accountLinkItem}>
            <Link
              className={s.accountLinkButton}
              data-test-id="account-link-profile"
              onClick={() => {
                onLinkClick('My Account');
                hideAccountDropdown(true);
              }}
              href={'/my-account'}
            >
              <span>{useSiteWideText('my-account', { defaultValue: 'My account' })}</span>
              <IconChevron style={{ width: '11px', height: '11px' }} direction="right" />
            </Link>
          </li>
          <li className={s.accountLinkItem}>
            <Link
              className={s.accountLinkButton}
              data-test-id="account-link-help"
              onClick={() => {
                onLinkClick('Help');
                hideAccountDropdown(true);
              }}
              href={`https://trinny-london.zendesk.com/hc/${helpLinkSuffix}`}
            >
              <span>{useSiteWideText('help', { defaultValue: 'Help' })}</span>
              <IconChevron style={{ width: '11px', height: '11px' }} direction="right" />
            </Link>
          </li>
          <li className={s.accountLinkItem}>
            <button className={s.accountLinkButton} data-test-id="account-link-signout" onClick={handleSignOut}>
              <span>{useSiteWideText('sign-out', { defaultValue: 'Sign out' })}</span>
              <IconChevron style={{ width: '11px', height: '11px' }} direction="right" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
