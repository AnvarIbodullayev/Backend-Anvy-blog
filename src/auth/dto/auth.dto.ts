import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class authDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: "Raid" })
    username?: string;

    @IsString()
    @IsEmail()
    @ApiProperty({ example: "Raid@gamil.com" })
    email: string;

    @IsString()
    @MinLength(4)
    password: string;
}