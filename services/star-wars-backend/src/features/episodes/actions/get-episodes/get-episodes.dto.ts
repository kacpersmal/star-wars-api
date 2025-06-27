import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetEpisodesQueryDto extends Query<GetEpisodesDto[]> {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Number of episodes to return',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Search term for episode title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;

  constructor(params?: Partial<GetEpisodesQueryDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class GetEpisodesDto {
  @ApiProperty({
    description: 'Unique identifier for the episode',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the episode',
  })
  title: string;

  @ApiProperty({
    description: 'Release date of the episode',
  })
  releaseDate: string;
}
