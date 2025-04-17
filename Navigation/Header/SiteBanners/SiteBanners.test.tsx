import { render, screen } from '@testing-library/react';
import type { SiteString } from '@trinnylondon/global.types.config';
import React from 'react';

import type { SiteBanner } from 'app/reducers/layout';

import { SiteBanners } from './SiteBanners';

describe('<SiteBanners />', () => {
  it('will render the content or title for the given site banners', () => {
    const banner1Content = 'Hello, I am banner one';
    const banner2Title = 'Hello, I am banner two';

    const siteBanners: SiteBanner[] = [
      {
        id: '1',
        title: '',
        bannerType: 'site-wide-regional',
        site: 'UK' as SiteString,
        bannerTexts: [
          {
            id: '1.1',
            title: 'Title1.1',
            content: banner1Content,
          },
        ],
      },
      {
        id: '2',
        title: '',
        bannerType: 'site-wide-regional',
        site: 'UK' as SiteString,
        bannerTexts: [
          {
            id: '2.1',
            title: banner2Title,
          },
        ],
      },
    ];

    render(<SiteBanners siteBanners={siteBanners} inCheckout={false} />);

    expect(screen.getByText(banner1Content)).toBeInTheDocument();
    expect(screen.getByText(banner2Title)).toBeInTheDocument();
  });
});
