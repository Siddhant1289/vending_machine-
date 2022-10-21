/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from "react";
import Payment from "./components/Payment";
import { detailProduct } from "./data";
const ProductContext = React.createContext();

class ProductProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      detailProduct: detailProduct,
      cart: [],
      modalOpen: false,
      modalProduct: detailProduct,
      cartSubTotal: 0,
      cartTax: 0,
      cartTotal: 0,
      p: 0,
      cartItems: "",
    };
  }
  // state = {
  //   products: [],
  //   detailProduct: detailProduct,
  //   cart: [],
  //   modalOpen: false,
  //   modalProduct: detailProduct,
  //   cartSubTotal: 0,
  //   cartTax: 0,
  //   cartTotal: 0,
  //   p: 0,
  // };
  componentDidMount() {
    this.kalu();
  }

  kalu = () => {
    fetch("http://localhost/vending_machine/display.php")
      .then((result) => result.json())
      .then((result) => {
        // setItem(result);
        // eslint-disable-next-line no-undef

        console.log(result);

        this.setState({ products: result });
        for (let i = 0; i < result.length; i++) {
          this.state.products[i].id = parseInt(this.state.products[i].id);
          this.state.products[i].price = parseInt(this.state.products[i].price);
          if (this.state.products[i].inCart === "0") {
            this.state.products[i].inCart = false;
          }
        }
        console.log(this.state.products);
      });
  };

  //   setProducts = () => {
  //     let products = [];
  //     storeProducts.forEach((item) => {
  //       const singleItem = { ...item };
  //       products = [...products, singleItem];
  //     });
  //     this.setState(() => {
  //       return { products };
  //     }, this.checkCartItems);
  //   };

  getItem = (id) => {
    const product = this.state.products.find((item) => item.id === id);
    return product;
  };
  handleDetail = (id) => {
    const product = this.getItem(id);
    this.setState(() => {
      return { detailProduct: product };
    });
  };
  addToCart = (id) => {
    let tempProducts = [...this.state.products];
    const index = tempProducts.indexOf(this.getItem(id));
    const product = tempProducts[index];
    product.inCart = true;
    product.count = 1;
    const price = product.price;
    product.total = price;

    this.setState(() => {
      return {
        products: [...tempProducts],
        cart: [...this.state.cart, product],
        detailProduct: { ...product },
      };
    }, this.addTotals);
  };
  openModal = (id) => {
    const product = this.getItem(id);
    this.setState(() => {
      return { modalProduct: product, modalOpen: true };
    });
  };
  closeModal = () => {
    this.setState(() => {
      return { modalOpen: false };
    });
  };
  increment = (id) => {
    let tempCart = [...this.state.cart];
    const selectedProduct = tempCart.find((item) => {
      return item.id === id;
    });
    const index = tempCart.indexOf(selectedProduct);
    const product = tempCart[index];
    product.count = product.count + 1;
    product.total = product.count * product.price;
    this.setState(() => {
      return {
        cart: [...tempCart],
      };
    }, this.addTotals);
  };
  decrement = (id) => {
    let tempCart = [...this.state.cart];
    const selectedProduct = tempCart.find((item) => {
      return item.id === id;
    });
    const index = tempCart.indexOf(selectedProduct);
    const product = tempCart[index];
    product.count = product.count - 1;
    if (product.count === 0) {
      this.removeItem(id);
    } else {
      product.total = product.count * product.price;
      this.setState(() => {
        return { cart: [...tempCart] };
      }, this.addTotals);
    }
  };
  getTotals = () => {
    let subTotal = 0;
    this.state.cart.map((item) => (subTotal += item.total));
    const tempTax = subTotal * 0.1;
    const tax = parseFloat(tempTax.toFixed(2));
    const total = subTotal + tax;
    return {
      subTotal,
      tax,
      total,
    };
  };
  addTotals = () => {
    const totals = this.getTotals();
    this.setState(
      () => {
        return {
          cartSubTotal: totals.subTotal,
          cartTax: totals.tax,
          cartTotal: totals.total,
        };
      },
      () => {
        // console.log(this.state);
      }
    );
  };
  removeItem = (id) => {
    let tempProducts = [...this.state.products];
    let tempCart = [...this.state.cart];

    const index = tempProducts.indexOf(this.getItem(id));
    let removedProduct = tempProducts[index];
    removedProduct.inCart = false;
    removedProduct.count = 0;
    removedProduct.total = 0;

    tempCart = tempCart.filter((item) => {
      return item.id !== id;
    });

    this.setState(() => {
      return {
        cart: [...tempCart],
        products: [...tempProducts],
      };
    }, this.addTotals);
  };

  pay = () => {
    this.setState({ p: 1 });
    let susu = "";
    console.log(this.state.cart);
    for (let i = 0; i < this.state.cart.length; i++) {
      susu =
        susu + this.state.cart[i].id + ":" + this.state.cart[i].count + "/";
      this.setState({ cartItems: susu });
    }
    susu = susu.substring(0, susu.length - 1);
    console.log(susu);

    this.setState({ cartItems: susu });

    console.log(this.state.cartItems);
  };
  clearCart = () => {
    this.setState(
      () => {
        return { cart: [] };
      },
      () => {
        this.kalu();
        this.addTotals();
      }
    );
  };
  render() {
    return this.state.p === 0 ? (
      <ProductContext.Provider
        value={{
          ...this.state,
          handleDetail: this.handleDetail,
          addToCart: this.addToCart,
          openModal: this.openModal,
          closeModal: this.closeModal,
          increment: this.increment,
          decrement: this.decrement,
          removeItem: this.removeItem,
          clearCart: this.clearCart,
          pay: this.pay,
        }}
      >
        {this.props.children}
      </ProductContext.Provider>
    ) : (
      <Payment cart1={this.state.cartTotal} items={this.state.cartItems} />
    );
  }
}

const ProductConsumer = ProductContext.Consumer;

export { ProductProvider, ProductConsumer };
