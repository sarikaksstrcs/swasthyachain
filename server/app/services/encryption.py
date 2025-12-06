# app/services/encryption.py
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import os
import base64

class EncryptionService:
    def __init__(self, key: str = None):
        if key:
            self.key = base64.b64decode(key)
        else:
            # Generate a random 256-bit key
            self.key = os.urandom(32)
    
    def encrypt(self, data: bytes) -> dict:
        """Encrypt data using AES-256-CBC"""
        # Generate random IV
        iv = os.urandom(16)
        
        # Pad data
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(data) + padder.finalize()
        
        # Encrypt
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        
        return {
            "encrypted_data": base64.b64encode(encrypted_data).decode('utf-8'),
            "iv": base64.b64encode(iv).decode('utf-8')
        }
    
    def decrypt(self, encrypted_data: str, iv: str) -> bytes:
        """Decrypt data using AES-256-CBC"""
        encrypted_bytes = base64.b64decode(encrypted_data)
        iv_bytes = base64.b64decode(iv)
        
        # Decrypt
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CBC(iv_bytes),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_bytes) + decryptor.finalize()
        
        # Unpad
        unpadder = padding.PKCS7(128).unpadder()
        data = unpadder.update(padded_data) + unpadder.finalize()
        
        return data
    
    def encrypt_file(self, file_content: bytes) -> dict:
        """Encrypt file content"""
        return self.encrypt(file_content)
    
    def decrypt_file(self, encrypted_data: str, iv: str) -> bytes:
        """Decrypt file content"""
        return self.decrypt(encrypted_data, iv)
    
    @staticmethod
    def generate_key() -> str:
        """Generate a new encryption key"""
        key = os.urandom(32)
        return base64.b64encode(key).decode('utf-8')

encryption_service = EncryptionService()