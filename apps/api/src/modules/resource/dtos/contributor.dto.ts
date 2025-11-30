import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContributorDto {
    @ApiProperty({ description: 'User ID of the contributor' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Role of the contributor (e.g., Developer, Artist, Tester)' })
    @IsString()
    @IsNotEmpty()
    role: string;
}

export class UpdateContributorDto {
    @ApiProperty({ description: 'New role for the contributor' })
    @IsString()
    @IsNotEmpty()
    role: string;
}
