import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSpeciesDto {
  @ApiProperty({
    description: 'The unique identifier for the species',
  })
  @Type(() => String)
  id: string;

  @ApiProperty({
    description: 'The name of the species',
  })
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'The date when the species was created',
  })
  @Type(() => Date)
  createdAt: Date | null;

  @ApiProperty({
    description: 'The date when the species was last updated',
  })
  @Type(() => Date)
  updatedAt: Date | null;

  constructor(params?: Partial<CreateSpeciesDto>) {
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class CreateSpeciesBodyDto {
  @ApiProperty({
    description: 'The name of the species',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Type(() => String)
  name: string;
}

export class CreateSpeciesRequestDto extends Query<CreateSpeciesDto> {
  @ApiProperty({
    description: 'The name of the species',
  })
  @Type(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  constructor(params?: Partial<CreateSpeciesRequestDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}
