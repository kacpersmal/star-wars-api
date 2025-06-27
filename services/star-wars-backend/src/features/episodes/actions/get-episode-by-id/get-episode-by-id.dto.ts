import { Query } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class GetEpisodeByIdQueryDto extends Query<GetEpisodeByIdDto> {
  @ApiProperty({
    description: 'The unique identifier for the episode',
  })
  @IsUUID()
  @Type(() => String)
  id: string;

  constructor(params?: Partial<GetEpisodeByIdQueryDto>) {
    super();
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class GetEpisodeByIdDto {
  @ApiProperty({
    description: 'The unique identifier for the episode',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the episode',
  })
  name: string;

  @ApiProperty({
    description: 'The release date of the episode',
  })
  releaseDate: string;
}
