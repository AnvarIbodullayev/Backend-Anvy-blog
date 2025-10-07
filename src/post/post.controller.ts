import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { JwtGuard } from 'src/guard/jwt.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  // create
  @Throttle({ short: { ttl: 1000, limit: 3 } })
  @UseGuards(JwtGuard)
  @Post("create")
  create(@Body() dto: PostDto, @Req() req: any) {
    return this.postService.create(dto, req.user)
  }

  // get all posts
  @Throttle({ long: { ttl: 60000, limit: 100 } })
  @Get()
  getAllPosts() {
    return this.postService.getAllPosts()
  }

  // get my posts
  @UseGuards(JwtGuard)
  @Get("my")
  getByPosts(@Req() req: any) {
    return this.postService.getByPosts(req.user)
  }

  // get a single post by id
  @Get(":id")
  getPostById(@Param("id") postId: string) {
    return this.postService.getPostById(postId)
  }

}
