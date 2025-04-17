import React, { type FC, useId } from 'react';

import Switch from 'app/components/Switch';

import s from './styles.module.css';
import type { CookieSwitch } from './useCookieSwitches';

export const CookieSettingRow: FC<{
  switch: CookieSwitch;
  handleChange: (value: boolean, propertyName: CookieSwitch['propertyName']) => void;
  checked: boolean;
}> = ({ switch: sw, handleChange, checked }) => {
  const id = useId();
  const { propertyName, disabled, title, description } = sw;
  return (
    <div className={s.cookieOptionRow}>
      <div className={s.switchContainer}>
        <Switch id={id} onChange={(value) => handleChange(value, propertyName)} checked={checked} disabled={disabled} />
      </div>
      <div>
        <h2 className={s.cookieHeading}>
          <label htmlFor={id}>{title}</label>
        </h2>
        <p className={s.cookieText}>{description}</p>
      </div>
    </div>
  );
};
