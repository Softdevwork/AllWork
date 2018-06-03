import React from "react";
// import style from "./style.scss";
// import classnames from "classnames/bind";
import LoadingSpinner from "components/LoadingSpinner";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import ProductDetail from "components/ProductDetail";
import CartItem from "components/CartItem";
import { toast } from "react-toastify";

@withRouter
@inject("shopItemStore")
@inject("cartItemStore")
@inject("commonStore")
@observer
class Shop extends React.Component {
  componentWillMount() {
    this.props.shopItemStore.loadAll();
    this.props.cartItemStore.loadAll();
    this.props.setParentTitle("Shop");
  }

  addtoCart = product => {
    this.props.cartItemStore
      .create(product)
      .then(() => {
        toast.success("Added to Cart", {
          autoClose: 3000
        });
      })
      .catch(() => {});
    
  };

  removeFromCart = product => {
    this.props.cartItemStore.delete(product.id);
    toast.error("Removed from Cart", {
      autoClose: 3000
    });
  };

  updateItemQuantity = (item, event) => {
    this.props.cartItemStore.updateQuantity(item, Number(event.target.value));
    this.props.cartItemStore.loadAll();
  };

  checkout = () => {
    this.props.cartItemStore
      .checkout()
      .then(() => {
        this.props.cartItemStore.clear();
        toast.success("Successfully Ordered", {
          autoClose: 3000
        });
      })
      .catch(() => {});
  };

  render() {
    if (this.props.shopItemStore.isLoading)
      return (
        <div>
          <LoadingSpinner />
        </div>
      );
    return (
      <Row>
        <Col md={12}>
          <CartItem
            items={this.props.cartItemStore.cartItemsRegistry.values()}
            removeItem={this.removeFromCart.bind(this)}
            totalPrice={this.props.cartItemStore.total}
            updateQuantity={this.updateItemQuantity.bind(this)}
            checkout={this.checkout.bind(this)}
            currency={this.props.commonStore.currency}
          />
        </Col>

        <Col lg={12} className="shop-item-regi">
          {this.props.shopItemStore.shopItemsRegistry
            .values()
            .map(
              (product, key) =>
                this.props.cartItemStore.get(product.id) === undefined ? (
                  <ProductDetail
                    key={key}
                    product={product}
                    addItem={this.addtoCart.bind(this)}
                    currency={this.props.commonStore.currency}
                  />
                ) : null
            )}
        </Col>
      </Row>
    );
  }
}

export default Shop;
