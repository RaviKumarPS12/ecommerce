export interface ICheckoutProp extends StateProps, DispatchProps {}

class CheckoutContainer extends React.Component<ICheckoutProp> {
  private paymentContainer = React.createRef<HTMLDivElement>();
  //...

  componentDidMount() {
    this.props.getEntityForCurrentUser();
    this.props.getAdyenConfig();
    this.props.getPaymentMethods();
  }

  componentDidUpdate(prevProps: ICheckoutProp) {
    const { paymentMethodsRes, config, paymentRes, paymentDetailsRes, errorMessage } = this.props;
    if (errorMessage && errorMessage !== prevProps.errorMessage) {
      window.location.href = `/status/error?reason=${errorMessage}`;
      return;
    }
    if (paymentMethodsRes && config && (paymentMethodsRes !== prevProps.paymentMethodsRes || config !== prevProps.config)) {
      this.checkout = new AdyenCheckout({
        ...config,
        paymentMethodsResponse: this.removeNilFields(paymentMethodsRes),
        onAdditionalDetails: this.onAdditionalDetails,
        onSubmit: this.onSubmit
      });
    }
    if (paymentRes && paymentRes !== prevProps.paymentRes) {
      this.processPaymentResponse(paymentRes);
    }
    if (paymentRes && paymentDetailsRes !== prevProps.paymentDetailsRes) {
      this.processPaymentResponse(paymentDetailsRes);
    }
  }

  removeNilFields = obj => {
    //...
  };

  processPaymentResponse = paymentRes => {
    if (paymentRes.action) {
      this.paymentComponent.handleAction(paymentRes.action);
    } else {
      //...
      window.location.href = `/checkout/status/${urlPart}?reason=${paymentRes.resultCode}&paymentType=unknown`;
    }
  };

  onSubmit = (state, component) => {
    if (state.isValid) {
      this.props.initiatePayment({
        ...state.data,
        origin: window.location.origin
      });
      this.paymentComponent = component;
    }
  };

  onAdditionalDetails = (state, component) => {
    this.props.submitAdditionalDetails(state.data);
    this.paymentComponent = component;
  };

  handlePaymentSelect = (type: string) => () => {
    this.checkout.create(type).mount(this.paymentContainer?.current);
  };

  render() {
    const { cart } = this.props;

    return (
      <Row className="d-flex justify-content-center" style={{ minHeight: '80vh' }}>
        <Col lg="9" md="12">
          <h2>Make payment</h2>
          <p className="lead">You are paying total of € {cart.totalPrice}</p>
          <Row className="pt-4">
            <Col md="4" className="d-flex flex-column">
              <label>
                <strong>Choose a payment type</strong>
              </label>
              <ButtonGroup vertical>
                <Button onClick={this.handlePaymentSelect('card')}>Credit Card</Button>
                <Button onClick={this.handlePaymentSelect('ideal')}>iDEAL</Button>
              </ButtonGroup>
            </Col>
            <Col md="8">
              <div ref={this.paymentContainer} className="payment"></div>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = ({ checkout, shoppingCart }: IRootState) => ({
  //...
});

const mapDispatchToProps = {
  //...
};
type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);
