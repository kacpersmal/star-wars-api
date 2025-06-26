import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CharactersService } from '../services/characters.service';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterResponseDto } from '../dto/character-response.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new character' })
  @ApiResponse({ status: 201, type: CharacterResponseDto })
  async create(
    @Body() createCharacterDto: CreateCharacterDto,
  ): Promise<CharacterResponseDto> {
    const character = await this.charactersService.create(createCharacterDto);
    return plainToInstance(CharacterResponseDto, character);
  }

  @Get()
  @ApiOperation({ summary: 'Get all characters' })
  @ApiResponse({ status: 200, type: [CharacterResponseDto] })
  async findAll(
    @Query() query: CharacterQueryDto,
  ): Promise<CharacterResponseDto[]> {
    const characters = await this.charactersService.findAll(query);
    return characters.map((character) =>
      plainToInstance(CharacterResponseDto, character),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character by ID' })
  @ApiResponse({ status: 200, type: CharacterResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CharacterResponseDto> {
    const character = await this.charactersService.findOne(id);
    return plainToInstance(CharacterResponseDto, character);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update character' })
  @ApiResponse({ status: 200, type: CharacterResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ): Promise<CharacterResponseDto> {
    const character = await this.charactersService.update(
      id,
      updateCharacterDto,
    );
    return plainToInstance(CharacterResponseDto, character);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete character' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.charactersService.remove(id);
  }
}
