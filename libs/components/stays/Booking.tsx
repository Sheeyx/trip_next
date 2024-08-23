import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { REACT_APP_API_URL } from '../../config';
import { CREATE_ORDER } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';

const BookingComponent = ({ property }: any) => {
  const [isBooking, setIsBooking] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestPickerVisible, setGuestPickerVisible] = useState(false);
  const user = useReactiveVar(userVar);

  console.log(property, "property");
  console.log(user, "user");

  const [createOrder, { loading }] = useMutation(CREATE_ORDER);

  const handleBookingClick = () => setIsBooking(true);
  const handleInquiryClick = () => setIsBooking(false);

  const increment = (setter: any, value: any) => setter(value + 1);
  const decrement = (setter: any, value: any) => setter(Math.max(0, value - 1));

  const toggleGuestPicker = () => setGuestPickerVisible(!guestPickerVisible);

  const calculateDays = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    return timeDifference / (1000 * 60 * 60 * 24);
  };

  const handleCheckAvailability = async () => {
    if (!property._id) return;
    if (!user._id) {
      await sweetMixinErrorAlert('User not authenticated');
      return;
    }

    const orderInput = {
      memberId: property.memberData._id,
      propertyId: property._id,  // Ensure propertyId is included
      price: property.propertyPrice,
      days: calculateDays(checkInDate, checkOutDate),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: {
        adults,
        children,
        rooms,
      },
    };

    try {
      await createOrder({ variables: { input: orderInput } });
      await sweetTopSmallSuccessAlert('Booking successful', 800);
      // Optionally refetch properties or perform other actions
    } catch (err: any) {
      console.error('Error creating order:', err.message);
      await sweetMixinErrorAlert(err.message);
    }
  };

  return (
    <div className="booking-component">
      <div className="tab-buttons">
        <button className={isBooking ? 'active' : ''} onClick={handleBookingClick}>Book</button>
        <button className={!isBooking ? 'active' : ''} onClick={handleInquiryClick}>Inquiry</button>
      </div>
      {isBooking ? (
        <div className="booking-form">
          <div className="price-info">From <span>${property?.propertyPrice}</span>/ night</div>
          <div className="date-picker">
            <label>Check In</label>
            <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
          </div>
          <div className="date-picker">
            <label>Check Out</label>
            <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
          </div>
          <div className="guest-picker">
            <label>Guests</label>
            <div onClick={toggleGuestPicker} className="guest-input">
              {`${adults} Adults, ${children} Children, ${rooms} Room(s)`}
            </div>
            {guestPickerVisible && (
              <div className="guest-details">
                <div className="guest-item">
                  <span>Rooms</span>
                  <button onClick={() => decrement(setRooms, rooms)}>-</button>
                  <p>{rooms}</p>
                  <button onClick={() => increment(setRooms, rooms)}>+</button>
                </div>
                <div className="guest-item">
                  <span>Adults</span>
                  <button onClick={() => decrement(setAdults, adults)}>-</button>
                  <p>{adults}</p>
                  <button onClick={() => increment(setAdults, adults)}>+</button>
                </div>
                <div className="guest-item">
                  <span>Children</span>
                  <button onClick={() => decrement(setChildren, children)}>-</button>
                  <p>{children}</p>
                  <button onClick={() => increment(setChildren, children)}>+</button>
                </div>
              </div>
            )}
          </div>
          <button className="check-availability" onClick={handleCheckAvailability} disabled={loading}>
            {loading ? 'Checking...' : 'Check availability'}
          </button>
        </div>
      ) : (
        <div className="inquiry-form">
          <div className="member">
            <img src={`${REACT_APP_API_URL}/${property.memberData.memberImage}`} alt="" />
            <div className="info">
              <p>{property?.memberData.memberNick}</p>
              <p className="member-phone">{property?.memberData.memberPhone}</p>
            </div>
          </div>
          <input type="text" placeholder="Name (*)" required />
          <input type="email" placeholder="E-mail (*)" required />
          <input type="tel" placeholder="Phone" />
          <textarea placeholder="Note"></textarea>
          <button>Send Message</button>
        </div>
      )}
    </div>
  );
};

export default BookingComponent;
