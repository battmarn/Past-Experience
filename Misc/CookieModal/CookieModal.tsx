import React, { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { showCookieDialog } from 'app/actions/layout';
import { CookieSettings } from 'app/components/CookieSettings/CookieSettings';
import ModalDialog from 'app/components/ModalDialog/container';
import { useNotification } from 'app/hooks/useNotification';

import s from './styles.module.css';

export const CookieModal: FC = () => {
  const notification = useNotification();

  const show = useSelector((state) => state.layout.showCookieDialog);
  const dispatch = useDispatch();

  const handleOnClose = (showNotification: boolean) => {
    dispatch(showCookieDialog(false));

    if (showNotification) {
      notification.add({
        type: 'info',
        text: 'Cookies updated',
      });
    }
  };

  return (
    <ModalDialog greyBackground show={show} onCloseDialog={() => handleOnClose(false)} className={s.modalOverrides}>
      <CookieSettings onSave={() => handleOnClose(true)} />
    </ModalDialog>
  );
};
