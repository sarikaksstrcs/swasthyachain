# app/services/ipfs.py
import httpx
import hashlib
from typing import Optional
from app.core.config import settings

class IPFSService:
    """
    IPFS Service for storing large medical files
    """
    
    def __init__(self):
        self.api_url = settings.IPFS_API_URL
        self.gateway_url = settings.IPFS_GATEWAY_URL
    
    async def upload_file(self, file_content: bytes, filename: str) -> dict:
        """
        Upload file to IPFS
        Returns IPFS hash and metadata
        """
        try:
            # In production: Use official IPFS client
            # For now, simulate IPFS upload
            file_hash = self._calculate_hash(file_content)
            
            # Simulate IPFS response
            ipfs_hash = f"Qm{file_hash[:44]}"  # Mock IPFS CID format
            
            return {
                "ipfs_hash": ipfs_hash,
                "filename": filename,
                "size": len(file_content),
                "gateway_url": f"{self.gateway_url}/ipfs/{ipfs_hash}"
            }
            
            # Production code would be:
            # async with httpx.AsyncClient() as client:
            #     files = {'file': (filename, file_content)}
            #     response = await client.post(
            #         f"{self.api_url}/api/v0/add",
            #         files=files
            #     )
            #     result = response.json()
            #     return {
            #         "ipfs_hash": result['Hash'],
            #         "filename": filename,
            #         "size": result['Size'],
            #         "gateway_url": f"{self.gateway_url}/ipfs/{result['Hash']}"
            #     }
            
        except Exception as e:
            raise Exception(f"IPFS upload failed: {str(e)}")
    
    async def download_file(self, ipfs_hash: str) -> bytes:
        """
        Download file from IPFS
        """
        try:
            # Production code:
            # async with httpx.AsyncClient() as client:
            #     response = await client.get(
            #         f"{self.gateway_url}/ipfs/{ipfs_hash}",
            #         timeout=30.0
            #     )
            #     return response.content
            
            # For demo purposes
            raise NotImplementedError("IPFS download - integrate with IPFS node")
            
        except Exception as e:
            raise Exception(f"IPFS download failed: {str(e)}")
    
    async def pin_file(self, ipfs_hash: str) -> bool:
        """
        Pin file to ensure it stays on IPFS
        """
        try:
            # Production code:
            # async with httpx.AsyncClient() as client:
            #     response = await client.post(
            #         f"{self.api_url}/api/v0/pin/add",
            #         params={"arg": ipfs_hash}
            #     )
            #     return response.status_code == 200
            
            return True
            
        except Exception as e:
            raise Exception(f"IPFS pinning failed: {str(e)}")
    
    async def unpin_file(self, ipfs_hash: str) -> bool:
        """
        Unpin file from IPFS
        """
        try:
            # Production code:
            # async with httpx.AsyncClient() as client:
            #     response = await client.post(
            #         f"{self.api_url}/api/v0/pin/rm",
            #         params={"arg": ipfs_hash}
            #     )
            #     return response.status_code == 200
            
            return True
            
        except Exception as e:
            raise Exception(f"IPFS unpinning failed: {str(e)}")
    
    def _calculate_hash(self, content: bytes) -> str:
        """Calculate SHA-256 hash of content"""
        return hashlib.sha256(content).hexdigest()

ipfs_service = IPFSService()