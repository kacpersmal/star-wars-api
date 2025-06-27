import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetEpisodesQueryDto, GetEpisodesDto } from './actions/get-episodes';
import {
  GetEpisodeByIdDto,
  GetEpisodeByIdQueryDto,
} from './actions/get-episode-by-id';
import {
  CreateEpisodeDto,
  CreateEpisodeRequestDto,
  CreateEpisodeBodyDto,
} from './actions/create-episode';
import {
  UpdateEpisodeDto,
  UpdateEpisodeRequestDto,
  UpdateEpisodeBodyDto,
} from './actions/update-episode';
import { DeleteEpisodeRequestDto } from './actions/delete-episode';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all episodes' })
  @ApiResponse({
    status: 200,
    description: 'List of episodes',
    type: [GetEpisodesDto],
  })
  async getEpisodes(
    @Query() query: GetEpisodesQueryDto,
  ): Promise<GetEpisodesDto[]> {
    return this.queryBus.execute(new GetEpisodesQueryDto(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get episode by ID' })
  @ApiResponse({
    status: 200,
    description: 'Episode details',
    type: GetEpisodeByIdDto,
  })
  async getEpisodeById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetEpisodeByIdDto> {
    return this.queryBus.execute(new GetEpisodeByIdQueryDto({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Create episode' })
  @ApiResponse({ status: 201, type: CreateEpisodeDto })
  async create(@Body() body: CreateEpisodeBodyDto): Promise<CreateEpisodeDto> {
    return this.queryBus.execute(new CreateEpisodeRequestDto(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update episode' })
  @ApiResponse({ status: 200, type: UpdateEpisodeDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEpisodeBodyDto,
  ): Promise<UpdateEpisodeDto> {
    return this.queryBus.execute(new UpdateEpisodeRequestDto({ ...body, id }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete episode' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.queryBus.execute(new DeleteEpisodeRequestDto({ id }));
  }
}
