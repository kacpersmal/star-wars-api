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
import { GetSpeciesQueryDto, GetSpeciesDto } from './actions/get-species';
import {
  GetSpeciesByIdDto,
  GetSpeciesByIdQueryDto,
} from './actions/get-species-by-id';
import {
  CreateSpeciesDto,
  CreateSpeciesRequestDto,
  CreateSpeciesBodyDto,
} from './actions/create-species';
import {
  UpdateSpeciesDto,
  UpdateSpeciesRequestDto,
  UpdateSpeciesBodyDto,
} from './actions/update-species';
import { DeleteSpeciesRequestDto } from './actions/delete-species';

@ApiTags('Species')
@Controller('species')
export class SpeciesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all species' })
  @ApiResponse({
    status: 200,
    description: 'List of species',
    type: [GetSpeciesDto],
  })
  async getSpecies(
    @Query() query: GetSpeciesQueryDto,
  ): Promise<GetSpeciesDto[]> {
    return this.queryBus.execute(new GetSpeciesQueryDto(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get species by ID' })
  @ApiResponse({
    status: 200,
    description: 'Species details',
    type: GetSpeciesByIdDto,
  })
  async getSpeciesById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetSpeciesByIdDto> {
    return this.queryBus.execute(new GetSpeciesByIdQueryDto({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Create species' })
  @ApiResponse({ status: 201, type: CreateSpeciesDto })
  async create(@Body() body: CreateSpeciesBodyDto): Promise<CreateSpeciesDto> {
    return this.queryBus.execute(new CreateSpeciesRequestDto(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update species' })
  @ApiResponse({ status: 200, type: UpdateSpeciesDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSpeciesBodyDto,
  ): Promise<UpdateSpeciesDto> {
    return this.queryBus.execute(new UpdateSpeciesRequestDto({ ...body, id }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete species' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.queryBus.execute(new DeleteSpeciesRequestDto({ id }));
  }
}
