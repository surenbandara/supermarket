import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { IExtendedOrder } from '@/lib/utils/interfaces';
import './order-detail-modal.css';
import TextIconClickable from '../text-icon-clickable';
import { faAdd, faMapLocation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';



const OrderDetailModal: React.FC<any> = ({
  visible,
  onHide,
  restaurantData,
  onUpdate
}) => {

  const [selectedStatus, setSelectedStatus] = useState<string|undefined>(undefined);
  const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const statusSteps = [
    'NEW',
    'INITIATED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED',
  ];

  const onHideInModal = () => {
    setShowUpdate(false);
    setShowLoading(false);
    setSelectedStatus(undefined);
    onHide();
  }

  const onUpdateModal = (restuarent: string) => {
    setShowLoading(true);
    setShowUpdate(false);
    setSelectedStatus(undefined);
    onUpdate(restuarent, () => setShowLoading(false));
  }

  if (restaurantData == null) return null;

  const currentStatus = restaurantData.status;
  const currentIndex = statusSteps.indexOf(currentStatus);

  return (
    <Dialog
      visible={visible}
      onHide={onHideInModal}
      header={`Order # ${restaurantData.id}`}
      className="custom-modal" // Added custom class for CSS override
    >
  
      <div className="order-details-container">
        <div className="order-section">
            <h3 className="section-header">Shop</h3>
            <p>{restaurantData.bill[0].product?.shop}</p>
          </div>
        {/* Items Section */}
        <div className="order-section">
          <h3 className="section-header">Items</h3>
          {restaurantData.bill && restaurantData.bill.length > 0 ? (
            <div className="item-list">
              {restaurantData.bill.map((item: any, index: any) => (
                <div key={index} className="item-row">
                  <span>
                    {item.product?.name ?? "Undeffined"}  x  {item.quantity}
                  </span>
                  <span className="item-price">
                    {(item.disctipion ?? "-")}
                  </span>
                  <span className="item-price">
                    Rs. {(item.truePrice ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No items available</p>
          )}
        </div>

        {/* Charges Section */}
        <div className="order-section">
          <h3 className="section-header">Charges</h3>
          <div className="charges-table">
            <div className="charges-row">
              <span>Subtotal</span>
              <span>+ Rs. {restaurantData?.totalPrice?.totalCost?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Delivery Fee</span>
              <span>+ Rs. {(restaurantData?.totalPrice?.deliveryCost ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Discount</span>
              <span> - Rs. {(restaurantData?.totalPrice?.discount ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Loyality </span>
              <span> - Rs. {(restaurantData?.totalPrice?.loyaltyPoints ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row total-row">
              <strong>Total</strong>
              <strong>
                Rs. 
                {restaurantData?.totalPrice?.payableAmount?.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="order-section">
          <h3 className="section-header">Payment Method</h3>
          <div className="payment-section">
            <span className="payment-type">{restaurantData.paymentMethod}</span>
          </div>
          <div className="paid-amount">
            <span className="paid-label">Paid Amount</span>
            <span className="paid-value">
            Rs. {(restaurantData.paidAmount ?? 0)?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="order-section">
            <h3 className="section-header">Delivery Address</h3>
              <p style={{ textAlign: 'center' }}>
                <a
                  href={`https://www.google.com/maps?q=${restaurantData.userLocation.split(",")[0]},${restaurantData.userLocation.split(",")[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1a73e8', fontSize: '20px', display: 'inline-block' }}
                >
                  <FontAwesomeIcon icon={faMapLocation} />
                </a>
              </p>

            {/* <p>{restaurantData.userLocation}</p>
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: 0, lng: 0 }}
                    zoom={10}
                  >
                    <Marker position={{ lat: 0, lng: 0 }} />
                  </GoogleMap>
              </LoadScript> */}
        </div>

        <div className="order-section">
          <h3 className="section-header">Order Status</h3>

        
       <div
            className="status-progress"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1px',
              flexWrap: 'wrap', // allow wrapping
              padding: '8px 12px',
              userSelect: 'none',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {statusSteps.map((status, index) => {
                const isDone = index <= currentIndex;
                const isSelected = selectedStatus === status;
                const isPending = index > currentIndex || index === currentIndex;

                let circleColor = '#ccc'; // pending gray
                if (isSelected) circleColor = '#ff9800'; // orange selected
                else if (isDone) circleColor = '#4caf50'; // green done

                return (
                  <React.Fragment key={status}>
                    {/* Wrap circle + button */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        whiteSpace: 'nowrap',  // keep circle+button on same line
                        marginBottom: 4,
                        marginRight: 12
                      }}
                    >
                      {/* Circle indicator */}
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: circleColor,
                          flexShrink: 0,
                          border: isSelected ? '3px solid #ff9800' : 'none',
                          transition: 'background-color 0.3s, border 0.3s',
                        }}
                        title={status}
                      />

                      {/* Status button */}
                      <button
                        disabled={index <= currentIndex}
                        style={{
                          backgroundColor: isSelected
                            ? '#ff9800'
                            : isDone
                            ? '#e0f2f1'
                            : '#f0f0f0',
                          color: isSelected || isDone ? '#000' : '#666',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '6px 12px',
                          cursor: isPending ? 'pointer' : 'default',
                          fontWeight: isPending ? 'bold' : 'normal',
                          fontSize: '10px',
                          userSelect: 'none',
                          transition: 'background-color 0.3s',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                          if (isPending) {
                            setSelectedStatus(status);
                            setShowUpdate(true);
                          }
                        }}
                      >
                        {status}
                      </button>
                    </div>

                    
                  </React.Fragment>
                );
              })}

          </div>


          { showUpdate &&
          <TextIconClickable
                    className="rounded border-gray-300 bg-green-500 text-white sm:w-auto text-lg font-bold"
                    title={'Update Status'}
                    onClick={() => {
                      restaurantData.status = selectedStatus;
                      onUpdateModal(restaurantData);}}
                  /> 
         }

        {showLoading && (
         <div className="payment-section">
          <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <div className="loader" />
          <style jsx>{`
            .loader {
              border: 8px solid #f3f3f3;
              border-top: 8px solid #3498db;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        </div>


        )}
       </div>

      </div>
    
    </Dialog>
  );
};

const containerStyle = {
  width: '100%',
  height: '400px',
};

export default OrderDetailModal;
