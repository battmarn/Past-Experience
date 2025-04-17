import React, { type FC, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { NotificationBanner } from 'app/components/NotificationBanner';
import type { Notification } from 'app/reducers/notifications';

import s from './styles.module.css';

interface NotificationBannersProps {
  isNavbarMinimised?: boolean;
}

const NotificationBannerItem: FC<{
  in?: boolean;
  notification: Notification;
  isNavbarMinimised: boolean | undefined;
}> = ({ in: inProp, notification, isNavbarMinimised }) => {
  const nodeRef = useRef<HTMLElement>(null);

  return (
    <CSSTransition
      in={inProp}
      appear
      key={notification.text}
      nodeRef={nodeRef}
      unmountOnExit
      timeout={{
        enter: 500,
        exit: 500,
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
      <NotificationBanner ref={nodeRef} isNavbarMinimised={isNavbarMinimised} inCheckout={false} {...notification} />
    </CSSTransition>
  );
};

export const NotificationBanners: FC<NotificationBannersProps> = ({ isNavbarMinimised }) => {
  const notifications = useSelector((state) => state.notifications) || [];

  return (
    <TransitionGroup className={s.banners}>
      {notifications.map((notification) => {
        return (
          <NotificationBannerItem
            key={notification.text}
            notification={notification}
            isNavbarMinimised={isNavbarMinimised}
          />
        );
      })}
    </TransitionGroup>
  );
};
