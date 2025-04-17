import * as useMediaQuery from '@react-hook/media-query';
import { trackStructEvent } from '@snowplow/browser-tracker';
import type { RegionString } from '@trinnylondon/global.types.config';
import React from 'react';
import * as reactRedux from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { screen, userEvent, within } from 'app/bit-migration/test-utilities/react-renderer';
import { createUseSignOutMock } from 'app/hooks/auth/signOut.mock';
import { createUseCurrentLocationMock } from 'app/hooks/useCurrentLocationMock';
import { useScrollDirection } from 'app/hooks/useScrollDirection';
import { createUseSiteIdMock } from 'app/hooks/useSiteIdMock';
import { clearDataLayer, snapshotDataLayer } from 'app/lib/analytics/analytics.mock';
import { createUseFlagValueMock } from 'app/lib/featureFlag.mock';
import { createUseTrackingLocationMock } from 'app/providers/GTM/TrackingLocationProvider.mock';
import { AlgoliaSearchProvider } from 'app/providers/search/AlgoliaSearchProvider';
import { ffSearchConfig } from 'config/featureFlag';
import { renderWithStore } from 'test/helpers/renderWithStore';

import { NavigationContextProvider } from '../Context/Context';
import { mockCategory, mockCategorySkincare } from '../mocks';

import { Header, type HeaderProps } from './Header';

jest.mock('app/hooks/useScrollDirection');
jest.mock('@snowplow/browser-tracker', () => ({
  trackStructEvent: jest.fn(),
}));

const setup = (props: HeaderProps) => {
  return renderWithStore(
    <NavigationContextProvider>
      <Header {...props} />
    </NavigationContextProvider>,
  );
};

describe('<Header />', () => {
  const testProps: HeaderProps = {
    categories: [mockCategory, mockCategorySkincare],
    mobileMenuOpen: false,
    closeDesktopNav: jest.fn(),
    setActiveCategory: jest.fn(),
    setCategoryMenu: jest.fn(),
    isCheckout: false,
    isNavbarMinimised: false,
    isProcessingPayment: false,
  };

  beforeEach(() => {
    clearDataLayer();
    createUseSignOutMock();
    createUseSiteIdMock('uk' as RegionString);
    createUseTrackingLocationMock('Header');

    jest.spyOn(useMediaQuery, 'useMediaQuery').mockImplementation(() => true);
    (useScrollDirection as jest.Mock).mockReturnValue('start');
  });

  describe('for non-checkout pages', () => {
    it('should contain a labelled button to open the search menu', () => {
      createUseFlagValueMock({
        [ffSearchConfig]: {
          debounceMs: 0,
          maxQueryLength: 9,
          minQueryLength: 2,
        },
      });
      createUseCurrentLocationMock({
        pathname: 'uk',
      });

      const { container } = renderWithStore(
        <BrowserRouter>
          <NavigationContextProvider>
            <AlgoliaSearchProvider apiKey="123456">
              <Header {...testProps} />
            </AlgoliaSearchProvider>
          </NavigationContextProvider>
        </BrowserRouter>,
      );
      const searchTrigger = within(container).getByRole('button', { name: 'Open search menu', expanded: false });
      expect(searchTrigger).toBeInTheDocument();
    });
    it('will render the header component for non checkout pages', () => {
      createUseCurrentLocationMock({
        pathname: 'uk',
      });

      expect(setup(testProps).container).toMatchSnapshot();
    });

    describe('mobile menu', () => {
      it('will render the mobile menu open icon when mobile menu is closed', () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });

        setup(testProps);
        expect(screen.getByTestId('mobile-menu-open')).toBeInTheDocument();
      });

      it('will render the mobile menu closed icon when the mobile menu is open', () => {
        const openTestProps = {
          ...testProps,
          mobileMenuOpen: true,
        };
        createUseCurrentLocationMock({
          pathname: 'uk',
        });

        setup(openTestProps);
        expect(screen.getByTestId('mobile-menu-close')).toBeInTheDocument();
      });

      it('will toggle the mobile menu open when the mobile menu button is clicked', async () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });
        const dispatchMock = jest.fn();
        jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(dispatchMock);

        setup(testProps);
        await userEvent.click(screen.getByTestId('mobile-nav-toggle'));
        expect(dispatchMock).toHaveBeenCalledWith({
          type: 'OPEN_NAVIGATION',
        });
        snapshotDataLayer(1);
      });

      it('will toggle the mobile menu closed when the mobile menu button is clicked', async () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });
        const dispatchMock = jest.fn();
        jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(dispatchMock);

        const openProps = {
          ...testProps,
          mobileMenuOpen: true,
        };
        setup(openProps);
        await userEvent.click(screen.getByTestId('mobile-nav-toggle'));
        expect(dispatchMock).toHaveBeenCalledWith({
          type: 'CLOSE_NAVIGATION',
        });
        snapshotDataLayer(1);
      });
    });

    describe('site banners', () => {
      const siteBannerProps: HeaderProps = {
        ...testProps,
        siteBanners: <div />,
      };
      it('will update css classes when site banners are available', () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });

        expect(setup(siteBannerProps).container).toMatchSnapshot();
      });
    });

    describe('search trigger', () => {
      it('will render a button to open the search menu', () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });
        setup(testProps);
        expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
      });
    });

    describe('logo', () => {
      it('will render the non checkout logo', () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });
        setup(testProps);
        expect(screen.getByTestId('non-checkout-logo')).toBeInTheDocument();
      });

      it('will track the logo click', async () => {
        createUseCurrentLocationMock({
          pathname: 'uk',
        });
        setup(testProps);
        await userEvent.click(screen.getByTestId('non-checkout-logo'));
        snapshotDataLayer(1);

        expect(trackStructEvent).toHaveBeenCalledWith({
          category: 'Site interaction',
          action: 'Clicked logo',
          label: 'Header',
        });
      });
    });

    it('will render the basket component', () => {
      createUseCurrentLocationMock({
        pathname: 'uk',
      });
      setup(testProps);
      expect(screen.getByTestId('basket-desktop')).toBeInTheDocument();
    });
  });

  describe('for checkout pages', () => {
    const checkoutProps = {
      ...testProps,
      queryString: '/uk/checkout/',
    };

    it('will render the header component for checkout', () => {
      createUseCurrentLocationMock({
        pathname: 'uk/checkout/',
      });

      expect(setup(checkoutProps).container).toMatchSnapshot();
    });

    describe('site banners', () => {
      it('will render the site banners container when site banners are present', () => {
        const props: HeaderProps = {
          ...checkoutProps,
          siteBanners: <div data-test-id="site-banners" />,
        };
        createUseCurrentLocationMock({
          pathname: '/uk/checkout/',
        });
        setup(props);
        expect(screen.getByTestId('site-banners-container')).toBeInTheDocument();
        expect(screen.getByTestId('site-banners')).toBeInTheDocument();
      });
    });
  });
});
