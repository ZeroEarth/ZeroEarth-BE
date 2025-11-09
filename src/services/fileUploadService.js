const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
} = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const CustomError = require("../utils/customError")


  
class FileUploadService {
    constructor() {
      this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  
      if (!this.accountName || !this.accountKey || !this.containerName) {
        // throw new Error('Azure Blob Storage credentials or container name not set in environment');
        throw new CustomError("Invalid File upload credentials", 409);
      }
  
      this.sharedKeyCredential = new StorageSharedKeyCredential(
        this.accountName,
        this.accountKey
      );
  
      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`,
        this.sharedKeyCredential
      );
    }
  
    async generateUploadUrl(filename) {
        try {
            const ext = path.extname(filename);          
            const base = path.basename(filename, ext);
            const timestamp = Date.now();
            const random = uuidv4();
        
            const fileName = `${base}_${timestamp}_${random}${ext}`;
            const blobName = `${fileName}`;
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        
            // Ensure container exists
            const exists = await containerClient.exists();
            if (!exists) {
                await containerClient.create();
            }
        
            const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        
            const sasToken = generateBlobSASQueryParameters({
                containerName: this.containerName,
                blobName,
                permissions: BlobSASPermissions.parse('cw'), // create + write
                expiresOn,
            }, this.sharedKeyCredential).toString();
        
            const url = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
            return {
                upload_url: url,
                path: blobName
            }
        } catch (error) {
            console.error('Error generating upload URL:', error);
            throw (error)
        }
      }
  }
  
  module.exports = FileUploadService;
  