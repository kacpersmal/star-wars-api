import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateEpisodeRequestDto extends Query<UpdateEpisodeDto> {
  @ApiProperty({
    description: 'The unique identifier for the episode',
  })
  @IsUUID()
  @Type(() => String)
  id: string;

  @ApiProperty({
    description: 'The name of the episode',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Type(() => String)
  name?: string;

  @ApiProperty({
    description: 'The release date of the episode in YYYY-MM-DD format',
    example: '1977-05-25',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => String)
  releaseDate?: string;

  constructor(params?: Partial<UpdateEpisodeRequestDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class UpdateEpisodeBodyDto {
  @ApiProperty({
    description: 'The name of the episode',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Type(() => String)
  name?: string;

  @ApiProperty({
    description: 'The release date of the episode in YYYY-MM-DD format',
    example: '1977-05-25',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => String)
  releaseDate?: string;
}

export class UpdateEpisodeDto {
  @ApiProperty({
    description: 'The unique identifier for the episode',
  })
  @Type(() => String)
  id: string;

  @ApiProperty({
    description: 'The name of the episode',
  })
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'The release date of the episode in YYYY-MM-DD format',
    example: '1977-05-25',
  })
  @Type(() => String)
  releaseDate: string | null;

  @ApiProperty({
    description: 'The date when the episode was created',
  })
  @Type(() => Date)
  createdAt: Date | null;

  @ApiProperty({
    description: 'The date when the episode was last updated',
  })
  @Type(() => Date)
  updatedAt: Date | null;

  constructor(params?: Partial<UpdateEpisodeDto>) {
    if (params) {
      Object.assign(this, params);
    }
  }
}
