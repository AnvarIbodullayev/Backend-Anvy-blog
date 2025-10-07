import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    image: string;
}