import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithStore } from '../../../../test/helpers/renderWithStore';

import { CookieSettingRow } from './CookieSettingRow';

describe('CookieSettingRow', () => {
  const sw = {
    propertyName: 'testPropertyName',
    disabled: false,
    title: 'testTitle',
    description: 'testDescription',
  };

  it('renders switch', () => {
    renderWithStore(<CookieSettingRow switch={sw} handleChange={() => {}} checked={false} />);

    expect(screen.getByLabelText('testTitle')).toBeInTheDocument();
  });

  it('can be interacted with', () => {
    renderWithStore(<CookieSettingRow switch={sw} handleChange={() => {}} checked={false} />);

    expect(screen.getByLabelText('testTitle')).toBeEnabled();
  });

  it('disables switch if set to disabled', () => {
    renderWithStore(<CookieSettingRow switch={{ ...sw, disabled: true }} handleChange={() => {}} checked={false} />);

    expect(screen.getByLabelText('testTitle')).toBeDisabled();
  });
});
