import { connect } from 'react-redux';

import { resetBag } from 'app/actions/checkout/bag';
import { OrderConfirmationPage } from 'app/views/OrderConfirmation';

function mapStateToProps({
  order,
  auth,
  clientHasRendered,
  checkout,
  temporaryUser,
  currentUser,

  regionalData: { staticText },

  facebookData,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
any) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    order,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    auth,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    clientHasRendered,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
    bag: checkout.bag,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    temporaryUser,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    currentUser,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
    staticText: { ...order.data.staticText, ...staticText },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
    facebookData,
  };
}

const mapDispatchToProps = {
  resetBag,
};
// eslint-disable-next-line import/no-default-export -- [TF-686] Make an effort to fix me
export default connect(mapStateToProps, mapDispatchToProps)(OrderConfirmationPage);
