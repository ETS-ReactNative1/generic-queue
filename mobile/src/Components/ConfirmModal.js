import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';

const ConfirmModal = ({ message, onClose, onConfirm, errorMessage }) => {

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <Text style={styles.textModal}>
            {message}
          </Text>
          <Text style={[styles.textModal, { color: 'red' }]}>
            {errorMessage}
          </Text>
          <View style={styles.footerBtns}>
            {onClose && <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelBtn}>Cancelar</Text>
            </TouchableOpacity>}
            {onConfirm && <TouchableOpacity onPress={onConfirm}>
              <Text style={styles.confirmBtn}>Confirmar</Text>
            </TouchableOpacity>}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  modalBackground: {
    zIndex: 99,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 300,
    width: 300,
    borderRadius: 10,
    paddingHorizontal: 30,
    display: 'flex',
    justifyContent: 'space-around',
  },
  textModal: {
    textAlign: 'center',
    marginTop: 30
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    textDecorationLine: 'underline',
    color: 'red'
  },
  confirmBtn: {
    textDecorationLine: 'underline',
    color: 'green'
  },
});
