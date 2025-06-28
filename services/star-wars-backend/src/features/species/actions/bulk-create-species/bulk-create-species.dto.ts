import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class BulkCreateSpeciesItemDto {
  @ApiProperty({
    description: 'The name of the species',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Type(() => String)
  name: string;
}

export class BulkCreateSpeciesBodyDto {
  @ApiProperty({
    description: 'Array of species to create',
    type: [BulkCreateSpeciesItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateSpeciesItemDto)
  species: BulkCreateSpeciesItemDto[];
}

export class BulkCreateSpeciesDto {
  @ApiProperty({
    description: 'Array of created species',
  })
  @Type(() => Array)
  species: Array<{
    id: string;
    name: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  }>;

  @ApiProperty({
    description: 'Number of species created',
  })
  @Type(() => Number)
  count: number;

  constructor(params?: Partial<BulkCreateSpeciesDto>) {
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class BulkCreateSpeciesRequestDto extends Query<BulkCreateSpeciesDto> {
  @ApiProperty({
    description: 'Array of species to create',
    type: [BulkCreateSpeciesItemDto],
  })
  @Type(() => Array)
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  species: BulkCreateSpeciesItemDto[];

  constructor(params?: Partial<BulkCreateSpeciesRequestDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}
