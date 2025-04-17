import { screen } from '@testing-library/react';

import { orderLoadTestBettyCremin } from 'fixtures/trinnylondon-api/order';

import { orderConfirmationRoutes } from './orderConfirmation.routes';
import { createMockRouteContext, renderRouter } from './utils/testUtils';

describe('/order-confirmation/:orderNumber', () => {
  it('fetches order data and renders the order confirmation page', async () => {
    const context = createMockRouteContext({
      config: {
        trustedShops: { id: 'abc' },
      },
      checkout: {
        bag: {
          lineItems: [],
        },
      },
    });
    const routes = orderConfirmationRoutes(context);
    const mockOrderNumber = orderLoadTestBettyCremin.data.orderNumber;

    await renderRouter(`/order-confirmation/${mockOrderNumber}`, routes, context);

    expect(screen.getByText('Your order number:')).toBeInTheDocument();
    expect(screen.getAllByText(mockOrderNumber)[0]).toBeInTheDocument();
  });

  it('shows the 404 page when an order was not found', async () => {
    const context = createMockRouteContext();
    const routes = orderConfirmationRoutes(context);

    await renderRouter('/order-confirmation/cheese', routes, context);

    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });
});

describe('/order-confirmation', () => {
  it('shows the 404 page', async () => {
    const context = createMockRouteContext();
    const routes = orderConfirmationRoutes(context);

    await renderRouter('/order-confirmation', routes, context);

    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });
});
