import { screen } from '@testing-library/react';
import React from 'react';

import { userEvent } from 'app/bit-migration/test-utilities/react-renderer';
import { defaultConsentState, type CookieSettings as CookieSettingsType } from 'app/reducers/layout';

import { renderWithStore } from '../../../../test/helpers/renderWithStore';

import { CookieSettings } from './CookieSettings';

describe('CookieSettings', () => {
  it('renders switches for each property', () => {
    renderWithStore(<CookieSettings />);

    expect(screen.getByLabelText('Essential')).toBeInTheDocument();
    expect(screen.getByLabelText('Analytics')).toBeInTheDocument();
    expect(screen.getByLabelText('Advertising')).toBeInTheDocument();
    expect(screen.getByLabelText('Personalisation')).toBeInTheDocument();
  });

  it('disables the Essential switch', () => {
    renderWithStore(<CookieSettings />);

    expect(screen.getByLabelText('Essential')).toBeDisabled();
  });

  it('calls onSave with updated settings', async () => {
    const onSave = jest.fn();

    renderWithStore(<CookieSettings onSave={onSave} />, {
      layout: {
        showCookieDialog: false,
        cookieConsentSettings: defaultConsentState,
      },
    });

    await userEvent.click(screen.getByLabelText('Analytics'));
    await userEvent.click(screen.getByLabelText('Advertising'));

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSave).toHaveBeenCalledOnce();

    expect(onSave).toHaveBeenCalledWith<[CookieSettingsType]>({
      advertising: true,
      analytics: true,
      essential: true,
      personalisation: false,
    });
  });
});

describe('ConsentSettingsCookie', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- globalThis has to be of type any
    jest.spyOn(global as any, 'fetch').mockImplementation(() => ({
      catch: jest.fn(),
    }));
  });
  it('renders using Consent Settings as the source', async () => {
    const onSave = jest.fn();
    renderWithStore(<CookieSettings onSave={onSave} />, {
      layout: {
        cookieConsentSettings: defaultConsentState,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSave).toHaveBeenCalledOnce();

    expect(onSave).toHaveBeenCalledWith<[CookieSettingsType]>({
      advertising: false,
      analytics: false,
      essential: true,
      personalisation: false,
    });
  });
});
