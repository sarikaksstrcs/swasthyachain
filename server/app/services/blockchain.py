# app/services/blockchain.py
import hashlib
import json
from datetime import datetime
from typing import Dict, Optional
import uuid

class BlockchainService:
    """
    Simplified Blockchain Service for SwasthyaChain
    In production, this would integrate with Hyperledger Fabric
    """
    
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        # Create genesis block
        self.create_block(previous_hash="0", proof=1)
    
    def create_block(self, proof: int, previous_hash: str) -> Dict:
        """Create a new block in the blockchain"""
        block = {
            'index': len(self.chain) + 1,
            'timestamp': datetime.utcnow().isoformat(),
            'transactions': self.pending_transactions,
            'proof': proof,
            'previous_hash': previous_hash
        }
        self.pending_transactions = []
        self.chain.append(block)
        return block
    
    def add_transaction(self, transaction_data: Dict) -> str:
        """Add a transaction to pending transactions"""
        transaction = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'data': transaction_data
        }
        self.pending_transactions.append(transaction)
        return transaction['id']
    
    def hash_block(self, block: Dict) -> str:
        """Create a SHA-256 hash of a block"""
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()
    
    def get_last_block(self) -> Dict:
        """Get the last block in the chain"""
        return self.chain[-1] if self.chain else None
    
    async def record_medical_data(self, patient_id: str, record_hash: str, 
                                   ipfs_hash: str, metadata: Dict) -> str:
        """Record medical data transaction on blockchain"""
        transaction_data = {
            'type': 'medical_record',
            'patient_id': patient_id,
            'record_hash': record_hash,
            'ipfs_hash': ipfs_hash,
            'metadata': metadata
        }
        tx_id = self.add_transaction(transaction_data)
        
        # In production: Submit to Hyperledger Fabric
        # fabric_gateway.submit_transaction('RecordMedicalData', ...)
        
        return tx_id
    
    async def record_consent(self, patient_id: str, doctor_id: str, 
                            consent_data: Dict) -> str:
        """Record consent transaction on blockchain"""
        transaction_data = {
            'type': 'consent',
            'patient_id': patient_id,
            'doctor_id': doctor_id,
            'consent_data': consent_data
        }
        tx_id = self.add_transaction(transaction_data)
        
        # In production: Submit to Hyperledger Fabric smart contract
        # fabric_gateway.submit_transaction('GrantConsent', ...)
        
        return tx_id
    
    async def record_access(self, patient_id: str, accessor_id: str, 
                           record_id: str, action: str, is_emergency: bool = False) -> str:
        """Record access log on blockchain"""
        transaction_data = {
            'type': 'access_log',
            'patient_id': patient_id,
            'accessor_id': accessor_id,
            'record_id': record_id,
            'action': action,
            'is_emergency': is_emergency,
            'timestamp': datetime.utcnow().isoformat()
        }
        tx_id = self.add_transaction(transaction_data)
        
        # In production: Submit to Hyperledger Fabric
        # fabric_gateway.submit_transaction('RecordAccess', ...)
        
        return tx_id
    
    async def verify_consent(self, patient_id: str, doctor_id: str) -> bool:
        """Verify if consent exists and is valid"""
        # In production: Query Hyperledger Fabric smart contract
        # result = fabric_gateway.evaluate_transaction('VerifyConsent', patient_id, doctor_id)
        
        # Simplified verification
        for block in reversed(self.chain):
            for tx in block.get('transactions', []):
                data = tx.get('data', {})
                if (data.get('type') == 'consent' and 
                    data.get('patient_id') == patient_id and
                    data.get('doctor_id') == doctor_id):
                    return True
        return False
    
    async def revoke_consent(self, patient_id: str, doctor_id: str) -> str:
        """Revoke consent on blockchain"""
        transaction_data = {
            'type': 'consent_revocation',
            'patient_id': patient_id,
            'doctor_id': doctor_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        tx_id = self.add_transaction(transaction_data)
        
        # In production: Submit to Hyperledger Fabric
        # fabric_gateway.submit_transaction('RevokeConsent', ...)
        
        return tx_id
    
    def get_transaction_history(self, patient_id: str) -> list:
        """Get all transactions for a patient"""
        history = []
        for block in self.chain:
            for tx in block.get('transactions', []):
                data = tx.get('data', {})
                if data.get('patient_id') == patient_id:
                    history.append({
                        'block_index': block['index'],
                        'transaction_id': tx['id'],
                        'timestamp': tx['timestamp'],
                        'type': data.get('type'),
                        'data': data
                    })
        return history

# Global blockchain instance
blockchain_service = BlockchainService()