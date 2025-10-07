import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostDto } from './dto/post.dto';
import { CreatePostPayload } from 'src/types/createPost.type';

@Injectable()
export class PostService {
    constructor(private readonly prisma: PrismaService) { }

    // get all posts
    async getAllPosts() {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" }
        })

        return { message: "All posts came", posts }
    }

    // create post
    async create(dto: PostDto, user: CreatePostPayload) {
        const existUser = await this.prisma.user.findUnique({
            where: { id: user.userId }
        })
        if (!existUser) throw new NotFoundException("User not found")

        await this.prisma.post.create({
            data: {
                title: dto.title,
                content: dto.content,
                image: dto.image,
                userId: user.userId,
            }
        })

        return { message: "Post created successfuly" }
    }

    // my posts
    async getByPosts(user: any) {
        console.log(user);
        const existUser = await this.prisma.user.findUnique({
            where: { id: user.userId }
        })
        if (!existUser) throw new NotFoundException("User not found")

        const myPosts = await this.prisma.post.findMany({
            where: { userId: user.userId }
        })
        return { message: 'Fresh all your posts came', myPosts };

    }

    // get a single post by id
    async getPostById(postId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: {
                User: {
                    select: { username: true }
                }
            }
        })
        if (!post) throw new NotFoundException("Post not found")

        return { post }
    }

    // delete post
}
