import type { RegionString } from '@trinnylondon/global.types.config';
import cx from 'classnames';
import React, { type FC, type MouseEventHandler, type PointerEventHandler, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import downArrow from 'app/assets/icons/down-arrow.svg';
import upArrow from 'app/assets/icons/up-arrow.svg';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { useCurrentLocation } from 'app/hooks/useCurrentLocation';
import { useSiteWideText } from 'app/hooks/useRegionalData';
import { useSiteId } from 'app/hooks/useSiteId';
import sessionInfo from 'app/lib/session';

import { useNavigationContext } from '../Context/Context';

import s from './styles.module.css';

interface CurrencySelectorProps {
  className?: string;
  isMobile?: boolean;
}

const changeSiteLanguage = (
  locale: RegionString,
  search: Record<string, string>,
  currentPath: string,
  siteId: string,
): string => {
  const queryString2 = new URLSearchParams(search).toString();
  return `${currentPath.replace(siteId, locale)}${queryString2 ? '?' + queryString2 : ''}`;
};

const currencySelectorDesktopSymbol = Symbol('CURRENCY_SELECTOR_DESKTOP');
const currencySelectorMobileSymbol = Symbol('CURRENCY_SELECTOR_MOBILE');

export const CurrencySelector: FC<CurrencySelectorProps> = ({ className, isMobile }) => {
  const {
    menu: { active: activeMenuItem, previouslyActive: previouslyActiveMenuItem, hideMenu, showMenu },
  } = useNavigationContext();

  const { sites, currentSite } = useSelector(({ sites: { current, list } }) => ({ sites: list, currentSite: current }));

  const isMobileNavigationVisible = useSelector((state) => state.layout.isNavigationVisible);
  const { pathname, search } = useCurrentLocation();

  const currencySelectorSymbol = isMobile ? currencySelectorMobileSymbol : currencySelectorDesktopSymbol;

  const showCountrySelect = activeMenuItem === currencySelectorSymbol;

  const siteId = useSiteId();
  const gtmSiteInteraction = useGtmSiteInteraction('Currency Selector');
  const snowplowSiteInteraction = useSnowplowSiteInteraction('Currency Selector');

  const selectedCurrency = `${currentSite.currency.code} | ${currentSite.currency.symbol}`;

  const [selectedSite, setSelectedSite] = useState(selectedCurrency);

  const handleMenuSelect = (siteCode: string, currentCurrency: string) => {
    gtmSiteInteraction('Selected new site - ' + siteCode, 'click');
    snowplowSiteInteraction('Selected new site - ' + siteCode);
    setSelectedSite(currentCurrency);
  };

  const handleSelectClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (showCountrySelect === true) {
      hideMenu(currencySelectorSymbol, true);
    } else {
      showMenu(currencySelectorSymbol);
    }
  };

  const handleOnPointerEnter: PointerEventHandler<HTMLButtonElement | HTMLDivElement> = (event) => {
    if (event.pointerType === 'mouse') {
      showMenu(currencySelectorSymbol);
    }
  };

  const handleOnPointerLeave: PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType === 'mouse') {
      hideMenu(currencySelectorSymbol, false);
    }
  };

  useEffect(() => {
    if (isMobile && !isMobileNavigationVisible) {
      hideMenu(currencySelectorSymbol, true);
    }
  }, [currencySelectorSymbol, isMobile, isMobileNavigationVisible, hideMenu]);

  useEffect(() => {
    if (activeMenuItem !== previouslyActiveMenuItem) {
      if (activeMenuItem === currencySelectorSymbol) {
        snowplowSiteInteraction('Opened Selector');
        gtmSiteInteraction('Opened');
      } else if (previouslyActiveMenuItem === currencySelectorSymbol) {
        snowplowSiteInteraction('Closed Selector');
        gtmSiteInteraction('Closed');
      }
    }
  }, [currencySelectorSymbol, gtmSiteInteraction, snowplowSiteInteraction, activeMenuItem, previouslyActiveMenuItem]);

  const menuButtons = sites.map(({ id, currency }) => ({
    locale: id,
    currency: `${currency.code} | ${currency.symbol}`,
    selectionText: currency.code,
    imageSource: `/assets/flags/${id.toLowerCase()}.svg`,
  }));

  return (
    <div onPointerLeave={handleOnPointerLeave} className={cx(s.border, className)} role="menu" tabIndex={0}>
      <div
        onPointerEnter={handleOnPointerEnter}
        className={cx(s.desktopSelect, {
          [s.hidden]: !showCountrySelect,
        })}
        role="menu"
        aria-hidden={!showCountrySelect}
        data-test-id="country-select"
        tabIndex={0}
      >
        <p className={s.menuShippingText}>{useSiteWideText('site-menu-header') || 'We ship worldwide!'}</p>
        {menuButtons.map((button) => (
          <a
            key={button.locale}
            target="_top"
            href={changeSiteLanguage(button.locale, search, pathname, siteId)}
            data-test-id={`${isMobile ? 'mobile' : 'desktop'}-currency-menu-option`}
            className={cx(s.menuOption, {
              [s.active]: button.locale === siteId,
            })}
            onClick={() => {
              sessionInfo.setRegionalCooke(siteId);
              handleMenuSelect(button.locale, button.currency);
            }}
          >
            {button.imageSource && <img src={button.imageSource} alt={`${siteId} flag`} className={s.image} />}
            {button.currency}
          </a>
        ))}
      </div>
      <div className={s.flagsContainer}>
        <button
          data-test-id={`${isMobile ? 'mobile' : 'desktop'}-currency-button-select`}
          onPointerEnter={handleOnPointerEnter}
          onClick={handleSelectClick}
          className={s.buttonSelect}
        >
          <img
            src={menuButtons.find((menuButton) => menuButton.locale === siteId.toLocaleLowerCase())?.imageSource}
            alt={`${siteId} flag`}
            className={s.image}
          />
          <span data-test-id="header-selected-site">{selectedSite}</span>
          <img src={showCountrySelect ? upArrow : downArrow} alt="arrow" className={s.arrows} />
        </button>
      </div>
    </div>
  );
};
