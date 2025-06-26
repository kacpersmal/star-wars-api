import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, Exclude } from 'class-transformer';

@Exclude()
export class SpeciesDto {
  @ApiProperty({
    description: 'Species ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Species name',
    example: 'Human',
  })
  @Expose()
  name: string;
}

@Exclude()
export class EpisodeDto {
  @ApiProperty({
    description: 'Episode ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Episode title',
    example: 'A New Hope',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Release date',
    example: '1977-05-25',
  })
  @Expose()
  releaseDate: string;
}

@Exclude()
export class CharacterResponseDto {
  @ApiProperty({
    description: 'Character ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Character name',
    example: 'Luke Skywalker',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Species ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  speciesId: string;

  @ApiProperty({
    description: 'Character species',
    type: SpeciesDto,
  })
  @Expose()
  @Type(() => SpeciesDto)
  species: SpeciesDto;

  @ApiProperty({
    description: 'Episodes the character appears in',
    type: [EpisodeDto],
  })
  @Expose()
  @Type(() => EpisodeDto)
  episodes: EpisodeDto[];
}
