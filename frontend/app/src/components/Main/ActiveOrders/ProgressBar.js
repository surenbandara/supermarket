import React from 'react'
import { View } from 'react-native'
import { scale } from '../../../utils/scaling'
import { useSubscription } from '@apollo/client'
import { subscriptionOrder } from '../../../apollo/subscriptions'
import gql from 'graphql-tag'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'

export const orderStatuses = [
  {
    key: 'INITIATED',
    status: 1,
    statusText: 'Your order has been initiated.'
  },
  {
    key: 'CONFIRMED',
    status: 2,
    statusText: 'Your order is confirmed.'
  },
  {
    key: 'PROCESSING',
    status: 3,
    statusText: 'Your order is being processed.'
  },
  {
    key: 'SHIPPED',
    status: 4,
    statusText: 'Your order has been shipped.'
  },
  {
    key: 'DELIVERED',
    status: 5,
    statusText: 'Your order has been delivered.'
  },
  {
    key: 'COMPLETED',
    status: 6,
    statusText: 'Your order is completed.'
  },
  {
    key: 'CANCELLED',
    status: 7,
    statusText: 'Your order has been cancelled.'
  },
  {
    key: 'RETURNED',
    status: 8,
    statusText: 'Your order has been returned.'
  }
];

export const getOrderStatusMessage = (statusKey) => {
  const status = orderStatuses.find(s => s.key === statusKey);
  return status ? status.statusText : 'Unknown order status.';
};


export const checkStatus = status => {
  const obj = orderStatuses.filter(x => {
    return x.key === status
  })
  return obj[0]
}

export const ProgressBar = ({ currentTheme, item, customWidth, isPicked }) => {
  if (item.status === ORDER_STATUS_ENUM.CANCELLED || item.status === ORDER_STATUS_ENUM.RE) return null

  const defaultWidth = scale(50)
  const width = customWidth !== undefined ? customWidth : defaultWidth

  
  const currentStatus = orderStatuses.find((x) => x.key === item.status) || { status: 0 };

  // Set the total number of filled bars based on the isPicked prop
  const totalBars = 6;

  return (
    <View style={{ marginTop: scale(10) }}>
      <View style={{ flexDirection: currentTheme?.isRTL ? 'row-reverse' : 'row' }}>
        {Array(Math.min(currentStatus.status, totalBars)) // Active bars
          .fill(0)
          .map((_, index) => (
            <View
              key={index}
              style={{
                height: scale(4),
                backgroundColor: currentTheme.primary,
                width: width,
                marginRight: scale(10)
              }}
            />
          ))}
        {Array(totalBars - Math.min(currentStatus.status, totalBars)) // Inactive bars
          .fill(0)
          .map((_, index) => (
            <View
              key={index}
              style={{
                height: scale(4),
                backgroundColor: currentTheme.gray200,
                width: width,
                marginRight: scale(10)
              }}
            />
          ))}
      </View>
    </View>
  )
}
