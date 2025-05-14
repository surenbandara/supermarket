import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { IExtendedOrder } from '@/lib/utils/interfaces';
import './order-detail-modal.css';
import TextIconClickable from '../text-icon-clickable';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
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

  if (!restaurantData) return null;

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
            <p>{restaurantData.bill[0].product.shop}</p>
          </div>
        {/* Items Section */}
        <div className="order-section">
          <h3 className="section-header">Items</h3>
          {restaurantData.bill && restaurantData.bill.length > 0 ? (
            <div className="item-list">
              {restaurantData.bill.map((item: any, index: any) => (
                <div key={index} className="item-row">
                  <span>
                    {item.product.name}  x  {item.quantity}
                  </span>
                  <span className="item-price">
                    ${(item.truePrice ?? 0).toFixed(2)}
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
              <span>+ ${restaurantData?.totalPrice?.totalCost?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Delivery Fee</span>
              <span>+ ${(restaurantData?.totalPrice?.deliveryCost ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Discount</span>
              <span> - ${(restaurantData?.totalPrice?.discount ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row">
              <span>Loyality </span>
              <span> - ${(restaurantData?.totalPrice?.loyaltyPoints ?? 0)?.toFixed(2)}</span>
            </div>
            <div className="charges-row total-row">
              <strong>Total</strong>
              <strong>
                $
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
              ${(restaurantData.paidAmount ?? 0)?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="order-section">
            <h3 className="section-header">Delivery Address</h3>
            <p>{restaurantData.userLocation}</p>
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: 0, lng: 0 }}
                    zoom={10}
                  >
                    <Marker position={{ lat: 0, lng: 0 }} />
                  </GoogleMap>
              </LoadScript>
        </div>

        <div className="order-section">
          <h3 className="section-header">Order Status</h3>

        
          <div className="payment-section">
            <select
              className="payment-type"
              value={selectedStatus ?? restaurantData.status}
              onChange={(e) => {
                setSelectedStatus(e.target.value); 
                if (restaurantData.status != e.target.value) {
                  setShowUpdate(true);
                }
              }}
            >
               <option value="NEW">NEW</option>
              <option value="INITIATED">INITIATED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURNED">RETURNED</option>
            </select>
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
