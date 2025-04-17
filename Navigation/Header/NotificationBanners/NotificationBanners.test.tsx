import React from 'react';
import * as reactRedux from 'react-redux';

import { renderWithStore } from 'test/helpers/renderWithStore';

import { NotificationBanners } from './index';

jest.mock(
  'react-redux',
  () =>
    ({
      ...jest.requireActual('react-redux'),
    } as jest.Mock),
);

const mockNotifications = [
  {
    text: 'Wrong email or password, please try again.',
    type: 'error',
    scroll: false,
    persistOnLocationChange: true,
  },
];

describe('<NotificationBanners />', () => {
  beforeEach(() => {
    jest.spyOn(reactRedux, 'useSelector').mockReturnValue(mockNotifications);
  });

  it('will render notification banner', () => {
    expect(renderWithStore(<NotificationBanners isNavbarMinimised={false} />).container).toMatchSnapshot();
  });

  it('will render notification banner with minimised class', () => {
    expect(renderWithStore(<NotificationBanners isNavbarMinimised />).container).toMatchSnapshot();
  });
});
