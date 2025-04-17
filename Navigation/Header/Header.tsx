import type { User } from '@trinnylondon/global.types.auth';
import cx from 'classnames';
import React, { useEffect, useRef, type FC, type ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { closeNavigation, openNavigation } from 'app/actions/layout';
import gs from 'app/assets/css/global/globalStyles';
import MenuSVG from 'app/assets/icons/menu-02.icon.svg';
import { IconClose } from 'app/bit-migration/react-components/atomics/atoms/icon-close/icon-close';
import { Icon } from 'app/components/Icon/icon';
import { SearchHint } from 'app/components/Search/SearchTrigger/SearchHint';
import { SearchIcon } from 'app/components/Search/SearchTrigger/SearchIcon';
import { SearchTrigger } from 'app/components/Search/SearchTrigger/SearchTrigger';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { TrackingLocationProvider } from 'app/providers/GTM/TrackingLocationProvider';

import { CurrencySelector } from '../CurrencySelector';
import { DesktopMenuWrapper } from '../Desktop/index';
import { NavBar } from '../NavBar/Navbar';
import { Overlay } from '../Overlay';
import type { Category, SubCategory } from '../types';

import { Account } from './Account/Account';
import { Basket } from './Basket/Basket';
import { HeaderLogo } from './HeaderLogo/HeaderLogo';
import { NotificationBanners } from './NotificationBanners';
import s from './styles.module.css';

export interface HeaderProps {
  activeCategory?: Category;
  categories: Category[];
  currentUser?: User;
  mobileMenuOpen: boolean;
  siteBanners?: ReactElement;
  isCheckout: boolean;
  isProcessingPayment: boolean;
  isNavbarMinimised: boolean;
  closeDesktopNav: () => void;
  setActiveCategory: (category: Category | undefined) => void;
  setCategoryMenu: (showCategoryMenu: SubCategory | null) => void;
}

export const Header: FC<HeaderProps> = ({
  activeCategory,
  categories,
  currentUser,
  mobileMenuOpen,
  siteBanners,
  isCheckout,
  isProcessingPayment,
  isNavbarMinimised,
  closeDesktopNav,
  setActiveCategory,
  setCategoryMenu,
}) => {
  const dispatch = useDispatch();

  const gtmSiteInteraction = useGtmSiteInteraction();
  const snowplowSiteInteraction = useSnowplowSiteInteraction();

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      if (activeCategory && headerRef.current?.contains(event.target as HTMLElement)) {
        setActiveCategory(undefined);
      }
    };
    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [activeCategory, setActiveCategory]);

  const onMobileMenuToggle = () => {
    if (mobileMenuOpen) {
      gtmSiteInteraction('Closed Mobile Nav', 'icon click');
      snowplowSiteInteraction('Closed Mobile Nav');
      dispatch(closeNavigation());
    } else {
      gtmSiteInteraction('Opened Mobile Nav', 'icon click');
      snowplowSiteInteraction('Opened Mobile Nav');
      dispatch(openNavigation());
    }
  };

  return (
    <>
      <header
        className={cx(s['header'], {
          [s['minimised']]: isNavbarMinimised,
          [s['checkout']]: isCheckout,
        })}
        data-test-id={`header-${isNavbarMinimised ? 'minimised' : 'not-minimised'}`}
        data-header="header"
        ref={headerRef}
      >
        <div data-test-id="site-banners-container" className={s['site-banners']}>
          {siteBanners}
          <div className={s['banner-currency-container']}>
            <CurrencySelector className={s['banner-currency']} />
          </div>
        </div>

        <div
          className={cx(s['top-line'], {
            [s['top-line-margin']]: siteBanners,
          })}
        >
          <div className={cx(s.headerIconButtons, s.first)}>
            {!isCheckout && (
              <div className={s['mobile-menu-button']}>
                <button
                  type="button"
                  className={gs.accessibleFocus}
                  onClick={onMobileMenuToggle}
                  data-test-id="mobile-nav-toggle"
                >
                  <Icon>
                    {mobileMenuOpen ? (
                      <IconClose data-test-id="mobile-menu-close" className={cx(s['btn-icon'], s['icon-close'])} />
                    ) : (
                      <MenuSVG data-test-id="mobile-menu-open" className={s['btn-icon']} />
                    )}
                  </Icon>
                </button>
              </div>
            )}

            {!isCheckout && !isNavbarMinimised && (
              <TrackingLocationProvider location="Search Trigger">
                <SearchTrigger origin="header">
                  <SearchIcon />
                  <div className={s.searchHint}>
                    <SearchHint />
                  </div>
                </SearchTrigger>
              </TrackingLocationProvider>
            )}
          </div>

          <div className={s.headerLogo}>
            <HeaderLogo isProcessingPayment={isProcessingPayment}></HeaderLogo>
          </div>

          <div className={cx(s.headerIconButtons, s.last)}>
            {!isNavbarMinimised && <Account currentUser={currentUser} />}
            {!isCheckout && !isNavbarMinimised && (
              <div className={s['basket-button']} data-test-id="basket-desktop">
                <Basket />
              </div>
            )}
          </div>
        </div>
      </header>
      {!isCheckout && (
        <NavBar
          activeCategory={activeCategory}
          categories={categories}
          isMinimised={isNavbarMinimised}
          setActiveCategory={setActiveCategory}
          setCategoryMenu={setCategoryMenu}
          closeDesktopNav={closeDesktopNav}
        />
      )}

      <NotificationBanners isNavbarMinimised={isNavbarMinimised} />

      <TrackingLocationProvider location={['Menu', activeCategory?.name]}>
        {activeCategory && (
          <>
            <DesktopMenuWrapper
              isNavbarMinimised={isNavbarMinimised}
              mainCategory={activeCategory}
              closeNavigation={() => setActiveCategory(undefined)}
            />
            <Overlay closeNavigation={() => setActiveCategory(undefined)} />
          </>
        )}
      </TrackingLocationProvider>
    </>
  );
};
