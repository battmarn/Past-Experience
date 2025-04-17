import { trackTransaction } from '@snowplow/browser-plugin-snowplow-ecommerce';
import type { Auth } from '@trinnylondon/global.types.auth';
import type { Bag, DiscountCode, LineItem as LineItemType, LineItemVariant } from '@trinnylondon/global.types.bag';
import type { CurrencyString, LocaleString } from '@trinnylondon/global.types.config';
import type { Price } from '@trinnylondon/global.types.pricing';
import { formatCurrency } from '@trinnylondon/global.utils.format-currency';
import { Head } from '@trinnylondon/react-ssr.common';
import cx from 'classnames';
import { alpha2ToAlpha3 } from 'i18n-iso-countries';
import React, { type FC, useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import YouTube from 'react-youtube';

import { Link } from 'app/bit-migration/react-components/link/link';
import { BagItem } from 'app/components/BagDrawer/BagItems/BagItem';
import { PriceLabel } from 'app/components/Price/PriceLabel';
import { Prices } from 'app/components/Price/Prices';
import { useGtmSiteInteraction } from 'app/hooks/gtm/useGtmSiteInteraction';
import { useSiteId } from 'app/hooks/useSiteId';
import { fireItemsHit, fireTransactionHit } from 'app/lib/analytics/abTasty';
import { clearDataLayerEcommerce, gtmEvent } from 'app/lib/analytics/analytics';
import { tatariTrack } from 'app/lib/analytics/tatari';
import { getFilteredOrderItems } from 'app/lib/bag/getFilteredItems';
import { removeMiniBffs } from 'app/lib/bag/removeMiniBffs';
import { sortLineItems } from 'app/lib/bag/sortLineItems';
import { mergeFieldsToText } from 'app/lib/localisation';
import { getGTMProductCategory, getGTMProductSubCategory, getTotalTax } from 'app/lib/mapProductDetailsGTMHelper';
import { SearchContext } from 'app/providers/search/AlgoliaSearchProvider';
import { useCreateCartMutation } from 'app/queries/cart/cart';
import { mapProductsForAnalytics, mapProductsForGTMPurchaseEvent } from 'app/utils/mapProductsForAnalytics';
import { formatPhoneNumber } from 'app/utils/phone';
import type { User } from 'types';
import type { Customer } from 'types/bag';
import type { PaymentMethod, PaymentState, PaymentStatus } from 'types/bag/payment';
import type { Address, ShippingInfo } from 'types/bag/shipping';

import s from './styles.module.css';
import { TrustedShopsBadge } from './TrustedShopsBadge';

interface AddressType extends Address {
  fullAddress: { singleLine: string };
}
interface Tax {
  name: string;
  rate: number;
  amount: Price;
}

interface CentPrice {
  currency: string;
  centAmount: number;
  fractionDigits: number;
}
export interface OrderConfirmationPageOrder {
  data: {
    id: string;
    orderNumber: string;
    lineItems: (LineItemType & { slug?: string; variant?: LineItemVariant })[];
    createdAt: string;
    lastModifiedAt: string;
    subTotal: Price;
    locale: LocaleString;
    shippingAddress: AddressType;
    billingAddress: AddressType;
    state: { name: string; key: string; description: string | null; initial: boolean; builtIn: boolean };
    paymentStatus: PaymentState;
    payments: {
      id: string;
      key: string;
      version: number;
      amount: Price;
      currency: string;
      createdAt: string;
      lastModifiedAt: string;
      paymentMethod: PaymentMethod & { cardScheme: string };
      paymentStatus: PaymentStatus;
    }[];
    rafCode: string;
    total: Price;
    tax: Tax[];
    shippingInfo: ShippingInfo;
    discountCodes: DiscountCode[];
    customer: Customer;
    bag: Bag;
    itemTotalBeforeDiscount: Price;
    discountTotal: Price;
    netPrice: CentPrice;
    postDiscountNetPrice?: CentPrice;
    isTaxInclusive: boolean;
  };
  errors: unknown;
  meta: { version: number };
}

interface Props {
  order: OrderConfirmationPageOrder;
  auth: Auth | null | undefined;
  bag: Bag;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
  resetBag: any;
  temporaryUser?: User;
  currentUser?: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
  staticText: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
  facebookData: Record<string, any>;
}

// https://trinnylondon.com/us/checkout-success?orderID=checkout.order_id&customerID=customer.id&checkoutID=checkout.id
// https://localhost/us/checkout-success?orderID=1238262022189&customerID=1996301434925&checkoutID=e9e6c6eae0374e4ef72f50b4bc72058c
// https://localhost/uk/checkout-success?orderID=1100956106870&customerID=6064833618&checkoutID=e9e6c6eae0374e4ef72f50b4bc72058c
// https://trinnylondon.com/us/checkout-success?orderID=1238262022189&customerID=1996301434925&checkoutID=e9e6c6eae0374e4ef72f50b4bc72058c

// eslint-disable-next-line @typescript-eslint/no-shadow -- [TF-686] Make an effort to fix me
const cardScheme = ({ cardScheme, method }: { cardScheme: string; gateway: string; method: string }) => {
  switch (method) {
    case 'mc':
      return 'Mastercard';

    case 'visa':
      return 'Visa';

    case 'amex':
      return 'American Express';

    case 'GiftCard':
      return 'Giftcard';

    case 'paypal':
      return 'PayPal';

    default:
      return cardScheme;
  }
};

export const OrderConfirmationPage: FC<Props> = (props) => {
  const { mutateAsync: createCart } = useCreateCartMutation();
  const siteId = useSiteId();
  const { insightsClient } = useContext(SearchContext);
  const algoliaPrefix = useSelector((state) => state.config?.algolia?.indexPrefix);

  const gtmSiteInteractions = useGtmSiteInteraction();

  const tax = getTotalTax(props.order?.data?.tax);

  const indexName = `${algoliaPrefix}${siteId}`;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    const { order, bag, resetBag, temporaryUser, currentUser, facebookData = {} } = props;

    if (order.data) {
      const { lastModifiedAt, payments, rafCode, locale, shippingAddress, ...gtmOrderData } = order.data;

      const { billingAddress, lineItems } = order.data;

      const dateOfBirth = currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined;

      const dateOfBirthObj = Number.isNaN(dateOfBirth)
        ? {}
        : {
            date_of_birth: currentUser?.dateOfBirth,
          };

      const isNewCustomer =
        typeof currentUser?.isNewCustomer !== 'undefined'
          ? currentUser.isNewCustomer
          : Boolean(temporaryUser?.isNewCustomer);
      const domain = window?.location?.hostname;

      const { orderNumber, total, shippingInfo, postDiscountNetPrice, discountCodes } = gtmOrderData;
      const products = mapProductsForAnalytics(gtmOrderData.lineItems);
      if (siteId === 'us') {
        tatariTrack('purchase', { orderId: orderNumber, total: total.numericPrice, products });
      }

      gtmEvent('TransactionComplete', {
        is_new_customer: isNewCustomer,

        first_name: billingAddress?.firstName || shippingAddress?.firstName,

        last_name: billingAddress?.lastName || shippingAddress?.lastName,
        ...dateOfBirthObj,

        phone_number: formatPhoneNumber(billingAddress?.contactInfo?.phone || shippingAddress?.contactInfo?.phone),

        city: billingAddress?.city || shippingAddress?.city,

        post_code: billingAddress?.postalCode || shippingAddress?.postalCode,

        country: (billingAddress?.country || shippingAddress?.country || '').toLowerCase(),

        country_alpha_3: alpha2ToAlpha3(billingAddress?.country || shippingAddress?.country),
        domain,

        full_address: billingAddress?.fullAddress?.singleLine || shippingAddress.fullAddress?.singleLine,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
        user_agent: facebookData?.clientUserAgent || navigator.userAgent,

        order_data: { ...gtmOrderData, shippingAddress },

        orderId: orderNumber,

        value: total.numericPrice,

        net_product_value: (postDiscountNetPrice?.centAmount ?? 0) / 100,

        currency: total.currency,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
        client_ip_address: facebookData?.clientIp,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
        click_id: facebookData?.fbc,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
        browser_id: facebookData?.fbp,
        version: '1.0',
        contents: (lineItems || []).map(
          (item: { sku: string; quantity: number; title: string; variant?: { title: string }; price: Price }) => ({
            id: item.sku,
            quantity: item.quantity,
            productName: item.title,
            productShade: item.variant?.title ?? '',
            productPrice: item.price?.numericPrice,
          }),
        ),
      });

      fireTransactionHit({
        tid: orderNumber,
        ta: 'Purchase',
        tr: total.numericPrice,
        ts: shippingInfo.discountedPrice?.numericPrice ?? shippingInfo.price.numericPrice,
        tt: tax,
        tc: total.currency,
        tcc: discountCodes?.[0]?.code.slice(0, 10),
        pm: payments?.[0]?.paymentMethod?.method.slice(0, 10),
        sm: shippingInfo.shippingMethodName.slice(0, 10),
        icn: lineItems.length,
      });
      fireItemsHit(lineItems, orderNumber);

      clearDataLayerEcommerce();

      gtmEvent('purchase', () => ({
        ecommerce: {
          tax,
          transaction_id: orderNumber,
          affiliation: 'online store',

          value: total.numericPrice,

          shipping: (shippingInfo.discountedPrice ?? shippingInfo.price).numericPrice.toString(),

          currency: total.currency,

          coupon:
            (discountCodes || [])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- [TF-686] Make an effort to fix me
              .map((code: any) => code.code)
              .join('|') || '(not set)',
          items: mapProductsForGTMPurchaseEvent(lineItems),
        },
      }));

      const purchased_items = [];
      let total_quantity = 0;

      const item_list = gtmOrderData.lineItems || [];
      for (const item of item_list) {
        total_quantity += item.quantity;
        purchased_items.push({
          id: item.sku,

          name: item.title,

          category: `${getGTMProductCategory(item)}/${getGTMProductSubCategory(
            item.slug ? item.slug : item.productSlug,
          )}`,

          variant: item.variant?.title.slice(0, 255),

          price: item.price.numericPrice,

          quantity: item.quantity,

          currency: total.currency,
        });
      }

      trackTransaction({
        transaction_id: orderNumber,

        revenue: total.numericPrice,

        currency: total.currency,

        discount_code:
          (discountCodes || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- [TF-686] Make an effort to fix me
            .map((code: any) => code.code)
            .join('|') || '(not set)',

        payment_method: order?.data?.payments?.[0]?.paymentMethod?.method || 'pending',
        total_quantity,

        tax,

        shipping: shippingInfo.discountedPrice?.numericPrice ?? shippingInfo.price.numericPrice,
        products: purchased_items,
      });

      if (insightsClient) {
        const regex = /queryId=([\da-z]+)(?:$|::)/;
        insightsClient('purchasedObjectIDsAfterSearch', {
          eventName: 'Purchase',
          index: indexName,
          objectIDs: lineItems.map((lineItem) => {
            return lineItem.sku;
          }),
          objectData: lineItems.map((lineItem) => {
            return {
              price: lineItem.price.numericPrice,
              quantity: lineItem.quantity,
              queryID: lineItem.source.match(regex)?.[1],
            };
          }),
          value: total.numericPrice,
          currency: total.currency,
        });
      }
    }

    const resetBagFunc = async () => {
      if (bag.bagState === 'Ordered' || bag.id === order.data.bag.id) {
        const cart = await createCart();
        if (!cart) {
          // this is the pre-cart-service flow
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- [TF-686] Make an effort to fix me
          resetBag(siteId, currentUser);
        }
      }
    };
    void resetBagFunc();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Direct migration from componentDidMount.
  }, []);

  const { auth, staticText } = props;

  const order = props?.order?.data ?? null;

  const isExclusiveTax = order.isTaxInclusive === false;

  const customer = order.customer ?? null;

  const filteredLineItems = removeMiniBffs(getFilteredOrderItems(order.lineItems));
  const sortedItems = sortLineItems(filteredLineItems);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWidth]);

  const videoWidth = width > 600 ? 560 : width - 40;
  const videoHeight = (videoWidth / 560) * 315;

  const youTubeOpts = {
    height: videoHeight.toFixed(0),
    width: videoWidth.toFixed(0),
  };

  const handleYouTubeClick = (eventName: string): void => {
    gtmSiteInteractions(eventName, 'click', 'YouTube Video');
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {order && customer ? (
        <div className={s.root}>
          <h1 className={s.heading} data-test-id="order-confirmation">
            {staticText['order-confirmation-title'] || 'Your order confirmation'}
          </h1>
          <div className={s.container}>
            <div className={s.thanks}>
              <div className={s.orderBlock}>
                <h3 className={s.title} data-test-id="order-confirmation-title">
                  {mergeFieldsToText(
                    staticText,
                    'order-confirmation-greeting',

                    `Hi ${customer.firstName}, thanks for your order`,
                    [
                      {
                        name: 'customerFirstName',

                        value: customer.firstName ?? '',
                      },
                    ],
                  )}
                </h3>
                <p>
                  {staticText['order-confirmation-processing'] ||
                    'Welcome to Trinny London. We are processing your order and you will receive an email confirmation shortly.'}
                </p>
                {!auth && (
                  <p>
                    {staticText['order-confirmation-sign-up'] || 'You can sign-up to Trinny London'}{' '}
                    <Link
                      onClick={() => {
                        gtmSiteInteractions('Navigation - Order Confirmation Page', 'Sign Up', 'click');
                      }}
                      href="/sign-up"
                    >
                      {(
                        (staticText && Array.isArray(staticText.here) ? staticText.here : 'here') as string
                      ).toLowerCase()}
                    </Link>
                    .
                  </p>
                )}
              </div>
              <div className={s.orderBlock}>
                <span className={s.infoTitle} data-test-id="order-confirmation-number">
                  {staticText['order-confirmation-your-order-number'] || 'Your order number'}:
                </span>{' '}
                <span className={s.nowrap}>{order.orderNumber}</span>
              </div>

              <div className={s.orderBlock}>
                <span className={s.infoTitle} data-test-id="order-confirmation-delivery-method">
                  {staticText['order-confirmation-delivery-method'] || 'Delivery method'}:
                </span>{' '}
                <span className={s.nowrap}>{order.shippingInfo.shippingMethodName}</span>
              </div>

              {order.payments && order.payments.length > 0 && (
                <div className={s.orderBlock}>
                  {order.payments && order.payments.length === 1 && (
                    <>
                      <span className={s.infoTitle} data-test-id="order-confirmation-payment-details">
                        {staticText['order-confirmation-payment-details'] || 'Payment Details'}:
                      </span>{' '}
                      <span className={s.nowrap}>{cardScheme(order.payments[0].paymentMethod)}</span>
                    </>
                  )}

                  {order.payments && order.payments.length > 1 && (
                    <>
                      <span className={s.infoTitle} data-test-id="order-confirmation-payment-details">
                        {staticText['order-confirmation-payment-details'] || 'Payment Details'}:
                      </span>{' '}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me */}
                      {order.payments.map((payment: any) => (
                        // eslint-disable-next-line react/jsx-key -- [TF-686] Make an effort to fix me
                        <div className={s.paymentRow}>
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me */}
                          <div>{cardScheme(payment.paymentMethod)}</div>
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me */}
                          <div>{payment.amount.formattedPrice}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className={s.order}>
              <h4 className={s.sectionTitle}>{staticText['order-confirmation-your-order'] || 'Your order'}:</h4>
              <div className={s.itemsContainer}>
                {sortedItems.map((item) => (
                  <BagItem key={item.id} item={item} lineItems={order.lineItems} className={s.orderItem} reducedItem />
                ))}
              </div>
              <div className={s.totals}>
                <div className={s.totalRow} data-test-id="order-confirmation-subtotal">
                  <div>{staticText['order-confirmation-subtotal'] || 'Subtotal'}</div>

                  <div>{order.itemTotalBeforeDiscount.formattedPrice}</div>
                </div>
                <div className={s.totalRow} data-test-id="order-confirmation-delivery">
                  <div>{staticText['order-confirmation-delivery'] || 'Delivery'}</div>
                  <div>
                    <Prices
                      forceCurrencyDisplay
                      price={order.shippingInfo.price}
                      discountedPrice={order.shippingInfo.discountedPrice}
                    />
                  </div>
                </div>

                {order.discountTotal.numericPrice < 0 && (
                  <div className={s.totalRow}>
                    <div>{staticText['order-confirmation-discount'] || 'Discount'}</div>
                    <div>
                      <PriceLabel variant="discounted">
                        {formatCurrency(order.discountTotal.currency, order.discountTotal.numericPrice)}
                      </PriceLabel>
                    </div>
                  </div>
                )}
                {isExclusiveTax && tax && (
                  <div className={s.totalRow} data-test-id="order-confirmation-tax">
                    <div>{staticText['order-confirmation-tax'] || 'Tax'}</div>
                    <div>
                      <div>{formatCurrency(order.netPrice.currency as CurrencyString, tax)}</div>
                    </div>
                  </div>
                )}
                <div className={cx(s.totalRow, s.bold)} data-test-id="order-confirmation-total">
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- [TF-686] Make an effort to fix me */}
                  <div>{(staticText['order-confirmation-total'] || 'TOTAL').toUpperCase()}</div>

                  <div>{order.total.formattedPrice}</div>
                </div>
              </div>
            </div>
          </div>

          {siteId === 'de' ? (
            <TrustedShopsBadge
              orderNumber={order.orderNumber}
              amount={order.total.numericPrice}
              currency={order.total.currency}
            />
          ) : null}

          <div className={cx(s.container, s.youtube)} data-test-id="order-confirmation-youtube-container">
            <div className={s.orderBlock}>
              <h2 className={cx(s.heading, s.youtubeHeading)} data-test-id="order-confirmation-youtube-title">
                {staticText['order-confirmation-youtube-title'] || 'The Trinny Takeover Show'}
              </h2>
              <div className={s.youtubeCaption} data-test-id="order-confirmation-youtube-caption">
                {staticText['order-confirmation-youtube-caption'] || 'Latest episode'}
              </div>
              <span data-test-id="order-confirmation-youtube-player">
                <YouTube
                  onPlay={() => handleYouTubeClick('Play')}
                  onPause={() => handleYouTubeClick('Pause')}
                  opts={youTubeOpts}
                  videoId={(staticText['order-confirmation-youtube-video-id'] || 'fscoXtsuaao') as string}
                />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1>{staticText['order-confirmation-missing'] || 'Missing order information'}</h1>
        </div>
      )}
    </>
  );
};
