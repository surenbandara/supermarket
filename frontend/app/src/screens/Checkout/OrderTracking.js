import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { scale } from '../../utils/scaling'

const OrderTracking = ({ currentStage }) => {
    const stages = [
      { label: 'Order Placed', icon: 'check-circle' },
      { label: 'Payment', icon: 'payment' }
    ]
  
    return (
      <View style={styles.container}>
        {stages.map((stage, index) => {
          const isActive = index <= currentStage
          const isLast = index === stages.length - 1
  
          return (
            <React.Fragment key={index}>
              <View style={styles.stage}>
                <MaterialIcons
                  name={stage.icon}
                  size={scale(28)}
                  color={isActive ? '#4CAF50' : '#BDBDBD'}
                />
                <Text
                  style={{
                    fontSize: scale(12),
                    color: isActive ? '#4CAF50' : '#BDBDBD',
                    marginTop: scale(4),
                    textAlign: 'center'
                  }}
                >
                  {stage.label}
                </Text>
              </View>
  
              {/* Line between stages */}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < currentStage ? '#4CAF50' : '#BDBDBD' }
                  ]}
                />
              )}
            </React.Fragment>
          )
        })}
      </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(10)
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  line: {
    height: scale(2),
    flex: 1,
    marginHorizontal: scale(5)
  }
})

export default OrderTracking
