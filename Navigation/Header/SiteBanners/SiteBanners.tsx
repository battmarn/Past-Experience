import cx from 'classnames';
import React, { type FC, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { NotificationBanner } from 'app/components/NotificationBanner';
import type { SiteBanner } from 'app/reducers/layout';

import s from './styles.module.css';

interface SiteBannersProps {
  siteBanners: SiteBanner[];
  inCheckout: boolean;
  className?: string;
}

const SiteBannerItem: FC<{
  message: string;
  title?: string;
  isActive: boolean;
  inCheckout: boolean;
}> = ({ message, title, isActive, inCheckout }) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <CSSTransition
      key={message}
      in={isActive}
      nodeRef={ref}
      appear
      timeout={{
        enter: 500,
        exit: 300,
      }}
      classNames={{
        enter: s.enter,
        enterActive: s.enterActive,
        enterDone: s.enterDone,
        exit: s.exit,
        exitActive: s.exitActive,
        exitDone: s.exitDone,
      }}
    >
      <NotificationBanner
        ref={ref}
        className={cx(s.notification, isActive && s.active)}
        type="banner"
        text={message}
        title={title}
        inCheckout={inCheckout}
      />
    </CSSTransition>
  );
};

const BANNER_INTERVAL_MS = 6000;

export const SiteBanners: FC<SiteBannersProps> = ({ siteBanners, inCheckout, className }) => {
  const bannerTexts = siteBanners.flatMap((banner) => banner.bannerTexts);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const timerRef = useRef(0);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1 >= bannerTexts.length ? 0 : prevIndex + 1));
    }, BANNER_INTERVAL_MS);

    return () => {
      timerRef.current && window.clearInterval(timerRef.current);
    };
  }, [bannerTexts.length]);

  return (
    <TransitionGroup data-test-id="site-banners" className={cx(s.textBanners, className)}>
      {bannerTexts.map((bannerText, index) => (
        <SiteBannerItem
          key={bannerText.id}
          message={bannerText.content || bannerText.title}
          title={bannerText.title}
          isActive={index === currentMessageIndex}
          inCheckout={inCheckout}
        />
      ))}
    </TransitionGroup>
  );
};
