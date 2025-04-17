import { trackStructEvent } from '@snowplow/browser-tracker';
import type { User } from '@trinnylondon/global.types.auth';
import type { RegionString } from '@trinnylondon/global.types.config';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { screen, userEvent, waitFor } from 'app/bit-migration/test-utilities/react-renderer';
import { createUseSignOutMock } from 'app/hooks/auth/signOut.mock';
import { createUseNavigationMock } from 'app/hooks/useNavigationMock';
import { createUseRegionalDataMock } from 'app/hooks/useRegionalDataMock';
import { createUseSiteIdMock } from 'app/hooks/useSiteIdMock';
import { clearDataLayer, snapshotDataLayer } from 'app/lib/analytics/analytics.mock';
import { createUseTrackingLocationMock } from 'app/providers/GTM/TrackingLocationProvider.mock';
import { mock } from 'test/helpers/mock';
import { renderWithStore } from 'test/helpers/renderWithStore';

import { NavigationContextProvider } from '../../Context/Context';

import { Account, type AccountProps } from './Account';

const user = userEvent.setup({ delay: null });

jest.mock('@snowplow/browser-tracker', () => ({
  trackStructEvent: jest.fn(),
}));

describe('<Account />', () => {
  let signOutMock: jest.Mock<Promise<void>>;

  const setup = (props: AccountProps, siteID: RegionString) => {
    createUseSiteIdMock(siteID);
    const { pushSpy } = createUseNavigationMock();
    const { container } = renderWithStore(
      <NavigationContextProvider>
        <Account {...props} />
      </NavigationContextProvider>,
    );
    return {
      container,
      pushSpy,
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    clearDataLayer();
    createUseTrackingLocationMock('Header');
    signOutMock = createUseSignOutMock();
    createUseRegionalDataMock('siteWideText', {
      hello: 'Hello',
      'my-account': 'My account',
      help: 'Help',
      'sign-out': 'Sign out',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when currentUser is undefined', () => {
    it('will render account icon with correct href', () => {
      expect(setup({}, 'uk' as RegionString).container).toMatchSnapshot();
    });

    it('will track the click event', async () => {
      setup({}, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - Sign in',
        label: 'Header',
      });
    });

    it('will push to the sign-in url on click', async () => {
      const { pushSpy } = setup({}, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      expect(pushSpy).toHaveBeenCalledWith('/sign-in');
    });
  });

  describe('when current user is passed in, but id is not present', () => {
    const propsWithFaultyUser = {
      currentUser: mock<User>({
        firstName: 'Skyler',
      }),
    };
    it('will render the SignUsers component with information to sign in', () => {
      expect(setup(propsWithFaultyUser, 'uk' as RegionString).container).toMatchSnapshot();
    });

    it('will track the click event', async () => {
      setup(propsWithFaultyUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - Sign in',
        label: 'Header',
      });
    });

    it('will push to the sign-in url on click', async () => {
      const { pushSpy } = setup(propsWithFaultyUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      expect(pushSpy).toHaveBeenCalledWith('/sign-in');
    });
  });

  describe('when current user is valid', () => {
    const testPropsWithValidUser = {
      currentUser: mock<User>({
        firstName: 'Skyler',
        id: '1',
      }),
    };

    it('will render the account icon', () => {
      expect(setup(testPropsWithValidUser, 'uk' as RegionString).container).toMatchSnapshot();
    });

    it('will track the account icon click', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });
    });

    it('will track the account icon hover', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.hover(screen.getByTestId('navigation-account'));
      snapshotDataLayer(1);
    });

    it('will hide the dropdown on unhover the icon after a timeout', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.hover(screen.getByTestId('navigation-account'));
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
      });
      await user.unhover(screen.getByTestId('navigation-account'));
      act(() => {
        jest.advanceTimersByTime(400);
      });
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).not.toBeVisible();
      });

      snapshotDataLayer(1);
    });

    it('will keep the dropdown visible if we unhover and hover the icon quickly', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.hover(screen.getByTestId('navigation-account'));
      await user.unhover(screen.getByTestId('navigation-account'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
      });
      await user.hover(screen.getByTestId('navigation-account'));
      act(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
      });
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });
    });

    it('will keep the dropdown visible if we unhover the icon and hover the dropdown', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.hover(screen.getByTestId('navigation-account'));
      await user.unhover(screen.getByTestId('navigation-account'));
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
      });
      await user.hover(screen.getByTestId('navigation-account-dropdown'));
      act(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
      });
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });
    });

    it('will hide the dropdown straight away after unhovering the dropdown', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.hover(screen.getByTestId('navigation-account'));
      await user.hover(screen.getByTestId('navigation-account-dropdown'));
      await user.unhover(screen.getByTestId('navigation-account-dropdown'));
      expect(screen.getByTestId('navigation-account-dropdown')).not.toBeVisible();
      snapshotDataLayer(1);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });
    });

    it('will render the dropdown on click', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      expect(screen.getByTestId('navigation-account-dropdown')).toBeVisible();
    });

    it('will track an account dropdown item link click', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      await user.click(screen.getByTestId('account-link-help'));
      snapshotDataLayer(2);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - Help',
        label: 'Header - Account dropdown',
      });
    });

    it('will track the correct path for profile dropdown link when my account flag is on', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      await user.click(screen.getByTestId('account-link-profile'));
      snapshotDataLayer(2);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - My Account',
        label: 'Header - Account dropdown',
      });
    });

    it('will track the correct path for profile dropdown link when my account flag is off', async () => {
      setup(testPropsWithValidUser, 'uk' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      await user.click(screen.getByTestId('account-link-profile'));
      snapshotDataLayer(2);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - My Account',
        label: 'Header - Account dropdown',
      });
    });

    it('will use the correct help link for a given siteID', async () => {
      const { container } = setup(testPropsWithValidUser, 'de' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      expect(container).toMatchSnapshot();
    });

    it('will track the signout link on click', async () => {
      setup(testPropsWithValidUser, 'us' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      await user.click(screen.getByTestId('account-link-signout'));
      snapshotDataLayer(2);

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Opened account dropdown',
        label: 'Header',
      });

      expect(trackStructEvent).toHaveBeenCalledWith({
        category: 'Site interaction',
        action: 'Clicked - Sign out',
        label: 'Header - Account dropdown',
      });
    });

    it('will sign out when the signout link is clicked', async () => {
      setup(testPropsWithValidUser, 'se' as RegionString);
      await user.click(screen.getByTestId('navigation-account'));
      await user.click(screen.getByTestId('account-link-signout'));
      expect(signOutMock).toHaveBeenCalled();
    });
  });
});
