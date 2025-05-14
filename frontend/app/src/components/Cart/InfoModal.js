import React, { useState, useEffect } from 'react'
import { View, Modal, Pressable } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import Button from '../Button/Button'
import styles from './containerStyles'
import { alignment } from '../../utils/alignment'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { useTranslation } from 'react-i18next'
import Spinner from '../Spinner/Spinner'
import { scale } from '../../utils/scaling'

export const InfoModal = ({
  theme,
  modalVisible,
  setModalVisible
}) => {
  const { t } = useTranslation()


  return (
    <Modal animationType="slide" visible={modalVisible} transparent={true}>
  <Pressable style={styles.container(theme)} onPress={() => setModalVisible(false)}>
    <View style={styles.modalContainer(theme)}>
      <View style={{ ...alignment.MBsmall }}>
        <TextDefault H4 bolder textColor={theme.gray900}>
          Items Unavailable
        </TextDefault>
      </View>

      <View>
        <TextDefault H5 textColor={theme.gray500} style={{ textAlign: 'center', marginTop: 10 }}>
          Some of the items in your cart are not available at the moment.
        </TextDefault>
      </View>

      <View style={{ alignItems: 'center', marginTop: scale(20) }}>
        <Button
          text="I understood!"
          buttonProps={{ onPress: () => setModalVisible(false) }}
          buttonStyles={[
            styles.dismissButtonContainer(theme),
            { backgroundColor: theme.main }
          ]}
          textStyles={{ ...alignment.Pmedium, color: theme.white }}
        />
      </View>
    </View>
  </Pressable>
</Modal>

  )
}
