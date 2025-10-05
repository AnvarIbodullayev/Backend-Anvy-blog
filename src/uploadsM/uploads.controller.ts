import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('uploads')
export class UploadsController {
    constructor(private prisma: PrismaService) { }

    @Throttle({ medium: { ttl: 10000, limit: 20 } })
    @Post("avatar/:id")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    callback(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
                if (allowedMimeTypes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new Error("Only JPG, JPEG, and PNG files are allowed!"), false);
                }
            },
            limits: {
                fileSize: 2 * 1024 * 1024, // maksimal 2MB
            },
        })
    )

    async uploadAvatar(@Param("id") userId: string, @UploadedFile() file: Express.Multer.File) {
        const avatarUrl = `/uploads/${file.filename}`;

        await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: file.filename }
        });

        return {
            message: 'Avatar updated successfully',
            avatarUrl
        };
    }
}
