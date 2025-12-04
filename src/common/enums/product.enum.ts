export enum ACL_ACCESS {
    PRIVATE = 'private',
    AUTHENTICATED_READ = 'authenticated-read',
    AWS_AXEC_READ = 'aws-exec-read',
    BUCKET_OWNER_FULL_CONTROL = 'bucket-owner-full-control',
    BUCKET_OWNER_READ = 'bucket-owner-read',
    PUBLIC_READ = 'public-read',
    PUBLIC_READ_WRITE = 'public-read-write',
}

export enum ProductStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ADMIN = 'admin',
}

export enum UploadJobStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}