import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authDto } from './dto/auth.dto';
import { JwtGuard } from 'src/guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // sign up
  @Post("signup")
  signup(@Body() dto: authDto) {
    return this.authService.signup(dto)
  }

  // sign in
  @Post("signin")
  signin(@Body() dto: authDto) {
    return this.authService.signin(dto)
  }

  // profile
  @UseGuards(JwtGuard)
  @Get("profile")
  myProfile(@Req() req: any) {
    if (req.user) {
      return { user: req.user, message: "Profile loaded" }
    } else {
      throw new UnauthorizedException("Sign in please")
    }
  }

  // refresh token
  refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token)
  }

  // verify
  @Get("verify")
  verify(@Query("token") token: string) {
    return this.authService.verify(token)
  }

  // log out
  @UseGuards(JwtGuard)
  @Post("logout/:id")
  logout(@Param("id") userId: string) {
    return this.authService.logout(userId);
  }
}
