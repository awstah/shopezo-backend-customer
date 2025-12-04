import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.AWS_S3_BUCKET_NAME!;

  async uploadFile(file: Express.Multer.File, folder: string, entityName: string, acl_access: ObjectCannedACL): Promise<string> {
    const normalizedEntityName = entityName.trim().replace(/\s+/g, '-');
    const extension = path.extname(file.originalname);
    const fileName = `${uuid()}${extension}`;
    const key = `${folder}/${normalizedEntityName}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: acl_access
    });

    await this.s3.send(command);
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
