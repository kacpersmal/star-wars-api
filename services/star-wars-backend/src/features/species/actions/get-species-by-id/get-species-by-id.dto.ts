import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class GetSpeciesByIdQueryDto extends Query<GetSpeciesByIdDto> {
  @ApiProperty({
    description: 'The unique identifier for the species',
  })
  @IsUUID()
  @Type(() => String)
  id: string;

  constructor(params?: Partial<GetSpeciesByIdQueryDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class GetSpeciesByIdDto {
  @ApiProperty({
    description: 'The unique identifier for the species',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the species',
  })
  name: string;

  @ApiProperty({
    description: 'The date when the species was created',
  })
  createdAt: Date | null;

  @ApiProperty({
    description: 'The date when the species was last updated',
  })
  updatedAt: Date | null;

  constructor(params?: Partial<GetSpeciesByIdDto>) {
    if (params) {
      Object.assign(this, params);
    }
  }
}
