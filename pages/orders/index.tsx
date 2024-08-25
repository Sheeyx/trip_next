import React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_ORDER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../../libs/config';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import { T } from '../../libs/types/common';

const Orders: NextPage = ({ initialInput, ...props }: T) => {
  const user = useReactiveVar(userVar);

  const { loading, error, data } = useQuery(GET_ORDER, {
    variables: { input: user?._id },
    skip: !user._id,
  });

  if (!user._id) {
    return <p>User is not authenticated</p>;
  }

  if (loading) return <p>Loading...</p>;


  const order = data?.order || [];

  return (
    <div className="orders-page container">
      <div className='orders-layout'>
        <div className='orders-title'>
          <h1>Your Travel Orders</h1>
          <p>Keep track of all your upcoming trips and past adventures.</p>
        </div>
        <div className='orders-photo'>
          <img className='image-left' src='https://static.india.com/wp-content/uploads/2023/10/Top-9-Largest-Hotels-In-The-World-2023.png' alt='Description' />
          <img className='image-right' src='https://www.luxuryabode.com/mona/img/hotels.jpg' alt='Description' />
          <img className='image-bottom' src='https://www.luxuryabode.com/mona/img/hotels.jpg' alt='Description' />
        </div>
      </div>
      <div className='container'>
        <div className="cart-details">
          {order.length === 0 ? (
            <div className="no-orders-message">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <p className='no-orders-text'>No Orders Yet</p>
                </tbody>
              </table>
            </div>
          ) : (
            <div className='orders-container'>
            <div>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((item: any) => (
                    <tr key={item?._id}>
                      <td>
                        <div className="product">
                          <img src={`${REACT_APP_API_URL}/${item?.propertyDetails?.propertyImages[0]}`} alt="Property Image" />
                          <div>
                            <h3>{item?.propertyDetails?.propertyTitle}</h3>
                            <p>Date: {new Date(item?.checkIn).toLocaleDateString()} - {new Date(item?.checkOut).toLocaleDateString()}</p>
                            <p>Details: Rooms: {item?.guests?.rooms}, Adults: {item?.guests?.adults}, Children: {item?.guests?.children}</p>
                          </div>
                        </div>
                      </td>
                      <td>${item?.price?.toFixed(2)}</td>
                      <td>{item?.guests?.rooms}</td>
                      <td>${(item?.price * item?.guests?.rooms)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cart-actions">
                <input type="text" placeholder="Coupon code" />
                <button>Apply coupon</button>
                <button>Update cart</button>
              </div>
            </div>

              <div className="cart-totals">
                <h2>Cart totals</h2>
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>${order.reduce((acc: any, item: any) => acc + item?.price * item?.guests?.rooms, 0)?.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Total</span>
                  <span>${order.reduce((acc: any, item: any) => acc + item?.price * item?.guests?.rooms, 0)?.toFixed(2)}</span>
                </div>
                <button className="checkout-button">Proceed to checkout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withLayoutFull(Orders);
