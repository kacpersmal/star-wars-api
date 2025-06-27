import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DeleteSpeciesRequestDto extends Query<void> {
  @ApiProperty({
    description: 'The unique identifier for the species',
  })
  @Type(() => String)
  @IsUUID()
  id: string;

  constructor(params?: Partial<DeleteSpeciesRequestDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}
