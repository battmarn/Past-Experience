import { useCookieText } from 'app/hooks/useRegionalData';

const ANALYTICS_ADVERTISING_DEFAULT =
  'These cookies gather information such as how many people are using our site or which pages are popular to help us improve customer experience. Switching to these cookies will mean we can’t gather information to improve the experience.';

export enum PropertyNames {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  ADVERTISING = 'advertising',
  PERSONALISATION = 'personalisation',
}

interface SwitchType {
  propertyName: string;
  disabled: boolean;
  title: string;
  description: string;
}

export const useCookieSwitches = (): SwitchType[] => {
  return [
    {
      propertyName: PropertyNames.ESSENTIAL,
      disabled: true,
      title: useCookieText('cb-essential-title', { defaultValue: 'Essential' }),
      description: useCookieText('cb-essential-text', {
        defaultValue:
          'These cookies are needed for essential functions, like payments. Essential cookies can not be turned offand do not store your information.',
      }),
    },
    {
      propertyName: PropertyNames.ANALYTICS,
      disabled: false,
      title: useCookieText('cb-analytics-title', { defaultValue: 'Analytics' }),
      description: useCookieText('cb-analytics-text', {
        defaultValue: ANALYTICS_ADVERTISING_DEFAULT,
      }),
    },
    {
      propertyName: PropertyNames.ADVERTISING,
      disabled: false,
      title: useCookieText('cb-advertising-title', { defaultValue: 'Advertising' }),
      description: useCookieText('cb-advertising-text', {
        defaultValue: ANALYTICS_ADVERTISING_DEFAULT,
      }),
    },
    {
      propertyName: PropertyNames.PERSONALISATION,
      disabled: false,
      title: useCookieText('cb-personalisation-title', { defaultValue: 'Personalisation' }),
      description: useCookieText('cb-personalisation-text', {
        defaultValue:
          'These cookies help us to learn what you’re interested in so we can show you relevant content while you shop on our site.',
      }),
    },
  ];
};

export type CookieSwitch = ReturnType<typeof useCookieSwitches>[number];
