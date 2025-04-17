import React from 'react';

import { UPDATE_ORDER } from 'app/actions/types';
import { TrackingLocationProvider } from 'app/providers/GTM/TrackingLocationProvider';
import OrderConfirmationPage from 'app/views/OrderConfirmation/container';

import type { RouteBuilder } from './utils/builder';
import { reduxLoader } from './utils/reduxLoader';
import { notFound } from './utils/responses';

export const orderConfirmationRoutes: RouteBuilder = (context) => [
  {
    path: 'order-confirmation',
    children: [
      {
        path: ':orderNumber',
        element: (
          <TrackingLocationProvider location={'Order Confirmation Page'}>
            <OrderConfirmationPage />
          </TrackingLocationProvider>
        ),
        loader: reduxLoader(context, ({ params }) => {
          return {
            type: UPDATE_ORDER,
            tlApiUrl: `/order/${params.orderNumber}?allowBag=true`,
            seoPathnameOverride: '/order-confirmation',
          };
        }),
      },
      {
        // We don't have anything to render at /order-confirmation so treat it as a 404.
        index: true,
        element: null,
        loader: () => {
          throw notFound();
        },
      },
    ],
  },
];
