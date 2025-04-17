import React, { type FC, useState } from 'react';

import { Button } from 'app/bit-migration/react-components/button/button';
import { Markdown } from 'app/components/Markdown2/Markdown';
import { useConsent } from 'app/hooks/useConsent';
import { useCookieText } from 'app/hooks/useRegionalData';
import { type CookieSettings as CookieSettingsType, cookieSettingDefaults } from 'app/reducers/layout';

import { CookieSettingRow } from './CookieSettingRow';
import s from './styles.module.css';
import { type CookieSwitch, type PropertyNames, useCookieSwitches } from './useCookieSwitches';

interface CookieSettingsProps {
  onSave?: (newCookieState: CookieSettingsType) => void;
}

export const CookieSettings: FC<CookieSettingsProps> = ({ onSave }) => {
  const { setConsent, getSettings } = useConsent();
  const cookieSettings = getSettings();
  const [cookieState, setCookieState] = useState<CookieSettingsType>(cookieSettings ?? cookieSettingDefaults);

  const handleChange = (value: boolean, propertyName: CookieSwitch['propertyName']) => {
    const state = { ...cookieState };
    state[propertyName as PropertyNames] = value;
    setCookieState(state);
  };

  const saveChanges = () => {
    setConsent({ allowAll: false, cookieState });
    onSave?.(cookieState);
  };

  const cookieMessage = useCookieText('cookie-message', {
    defaultValue:
      'We use cookies to improve your experience on our website. You can allow all or manage them individually. Find out more about our cookie policy',
  });

  const ourCookies = useCookieText('our-cookies', { defaultValue: 'Our Cookies' });
  const saveChangesText = useCookieText('save-changes', { defaultValue: 'Save Changes' });

  const switches = useCookieSwitches();

  return (
    <div>
      <h1 className={s.mainHeading}>{ourCookies}</h1>
      <Markdown className={s.introText}>{cookieMessage}</Markdown>
      <div className={s.cookieOptions}>
        {cookieState &&
          switches.map((sw) => (
            <CookieSettingRow
              key={sw.propertyName}
              switch={sw}
              handleChange={handleChange}
              checked={cookieState[sw.propertyName as PropertyNames]}
            />
          ))}
      </div>
      <Button onClick={saveChanges} colorScheme="darkGrey" maxWidth="290px" mx="auto">
        {saveChangesText}
      </Button>
    </div>
  );
};
