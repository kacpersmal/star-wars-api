import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DeleteEpisodeRequestDto extends Query<void> {
  @ApiProperty({
    description: 'The unique identifier for the episode',
  })
  @IsUUID()
  @Type(() => String)
  id: string;

  constructor(params?: Partial<DeleteEpisodeRequestDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}
