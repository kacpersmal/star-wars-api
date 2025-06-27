import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetSpeciesQueryDto extends Query<GetSpeciesDto[]> {
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
    description: 'Number of species to return',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Search term for species name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;

  constructor(params?: Partial<GetSpeciesQueryDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class GetSpeciesDto {
  @ApiProperty({
    description: 'Unique identifier for the species',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the species',
  })
  name: string;
}
