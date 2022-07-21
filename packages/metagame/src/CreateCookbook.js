import React from 'react';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';

const CreateCookbook = ({ isOpen, onClose }) => {
  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Create Cookbook</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>Create a cookbook</Text>
      </ModalBody>
    </ModalContent>
    </Modal>
  );
}

export default CreateCookbook;