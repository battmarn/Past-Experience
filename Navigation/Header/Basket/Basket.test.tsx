import { trackStructEvent } from '@snowplow/browser-tracker';
import { screen } from '@testing-library/react';
import type { Bag } from '@trinnylondon/global.types.bag';
import React, { type FC, type ReactElement } from 'react';

import { userEvent } from 'app/bit-migration/test-utilities/react-renderer';
import { createUseCurrentLocationMock } from 'app/hooks/useCurrentLocationMock';
import { clearDataLayer } from 'app/lib/analytics/analytics.mock';
import { createUseTrackingLocationMock } from 'app/providers/GTM/TrackingLocationProvider.mock';
import { mock } from 'test/helpers/mock';
import {
  composeProviders,
  createMockProvider,
  renderWithMuiTheme,
  renderWithStore,
} from 'test/helpers/renderWithStore';

import { NavigationContextProvider } from '../../Context/Context';

import { Basket } from './Basket';

jest.mock('@snowplow/browser-tracker', () => ({
  trackStructEvent: jest.fn(),
}));

const TestNavigationProvider: FC<{ children?: ReactElement }> = ({ children }) => (
  <NavigationContextProvider>{children}</NavigationContextProvider>
);

describe('Basket', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    clearDataLayer();
    createUseTrackingLocationMock('Header');
    createUseCurrentLocationMock();
  });

  describe('with bag drawer enabled', () => {
    it('should render the bag drawer button', () => {
      const bag = mock<Bag>({
        lineItems: [
          {
            id: '1',
            type: 'MakeupProduct',
            title: 'abc',
            price: {},
            variant: {},
            quantity: 1,
          },
        ],
      });

      const wrapper = createMockProvider({
        checkout: { bag },
      });

      renderWithMuiTheme(<Basket />, {
        wrapper: composeProviders(wrapper, TestNavigationProvider),
      });

      expect(screen.getByTestId('navigation-cart')).toBeInTheDocument();
    });
  });

  it('should fire Snowplow event when button is clicked', async () => {
    const user = userEvent.setup();

    renderWithStore(<Basket />);

    await user.click(screen.getByTestId('navigation-cart'));

    expect(trackStructEvent).toHaveBeenCalledWith({
      category: 'Site interaction',
      action: 'Clicked bag icon',
      label: 'Header',
    });
  });
});
