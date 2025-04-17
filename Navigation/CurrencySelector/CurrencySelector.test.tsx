import React from 'react';

import { act, userEvent } from 'app/bit-migration/test-utilities/react-renderer';
import { createUseCurrentLocationMock } from 'app/hooks/useCurrentLocationMock';
import { clearDataLayer, snapshotDataLayer } from 'app/lib/analytics/analytics.mock';
import { createUseTrackingLocationMock } from 'app/providers/GTM/TrackingLocationProvider.mock';
import { renderWithStore } from 'test/helpers/renderWithStore';

import { withNavigationContext } from '../Context/Context';

import { CurrencySelector as CurrencySelectorComponent } from '.';

const CurrencySelector = withNavigationContext(CurrencySelectorComponent);

describe('CurrencySelector', () => {
  beforeEach(() => {
    clearDataLayer();
    createUseCurrentLocationMock();
    createUseTrackingLocationMock('Header - Menu');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render as expected', () => {
    const { container } = renderWithStore(<CurrencySelector />);
    expect(container).toMatchSnapshot();
  });

  it('should behave as expected when elements are hovered over', async () => {
    const { getByText, getByTestId } = renderWithStore(<CurrencySelector />);

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'true');

    await userEvent.hover(getByTestId('header-selected-site'), { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'false');

    await userEvent.click(getByText('SEK | kr'), { delay: null });

    snapshotDataLayer(2);

    expect(getByTestId('header-selected-site')).toHaveTextContent('SEK | kr');
  });

  it('should fire events on open and close - mouse', async () => {
    const { getByTestId } = renderWithStore(<CurrencySelector />);

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'true');

    // hover
    await userEvent.pointer({ target: getByTestId('header-selected-site') }, { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'false');

    // then click the existing hovered item
    await userEvent.pointer({ target: getByTestId('header-selected-site'), keys: '[MouseLeft]' }, { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'true');

    // then click it again
    await userEvent.pointer({ target: getByTestId('header-selected-site'), keys: '[MouseLeft]' }, { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'false');

    snapshotDataLayer(3);
  });

  it('should fire events on open and close - touch', async () => {
    const { getByTestId } = renderWithStore(<CurrencySelector />);

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'true');

    // tap on selector to open
    await userEvent.pointer({ target: getByTestId('header-selected-site'), keys: '[TouchA]' }, { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'false');

    // tap on selector again to close
    await userEvent.pointer({ target: getByTestId('header-selected-site'), keys: '[TouchA]' }, { delay: null });

    expect(getByTestId('country-select')).toHaveAttribute('aria-hidden', 'true');

    snapshotDataLayer(2);
  });

  it('when mouse leaves allow 300ms before closing the menu', async () => {
    jest.useFakeTimers();

    const { getByTestId } = renderWithStore(<CurrencySelector />);
    const selectedSiteHeader = getByTestId('header-selected-site');
    const menu = getByTestId('country-select');

    expect(menu).toHaveAttribute('aria-hidden', 'true');

    await userEvent.hover(selectedSiteHeader, { delay: null });

    expect(menu).toHaveAttribute('aria-hidden', 'false');

    await userEvent.unhover(selectedSiteHeader, { delay: null });

    expect(menu).toHaveAttribute('aria-hidden', 'false');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(menu).toHaveAttribute('aria-hidden', 'true');

    snapshotDataLayer(2);
  });
});
